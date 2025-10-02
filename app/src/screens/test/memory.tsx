import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { SmallButton } from '../../components/SmallButton';
import { BigButton } from '../../components/BigButton';
import Papa from 'papaparse';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../localization/i18n';

/**
 * TestMemoryScreen Component
 *
 * Implements a memory recall task with audio recording.
 * Displays a list of words, then records user's verbal repetition.
 * Loads word list from CSV based on test phase and language.
 * Stores audio and word list in sessionStorage and proceeds to next test.
 */
const TestMemoryScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const didFetch = useRef(false);
  const { gotoNextTest } = useTheme();
  const currentLang = i18n.language;

  const [memoryRunning, setMemoryRunning] = useState(false);
  const [memoryStartTimer, setMemoryStartTimer] = useState(0);
  const [memoryWord, setMemoryWord] = useState('starting...');
  const [memoryFinished, setMemoryFinished] = useState(false);
  const [words, setWords] = useState<string[]>([]);

  const [recordingRunning, setRecordingRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Fetches word list from CSV file based on current language and test phase.
   * Uses Papaparse to parse CSV and extracts words for the current test number.
   * Only runs once via useRef to prevent repeated fetches.
   */
  const fetchWords = useCallback(() => {
    let wordTestNumber = 1;

    let testNumber = localStorage.getItem('testNumber') ?? '';
    let testOrder = localStorage.getItem('markerTestOrder' + testNumber);
    if (testOrder !== null) {
      wordTestNumber = parseInt(testOrder.match(/word(\d+)/i)?.[1] ?? '1');
    }

    fetch(`/tests/${currentLang}.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        const result = Papa.parse(csvText, { header: true, delimiter: ';' });
        if (result.data && result.data.length > 0) {
          const row: any = result.data[wordTestNumber];
          if (row.memoryWordList) {
            const wordList = row.memoryWordList.split(',').map((w: string) => w.trim());
            setWords(wordList);
          }
        }
      })
      .catch((err) => console.error('Error loading csv:', err));
  }, [currentLang]);

  /**
   * Loads word list on mount if not already fetched.
   */
  useEffect(() => {
    if (!didFetch.current) {
      fetchWords();
      didFetch.current = true;
    }
  }, [fetchWords]);

  /**
   * Starts the memory task: countdown → show words → finish.
   * Sets up timer and triggers word display after countdown.
   */
  function startMemory() {
    for (let index = 3; index >= 0; index--) {
      setTimeout(() => {
        setMemoryStartTimer(index);

        if (index === 0) {
          showWords();
        }
      }, (3 - index) * 1000);
    }
  }

  /**
   * Starts displaying words one by one with a delay.
   * Uses test start date to determine if full or partial word list should be shown.
   */
  function showWords() {
    setMemoryRunning(true);
    getMemoryWord();
  }

  /**
   * Displays words sequentially with 1-second intervals.
   * Sets memoryFinished to true after last word.
   */
  function getMemoryWord() {
    const storedDate = localStorage.getItem('testStartDate');
    let testStarted = false;

    if (storedDate) {
      const today = new Date();
      const startDate = new Date(storedDate);

      if (today >= startDate) {
        testStarted = true;
      }
    }

    const wordsToShow = testStarted ? words : words.slice(0, Math.ceil(words.length / 2));

    const wordTime = 1000;
    wordsToShow.forEach((word, index) => {
      setTimeout(() => {
        setMemoryWord(word);
      }, index * wordTime);
    });

    setTimeout(() => {
      setMemoryFinished(true);
    }, wordsToShow.length * wordTime);
  }

  /**
   * Starts audio recording using getUserMedia.
   * Stores stream and MediaRecorder in refs for cleanup.
   */
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingRunning(true);
    } catch (err) {
      console.error('Error recording audio:', err);
    }
  }

  /**
   * Stops recording and saves audio as base64 in sessionStorage.
   * Cleans up stream and recorder.
   * Returns a Promise to ensure async cleanup.
   */
  const stopRecording = useCallback(() => {
    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      const stream = streamRef.current;

      if (!mediaRecorder) {
        stream?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setRecordingRunning(false);
        resolve();
        return;
      }

      mediaRecorder.onstop = null;

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          sessionStorage.setItem('memoryAudio', base64data);
          sessionStorage.setItem('memoryWords', JSON.stringify(words));

          stream?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;

          setRecordingRunning(false);
          resolve();
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.stop();
    });
  }, [words]);

  /**
   * Ensures recording is stopped on unmount.
   */
  useEffect(() => {
    return () => {
      stopRecording().catch(() => {});
    };
  }, [stopRecording]);

  /**
   * Handles end of recording: shows confirmation or stops recording.
   */
  async function endRecording() {
    if (showConfirm) {
      await stopRecording();
    } else {
      setShowConfirm(true);
    }
  }

  /**
   * Proceeds to next test after completion.
   */
  function goNextPage() {
    gotoNextTest();
  }

  /**
   * Renders the introduction screen with instructions and start button.
   */
  function introductionScreen() {
    return (
      <>
        <div style={styles.content}>
          <h1 style={styles.title}>{t('screens.test.memory.title')}</h1>
          <p style={{ ...styles.text }}>{t('screens.test.memory.introduction')}</p>

          <img src={`../../images/memory/recording_${currentLang}.png`} style={{ maxWidth: '200px', width: '60vw' }} alt="" />

          <SmallButton onClick={startMemory} text={t('screens.test.memory.button')} style={{ marginTop: '20px' }} />
        </div>
      </>
    );
  }

  /**
   * Renders the countdown screen (3 → 2 → 1 → Start).
   */
  function timerScreen() {
    return (
      <div style={styles.wordBox}>
        <p style={{ ...styles.wordText, fontSize: 24 }}>{t('screens.test.memory.start_text')}</p>
        <p style={styles.wordText}>{memoryStartTimer}</p>
      </div>
    );
  }

  /**
   * Renders the word display screen.
   */
  function wordScreen() {
    return (
      <div style={styles.wordBox}>
        <p style={styles.wordText}>{memoryWord}</p>
      </div>
    );
  }

  /**
   * Renders the recording phase: intro, recording, or confirmation.
   */
  function repeatScreen() {
    return (
      <div style={{ ...styles.content, marginTop: '20px' }}>{recordingRunning ? repeatRecordingScreen() : showConfirm ? endScreen() : repeatIntroScreen()}</div>
    );
  }

  /**
   * Renders the "Recording ended" screen with next button.
   */
  function endScreen() {
    return (
      <>
        <h1 style={styles.title}>{t('screens.test.memory_repeat.end_title')}</h1>
        <h1 style={styles.text}>{t('screens.test.memory_repeat.end_text')}</h1>
        <div style={styles.wrapper}>
          <SmallButton onClick={goNextPage} text={t('screens.test.memory_repeat.next')} />
        </div>
      </>
    );
  }

  /**
   * Renders the recording introduction screen.
   */
  function repeatIntroScreen() {
    return (
      <>
        <h1 style={styles.headline}>{t('screens.test.memory_repeat.introduction')}</h1>
        <img src={require('../../images/mic_muted.png')} height="70" alt="" style={{ margin: '100px 0' }} />
        <BigButton onClick={startRecording} text={t('screens.test.memory_repeat.recording_start')} />
      </>
    );
  }

  /**
   * Renders the recording screen with stop confirmation.
   */
  function repeatRecordingScreen() {
    return (
      <>
        <h1 style={styles.headline}>{t('screens.test.memory_repeat.recording_hint')}</h1>
        <img src={require('../../images/mic.png')} height="70" alt="" style={{ marginTop: '100px' }} />
        <p style={{ ...styles.text, margin: '20px 0', height: '15vh' }}>{showConfirm ? t('screens.test.memory_repeat.recording_confirm_hint') : ''}</p>
        <BigButton onClick={endRecording} style={{ ...(showConfirm && { marginTop: '100px' }) }} text={t('screens.test.memory_repeat.recording_end')} />
      </>
    );
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      {!memoryFinished ? (memoryRunning ? wordScreen() : memoryStartTimer > 0 ? timerScreen() : introductionScreen()) : repeatScreen()}
    </TestTemplate>
  );
};

export default TestMemoryScreen;

/**
 * Custom styles for the memory test screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({
  title: {
    fontSize: 24,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  wordBox: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
  },
  wordText: {
    fontSize: 48,
    margin: '10px 0px',
    textAlign: 'center' as const,
  },
  wrapper: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
});
