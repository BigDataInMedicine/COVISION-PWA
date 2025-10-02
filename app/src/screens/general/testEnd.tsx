import React, { useEffect, useRef } from 'react';
import { TColors } from '../../style/colors';
import { BigButton } from '../../components/BigButton';
import { PageTemplate, usePageContext } from '../../components/PageTemplate';
import { useTheme } from '../../context/ThemeContext';
import { UAParser } from 'ua-parser-js';
import { Database } from '../../db/Database';

/**
 * TestEndScreen Component
 *
 * Final screen after a test session. Saves session data to IndexedDB and handles exit logic.
 * Captures end reason, remaining time, device info and test metadata.
 * Navigates to home after completion.
 */
const TestEndScreen: React.FC = () => {
  const { remaining, stopTimer } = useTheme();
  const { t, styles, navigate, location } = usePageContext(customStyles);

  const routeParams = (location.state as { timesup?: boolean; initialDuration?: number; exit?: boolean }) || {};

  const remainingRef = useRef(remaining);
  const exitRef = useRef(routeParams.exit);
  const stopTimerRef = useRef(stopTimer);
  const savedRef = useRef(false);

  /**
   * On mount: Save end reason, device info, and session data to storage.
   * If test was active, save to IndexedDB and update marker status.
   * Stops the timer and cleans up session data.
   */
  useEffect(() => {
    if (sessionStorage.getItem('sleep') === null && sessionStorage.getItem('no_test_previous') === null && sessionStorage.getItem('noTestNow') === null) {
      if (exitRef.current) {
        if (remainingRef.current != null) {
          sessionStorage.setItem('remainingTimeInSeconds', remainingRef.current.toString());
        } else {
          sessionStorage.setItem('remainingTimeInSeconds', '0');
        }

        sessionStorage.setItem('endReason', 'exit');
      } else if (remainingRef.current != null) {
        sessionStorage.setItem('remainingTimeInSeconds', remainingRef.current.toString());
        sessionStorage.setItem('endReason', 'finished');
      } else {
        sessionStorage.setItem('remainingTimeInSeconds', '0');
        sessionStorage.setItem('endReason', "time's up");
      }
    }

    const parser = new UAParser();
    const result = parser.getResult();

    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem('device_id', deviceId);
    }

    sessionStorage.setItem('device_informations', JSON.stringify(result));
    sessionStorage.setItem('device_id', deviceId);
    sessionStorage.setItem('testDoneAt', new Date().toLocaleString());

    if (sessionStorage.getItem('durationInMinutes') != null || sessionStorage.getItem('sleep') != null || sessionStorage.getItem('no_test_previous') != null) {
      if (!savedRef.current) {
        saveSessionInIndexed();
        savedRef.current = true;
      }
    }

    stopTimerRef.current();
  }, []);

  /**
   * Saves all collected test data to the local IndexedDB database.
   * Updates test status markers and cleans up sessionStorage.
   * Handles demo vs. real test flow based on test start date.
   */
  async function saveSessionInIndexed() {
    const storedDate = localStorage.getItem('testStartDate');
    let testStarted = false;
    if (storedDate) {
      const today = new Date();
      const startDate = new Date(storedDate);

      if (today >= startDate) {
        testStarted = true;
      }
    }

    if (sessionStorage.getItem('durationInMinutes') !== null && sessionStorage.getItem('durationInMinutes') !== '0') {
      if (testStarted) {
        sessionStorage.setItem('testNumber', localStorage.getItem('testNumber') ?? '0');
      } else {
        if (localStorage.getItem('testStartDate') === null) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateString = tomorrow.toISOString().split('T')[0];
          localStorage.setItem('testStartDate', dateString);
        }

        sessionStorage.setItem('testNumber', 'demo');
      }
    }

    const keys = [
      'activities',
      'durationInMinutes',
      'endReason',
      'fatigue1',
      'fatigue2',
      'last_survey_opinion',
      'mood',
      'performance',
      'recovery',
      'remainingTimeInSeconds',
      'substances',
      'symptomsMental',
      'symptomsPhysical',
      'matching',
      'stroopAudio',
      'stroopWordCount',
      'stroopWords',
      'memoryAudio',
      'memoryWords',
      'testDoneAt',
      'no_test_previous',
      'noTestNow',
      'sleep',
      'device_informations',
      'device_id',
      'testNumber',
    ];

    const obj: Record<string, any> = {};
    keys.forEach((key) => {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        try {
          obj[key] = JSON.parse(value);
        } catch {
          obj[key] = value;
        }
      }
    });

    if (Object.keys(obj).length > 0) {
      const db = Database.getInstance();
      const markerIdentifier = localStorage.getItem('markerIdentifier') ?? '';
      if (testStarted || markerIdentifier.includes('Demo')) {
        await db.add('tests', obj);
        keys.forEach((key) => sessionStorage.removeItem(key));

        if (testStarted && sessionStorage.getItem('durationInMinutes') !== null) {
          const testNumber = localStorage.getItem('testNumber');
          const testNumberInt = parseInt(testNumber ?? '0');
          localStorage.setItem(`markerStatus${testNumberInt}`, 'done');
          localStorage.setItem('testNumber', (testNumberInt + 1).toString());
        }

        if (sessionStorage.getItem('sleep') !== null) {
          const todayStr = new Date().toISOString().split('T')[0];
          localStorage.setItem('lastSleepDate', todayStr);
        }
      }
    }
  }

  /**
   * Navigate back to home screen.
   */
  function endTest() {
    navigate('/', { replace: true });
  }

  /**
   * Renders "Time's up" message if triggered by timer.
   */
  function timesup() {
    if (routeParams.timesup) {
      return (
        <>
          <img src={require('../../images/chronograph.png')} style={{ maxWidth: '40px', width: '15vw' }} alt="" />
          <p style={styles.text}>{t('screens.general.end.timesup', { duration: routeParams.initialDuration?.toString() })}</p>
        </>
      );
    }
  }

  return (
    <PageTemplate>
      <div style={{ paddingTop: 40 }}>
        <div style={styles.content}>
          <h1 style={styles.title}>{t('screens.general.end.headline')}</h1>

          {timesup()}

          <p style={styles.text}>{t('screens.general.end.text')}</p>

          <BigButton
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            onClick={endTest}
            text={t('screens.general.end.button')}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default TestEndScreen;

/**
 * Custom styles for the test end screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
