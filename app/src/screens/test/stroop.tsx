import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { SmallButton } from '../../components/SmallButton';
import { TColors } from '../../style/colors';
import { BigButton } from '../../components/BigButton';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../localization/i18n';
import Papa from 'papaparse';

/**
 * TestStroopScreen Component
 *
 * Implements the Stroop color-word interference task with audio recording.
 * Displays color words (e.g., "red" in blue ink) and records user's verbal responses.
 * Uses CSV-based word lists and adjusts time based on test phase.
 * Stores audio, word list, and count in sessionStorage and proceeds to next test.
 */
const TestStroopScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextTest } = useTheme();
  const currentLang = i18n.language;

  const [running, setRunning] = useState(false);
  const [startTimer, setStartTimer] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [current, setCurrent] = useState<{ word: string; color: string } | null>(null);
  const [wordsAndColors, setWordsAndColors] = useState<{ word: string; color: string }[]>([]);
  const [wordsAndColorsList, setWordsAndColorsList] = useState<{ word: string; color: string }[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const didFetch = useRef(false);
  const displayedWordsRef = useRef<{ word: string; color: string }[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Fetches word-color pairs from CSV file based on current language and test phase.
   * Uses Papaparse to parse CSV and extracts words and colors for the current test number.
   * Only runs once via useRef to prevent repeated fetches.
   */
  const fetchWordsAndColors = useCallback(() => {
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
          if (row.colorWordList && row.colorColorList) {
            const words: string[] = row.colorWordList.split(',').map((w: string) => w.trim());
            const colors: string[] = row.colorColorList.split(',').map((c: string) => c.trim());
            const combined: { word: string; color: string }[] = words.map((w: string, i: number) => ({
              word: w,
              color: colors[i] || '#000000',
            }));
            setWordsAndColors(combined);
          }
        }
      })
      .catch((err) => console.error('error loading csv:', err));
  }, [currentLang]);

  /**
   * Loads word-color pairs on mount if not already fetched.
   */
  useEffect(() => {
    if (!didFetch.current) {
      fetchWordsAndColors();
      didFetch.current = true;
    }
  }, [fetchWordsAndColors]);

  /**
   * Selects the next word-color pair for display.
   * Ensures no repetition of the same word-color combination.
   * Generates a new list if the current list is exhausted.
   */
  function nextWord() {
    if (wordsAndColors.length === 0) return;

    let tempList = [...wordsAndColorsList];
    if (tempList.length === 0) {
      tempList = generateNewList();
    }

    let newWord: { word: string; color: string };
    const lastWord = current;

    do {
      newWord = tempList.shift()!;
    } while (lastWord && newWord.word === lastWord.word && newWord.color === lastWord.color && tempList.length > 0);

    if (tempList.length === 0 && lastWord && newWord.word === lastWord.word && newWord.color === lastWord.color) {
      setWordsAndColorsList([]);
      nextWord();
      return;
    }

    setCurrent(newWord);
    setWordsAndColorsList(tempList);
    displayedWordsRef.current = [...displayedWordsRef.current, newWord];
  }

  /**
   * Generates a shuffled list of all possible word-color combinations.
   * Ensures no word matches its own color (to create interference).
   */
  function generateNewList() {
    const newList: { word: string; color: string }[] = [];

    wordsAndColors.forEach((wordItem, wordIndex) => {
      wordsAndColors.forEach((colorItem, colorIndex) => {
        if (wordIndex !== colorIndex) {
          newList.push({ word: wordItem.word, color: colorItem.color });
          newList.push({ word: wordItem.word, color: colorItem.color });
        }
      });
    });

    for (let i = newList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newList[i], newList[j]] = [newList[j], newList[i]];
    }

    return newList;
  }

  /**
   * Starts the Stroop task: countdown → recording → timed test.
   * Sets up audio recording and starts timer based on test phase.
   */
  async function start() {
    const storedDate = localStorage.getItem('testStartDate');
    let testStarted = false;

    if (storedDate) {
      const today = new Date();
      const startDate = new Date(storedDate);

      if (today >= startDate) {
        testStarted = true;
      }
    }

    let time = (testStarted ? 120 : 30) * 1000;

    for (let index = 3; index >= 0; index--) {
      setTimeout(async () => {
        setStartTimer(index);

        if (index === 0) {
          setRunning(true);
          await startRecording();
          nextWord();

          timerRef.current = setTimeout(async () => {
            await endTest();
            setTimeUp(true);
          }, time);
        }
      }, (3 - index) * 1000);
    }
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
    } catch (err) {
      console.error('Error recording audio:', err);
    }
  }

  /**
   * Stops recording and saves audio as base64 in sessionStorage.
   * Cleans up stream and recorder.
   * Returns a Promise to ensure async cleanup.
   */
  async function stopRecording() {
    return new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder) {
        mediaRecorderRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        resolve();
        return;
      }

      recorder.onstop = null;

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          sessionStorage.setItem('stroopAudio', base64data);

          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;

          mediaRecorderRef.current = null;
          resolve();
        };
        reader.readAsDataURL(blob);
      };

      recorder.stop();
    });
  }

  /**
   * Finalizes the test: stops timer, stops recording, and saves results.
   * Stores word list and count in sessionStorage.
   */
  async function endTest() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await stopRecording();

    const wordCount = displayedWordsRef.current.length;

    sessionStorage.setItem('stroopWords', JSON.stringify(displayedWordsRef.current));
    sessionStorage.setItem('stroopWordCount', wordCount.toString());
  }

  /**
   * Proceeds to next test after completion.
   */
  function goNextPage() {
    gotoNextTest();
  }

  /**
   * Ensures cleanup on unmount: stops timer and recording.
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopRecording().catch(() => {});
    };
  }, []);

  /**
   * Renders the introduction screen with instructions and start button.
   */
  function introductionScreen() {
    return (
      <>
        <h1 style={styles.title}>{t('screens.test.stroop.title')}</h1>
        <p style={styles.text}>{t('screens.test.stroop.introduction')}</p>

        <img src={`../../images/stroop/recording_${currentLang}.png`} style={{ maxWidth: '200px', width: '60vw' }} alt="" />

        <SmallButton onClick={start} text={t('screens.test.stroop.start')} style={{ marginTop: '20px' }} />
      </>
    );
  }

  /**
   * Renders the countdown screen (3 → 2 → 1 → Start).
   */
  function timerScreen() {
    return (
      <>
        <img src={require('../../images/mic_muted.png')} style={{ maxHeight: '100px', height: '30vw', marginTop: '40px' }} alt="" />
        <div style={styles.wrapper}>
          <p style={{ ...styles.timerText, fontSize: 24 }}>{t('screens.test.stroop.start_text')}</p>
          <p style={styles.timerText}>{startTimer}</p>
        </div>
      </>
    );
  }

  /**
   * Renders the main Stroop task screen with word and next button.
   */
  function stroopScreen() {
    return (
      <>
        <img src={require('../../images/mic.png')} style={{ maxHeight: '100px', height: '30vw', marginTop: '40px' }} alt="" />
        <div style={styles.wrapper}>
          <h1 style={{ ...styles.word, color: current?.color }}>{current?.word}</h1>
          <BigButton onClick={nextWord} text={t('screens.test.stroop.next')} style={{ margin: '0 auto' }} />
        </div>
      </>
    );
  }

  /**
   * Renders the "Time's up" screen with final message and next button.
   */
  function timesUpScreen() {
    return (
      <>
        <h1 style={styles.title}>{t('screens.test.stroop.timesup_title')}</h1>
        <h1 style={styles.text}>{t('screens.test.stroop.timesup_text')}</h1>
        <div style={styles.wrapper}>
          <SmallButton onClick={goNextPage} text={t('screens.test.stroop.next')} />
        </div>
      </>
    );
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        {!running && !startTimer ? introductionScreen() : startTimer ? timerScreen() : timeUp ? timesUpScreen() : stroopScreen()}
      </div>
    </TestTemplate>
  );
};

export default TestStroopScreen;

/**
 * Custom styles for the Stroop test screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({
  wrapper: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    textAlign: 'center' as const,
  },
  word: {
    fontSize: '3rem',
    fontWeight: 'bold',
    textShadow: `
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px  1px 0 #000,
      1px  1px 0 #000
    `,
    margin: '40px 0',
  },
  timerBox: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
  },
  timerText: {
    fontSize: 48,
    margin: '10px 0px',
    textAlign: 'center' as const,
  },
});
