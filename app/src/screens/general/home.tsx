import React, { useEffect, useState } from 'react';
import { BigButton } from '../../components/BigButton';
import { TColors } from '../../style/colors';
import { PageTemplate, usePageContext } from '../../components/PageTemplate';
import i18n from '../../localization/i18n';
import { Modal } from '../../components/Modal';
import { SmallButton } from '../../components/SmallButton';
import { Database } from '../../db/Database';

/**
 * Debug flag to enable development mode
 */
const debug = false;
const server_url = '';
const testsPerDay = 23;

/**
 * HomeScreen Component
 *
 * Main PWA home screen responsible for:
 * - Handling app installation prompt and iOS hints
 * - Managing microphone permissions
 * - Managing test codes and flow
 * - Checking for stored tests and symptoms in the database
 * - Uploading tests to the server
 * - Conditional rendering based on user progress
 */
const HomeScreen: React.FC = () => {
  // Access translation, styles, and navigation context
  const { t, styles, navigate } = usePageContext(customStyles);

  // Microphone permission states
  const [micDenied, setMicDenied] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Test code and validation state
  const [testCode, setTestCode] = useState('');
  const [validTestCode, setTestCodeValid] = useState(false);

  // Installation flow states
  const [showInstallButton, setShowInstallButton] = useState(true);
  const [isWeb, setIsWeb] = useState(!debug);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Database-related states
  const [testsExist, setTestsExist] = useState(false);
  const [symptomsExist, setSymptomsExist] = useState(false);

  // Test flow states
  const [testStarted, setTestStarted] = useState(false);
  const [isTestTime, setIsTestTime] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [hasMissingTest, setHasMissingTest] = useState(false);

  // Upload message state
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  /**
   * Change application language
   */
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  /**
   * Initial setup useEffect
   * - Detects if app runs standalone
   * - Detects iOS devices
   * - Checks database for stored tests and symptoms
   * - Sets up installation prompt listener
   */
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);

    if (isStandalone || debug) {
      // App is running as PWA
      setIsWeb(false);
      setShowInstallButton(false);

      // Record installation date if not already present
      if (!localStorage.getItem('appInstallDate')) {
        localStorage.setItem('appInstallDate', new Date().toISOString());
      }

      // Load any saved test code
      checkSavedCode();

      // Check if tests exist in the database
      const checkDB = async () => {
        const db = Database.getInstance();
        const tests = await db.getAll('tests');
        setTestsExist(tests.length > 0);
      };
      checkDB();

      // Check if any symptoms have been recorded
      const checkSymptoms = async () => {
        const db = Database.getInstance();
        const count = await db.count('symptoms');
        setSymptomsExist(count > 0);
      };
      checkSymptoms();

      // Determine if test period has started
      const storedDate = localStorage.getItem('testStartDate');
      if (storedDate) {
        const today = new Date();
        const startDate = new Date(storedDate);

        if (today >= startDate) {
          setTestStarted(true);
        }
      }
    } else {
      // Not standalone, hide install button if appInstallDate exists
      if (localStorage.getItem('appInstallDate') !== null) {
        setShowInstallButton(false);
      }
    }

    // Handle beforeinstallprompt event
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Handle appinstalled event
    window.addEventListener('appinstalled', () => {
      if (!localStorage.getItem('appInstallDate')) {
        localStorage.setItem('appInstallDate', new Date().toISOString());
      }

      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  /**
   * useEffect to manage test flow timing
   * - Checks current test number
   * - Determines if a test is due
   * - Updates state for missing tests and test availability
   */
  useEffect(() => {
    if (!testStarted) return;

    async function checkTestFlow() {
      let testNumberStr = localStorage.getItem('testNumber');
      if (!testNumberStr) {
        setIsTestTime(false);
        return;
      }

      let currentTestNumber = parseInt(testNumberStr, 10);
      if (isNaN(currentTestNumber) || currentTestNumber < 1) {
        setIsTestTime(false);
        return;
      }

      const testStartDateStr = localStorage.getItem('testStartDate');
      if (!testStartDateStr) return;
      const testStartDate = new Date(testStartDateStr);

      const now = new Date();
      const today = new Date(new Date().toDateString());
      const diffDays = Math.floor((today.getTime() - testStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const expectedTestsTillYesterday = diffDays * testsPerDay;

      let expectedTestsToday = 0;
      for (let i = 1; i <= testsPerDay; i++) {
        const testIndex = diffDays * testsPerDay + i;
        const markerTimeStr = localStorage.getItem(`markerTestTime${testIndex}`);
        if (!markerTimeStr) continue;

        const [h, m, s] = markerTimeStr.split(':').map(Number);
        const markerTime = new Date();
        markerTime.setHours(h, m, s, 0);

        if (markerTime.getTime() + 5 * 60 * 1000 <= now.getTime()) {
          expectedTestsToday++;
        }
      }

      const expectedTestsTillNow = expectedTestsTillYesterday + expectedTestsToday;

      // Mark missing tests in localStorage
      for (let i = 1; i <= expectedTestsTillNow; i++) {
        const status = localStorage.getItem(`markerStatus${i}`);
        if (!status) {
          localStorage.setItem(`markerStatus${i}`, 'missed');
        }
      }

      // Determine last completed test
      let doneTests = 0;
      for (let i = expectedTestsTillNow; i > 0; i--) {
        if (localStorage.getItem(`markerStatus${i}`)) {
          doneTests = i;
          break;
        }
      }

      // Update current test number if needed
      if (doneTests + 1 > currentTestNumber) {
        currentTestNumber = doneTests + 1;
        localStorage.setItem('testNumber', currentTestNumber.toString());
      }

      // Determine if last test was missed
      if (currentTestNumber > 1) {
        const prevStatus = localStorage.getItem(`markerStatus${currentTestNumber - 1}`);
        if (prevStatus === 'missed') {
          setHasMissingTest(true);
        } else if (prevStatus === 'done' && currentTestNumber > 2) {
          const prePrevStatus = localStorage.getItem(`markerStatus${currentTestNumber - 2}`);
          setHasMissingTest(prePrevStatus === 'missed');
        } else {
          setHasMissingTest(false);
        }
      } else {
        setHasMissingTest(false);
      }

      // Check if current test time has arrived
      const markerTimeStr = localStorage.getItem(`markerTestTime${currentTestNumber}`);
      if (!markerTimeStr) {
        setIsTestTime(false);
        return;
      }

      const [h, m, s] = markerTimeStr.split(':').map(Number);
      const markerTime = new Date();
      markerTime.setHours(h, m, s, 0);

      const diffSeconds = (markerTime.getTime() - now.getTime()) / 1000;
      setIsTestTime(Math.abs(diffSeconds) <= 5 * 60);
    }

    checkTestFlow();
    const interval = setInterval(checkTestFlow, 10000);

    return () => clearInterval(interval);
  }, [testStarted]);

  /**
   * useEffect to determine whether sleep tracking UI should be shown
   */
  useEffect(() => {
    function checkSleepDate() {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastSleepDate = localStorage.getItem('lastSleepDate');

      if (!lastSleepDate || lastSleepDate !== todayStr) {
        setShowSleep(true);
      }
    }

    checkSleepDate();
  }, []);

  /**
   * Prompt user to install the PWA
   */
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  /**
   * Wrapper component for the install button
   */
  const InstallButtonWrapper: React.FC<{
    deferredPrompt: BeforeInstallPromptEvent | null;
    onInstallClick: () => void;
  }> = ({ onInstallClick }) => {
    return <BigButton onClick={onInstallClick} text={t('screens.home.install')} style={{ margin: '0 auto' }} />;
  };

  /**
   * Start a test after obtaining microphone permission
   */
  function startTest() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Stop microphone tracks immediately after permission is granted
        stream.getTracks().forEach((track) => track.stop());
        navigate('/q/duration', { replace: true });
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          setMicDenied(true);
        } else {
          setMicError(err.message);
        }
      });
  }

  /**
   * Validate the entered test code against the server
   */
  function validateCode() {
    if (!testCode) {
      alert(t('components.alert.missing_code'));
      return;
    }

    fetch(`${server_url}/check_code.php?code=${encodeURIComponent(testCode)}`)
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          if (res.status === 404) {
            alert(t('components.alert.wrong_code'));
            return;
          } else {
            throw new Error(`HTTP Error ${res.status}`);
          }
        }

        try {
          const data = JSON.parse(text);

          if (!data.error) {
            Object.entries(data).forEach(([key, value]) => {
              const storedValue = typeof value === 'string' ? value : JSON.stringify(value);
              localStorage.setItem(key, storedValue);
            });
            localStorage.setItem('testNumber', '1');
            setTestCodeValid(true);
            if (localStorage.getItem('language') === 'ger') localStorage.setItem('language', 'de');
            changeLanguage(localStorage.getItem('language') ?? 'en');
            alert(t('components.alert.success'));
          } else {
            alert(t('components.alert.error', { error: data.error }));
          }
        } catch (err) {
          alert(t('components.alert.internal_error'));
          console.error(err);
        }
      })
      .catch((err) => {
        console.error(err);
        alert(t('components.alert.server_error'));
      });
  }

  /**
   * Load any previously saved test code
   */
  function checkSavedCode() {
    const savedCode = localStorage.getItem('markerIdentifier');

    if (savedCode != null) {
      setTestCode(savedCode);
      setTestCodeValid(true);
    }
  }

  /**
   * Convert base64 encoded string to Blob
   */
  const base64ToBlob = (base64: string, mime: string) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mime });
  };

  /**
   * Upload all tests stored in the database to the server
   */
  const uploadTests = async () => {
    const db = Database.getInstance();
    const tests = await db.getAll('tests');

    if (tests.length === 0) {
      setUploadMessage(t('components.upload.no_test'));
      return;
    }

    const formData = new FormData();

    for (const test of tests) {
      const timestamp = test.testDoneAt ? parseDateString(test.testDoneAt).getTime() : Date.now();
      const testNumber = test.testNumber ?? '';

      const extractBase64Files = (obj: any, parentKey = '') => {
        for (const key of Object.keys(obj)) {
          const value = obj[key];
          if (typeof value === 'string' && value.startsWith('data:audio/')) {
            const extMatch = value.match(/^data:audio\/(\w+);base64,/);
            const ext = extMatch ? extMatch[1] : 'webm';
            const filename = `${timestamp}_${key}_${testNumber}.${ext}`;
            formData.append('files[]', base64ToBlob(value, `audio/${ext}`), filename);
            obj[key] = undefined;
          } else if (typeof value === 'object' && value !== null) {
            extractBase64Files(value, key);
          }
        }
      };

      extractBase64Files(test);

      const jsonBlob = new Blob([JSON.stringify(test)], { type: 'application/json' });
      const jsonFilename = `${timestamp}_test_${testNumber}.json`;
      formData.append('files[]', jsonBlob, jsonFilename);
    }

    const markerIdentifier = localStorage.getItem('markerIdentifier') || 'unknown';
    formData.append('code', markerIdentifier);

    try {
      const response = await fetch(`${server_url}/upload.php`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        setUploadMessage(t('components.upload.successful'));

        await db.clear('tests');
        setTestsExist(false);
      } else {
        setUploadMessage(`${t('components.upload.server_error')}: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setUploadMessage(t('components.upload.internal_error'));
    }
  };

  /**
   * Parse a date string in the format "DD.MM.YYYY, HH:MM:SS" to a Date object
   */
  const parseDateString = (str: string) => {
    const [datePart, timePart] = str.split(', ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  /**
   * Render installation prompt or hint for iOS
   */
  function installView() {
    if (showInstallButton) {
      return isIOS ? <p>{t('screens.home.install_ios_hint')}</p> : <InstallButtonWrapper deferredPrompt={deferredPrompt} onInstallClick={handleInstallClick} />;
    } else {
      return <p>{t('screens.home.open_app')}</p>;
    }
  }

  /**
   * Modal shown if microphone access is denied
   */
  function micDeniedView() {
    return (
      <Modal title={t('screens.home.permission.mic.title')} text={t('screens.home.permission.mic.info')}>
        <SmallButton text={t('screens.home.permission.confirm')} onClick={() => setMicDenied(false)} style={styles.neutralButton} />
      </Modal>
    );
  }

  /**
   * Modal shown for other microphone errors
   */
  function micErrorView(micError: string | undefined) {
    return (
      <Modal title={t('screens.home.permission.error_title')} text={micError}>
        <SmallButton text={t('screens.home.permission.error_close')} onClick={() => setMicError(null)} style={styles.neutralButton} />
        <SmallButton text={t('screens.home.permission.error_refresh')} onClick={() => window.location.reload()} style={styles.neutralButton} />
      </Modal>
    );
  }

  /**
   * Main render block
   * - PageTemplate provides common layout
   * - Conditional rendering based on installation status, test code, test flow, and other state variables
   */
  return (
    <>
      <PageTemplate>
        <div style={styles.pageContainer}>
          <div style={styles.content}>
            <img src={require('../../images/covision_logo.png')} style={{ maxHeight: '200px', height: '15vh', marginBottom: '20px' }} alt="Covision Logo" />

            <div style={styles.mainMenuContainer}>
              {isWeb ? (
                installView()
              ) : (
                <>
                  {!validTestCode ? (
                    // 1. Input for test code
                    <>
                      <input
                        type="text"
                        placeholder={t('screens.home.enter_code')}
                        value={testCode}
                        onChange={(e) => setTestCode(e.target.value)}
                        style={styles.input}
                      />
                      <BigButton onClick={validateCode} text={t('screens.home.button.validate')} style={styles.buttonTest} />
                    </>
                  ) : !symptomsExist ? (
                    // 2. Navigate to symptoms input
                    <BigButton onClick={() => navigate('/symptoms', { replace: true })} text={t('screens.home.button.symptoms')} style={styles.buttonTest} />
                  ) : !testStarted ? (
                    // 3. Demo & ready for test
                    <>
                      <BigButton onClick={startTest} text={t('screens.home.button.demo')} style={styles.buttonTest} />
                      {testsExist && (
                        <BigButton onClick={uploadTests} text={t('screens.home.button.export')} style={{ ...styles.buttonTest, marginTop: '20px' }} />
                      )}
                    </>
                  ) : isTestTime ? (
                    // 4. Start test button when test time has arrived
                    <BigButton onClick={startTest} text={t('screens.home.button.start')} style={styles.buttonTest} />
                  ) : (
                    // 5. Actions beside test (sleep, missed test, export)
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {showSleep && (
                        <BigButton onClick={() => navigate('/q/sleep', { replace: true })} text={t('screens.home.button.sleep')} style={styles.buttonTest} />
                      )}
                      {hasMissingTest && (
                        <BigButton
                          onClick={() => navigate('/no-test-previous', { replace: true })}
                          text={t('screens.home.button.missed')}
                          style={styles.buttonTest}
                        />
                      )}
                      {testsExist && <BigButton onClick={uploadTests} text={t('screens.home.button.export')} style={styles.buttonTest} />}
                    </div>
                  )}
                </>
              )}
            </div>

            {uploadMessage && <pre style={{ marginTop: '1em', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{uploadMessage}</pre>}
          </div>
        </div>
      </PageTemplate>

      {micDenied && micDeniedView()}
      {micError && micErrorView(micError)}
    </>
  );
};

export default HomeScreen;

/**
 * Custom styles for the HomeScreen component
 */
const customStyles = (colors: TColors) => ({
  languageContainer: {
    marginBottom: '5vh',
    marginTop: '3vh',
    display: 'flex',
    gap: '2vw',
    justifyContent: 'center',
  },
  languageButton: {
    padding: '0.1em 0.4em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '0.3em',
    fontSize: '1.2rem',
  },
  mainMenuContainer: {
    position: 'absolute',
    top: '60%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    width: '80vw',
    maxWidth: '400px',
  },
  input: {
    padding: '0.8em',
    fontSize: '1rem',
    width: '80%',
    marginBottom: '2vh',
    borderRadius: '0.5em',
    border: `1px solid ${colors.gray}`,
    textAlign: 'center' as const,
  },
  buttonTest: {
    margin: '0 auto',
  },
});
