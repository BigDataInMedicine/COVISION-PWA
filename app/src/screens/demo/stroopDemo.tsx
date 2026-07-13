import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';

import { TColors } from '../../style/colors';
import { BigButton } from '../../components/BigButton';
import i18n from '../../localization/i18n';
import Papa from 'papaparse';
import StroopWordSVG from '../../components/StroopWordSVG';
import { useTheme } from '../../context/ThemeContext';

/**
 * TestStroopScreen Component
 *
 * Implements the Stroop color-word interference task with audio recording.
 * Displays color words (e.g., "red" in blue ink) and records user's verbal responses.
 * Uses CSV-based word lists and adjusts time based on test phase.
 * Stores audio, word list, and count in sessionStorage and proceeds to next test.
 */

const examplesN = 3;
const wordsExamples = [0, 1, 2];
const colorExamples = [1, 2, 3];

const StroopDemoScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextDemo } = useTheme();
  const currentLang = i18n.language;
  const [current, setCurrent] = useState<{
    word: string;
    color: string;
  } | null>(null);
  const [wordsAndColors, setWordsAndColors] = useState<{ word: string; color: string }[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const didFetch = useRef(false);
  const displayedWordsRef = useRef<{ word: string; color: string }[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [examplesCount, setExamplesCount] = useState(0);
  const [firstWordPrepared, setFirstWordPrepared] = useState(false);

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

    if (wordsAndColors.length !== 0) {
      setCurrent({
        word: wordsAndColors[wordsExamples[examplesCount]].word,
        color: wordsAndColors[colorExamples[examplesCount]].color,
      });
    }
  }, [currentLang, examplesCount, wordsAndColors]);

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
    setExamplesCount(examplesCount + 1);
    if (examplesCount >= examplesN) {
      stopRecording();
      gotoNextDemo();
    } else {
      let newWord = {
        word: wordsAndColors[wordsExamples[examplesCount]].word,
        color: wordsAndColors[colorExamples[examplesCount]].color,
      };

      setCurrent(newWord);

      displayedWordsRef.current = [...displayedWordsRef.current, newWord];
    }
  }

  function prepareFirstWord() {
    if (!firstWordPrepared && wordsAndColors.length !== 0) {
      let newWord = {
        word: wordsAndColors[wordsExamples[examplesCount]].word,
        color: wordsAndColors[colorExamples[examplesCount]].color,
      };

      setCurrent(newWord);
      setExamplesCount(examplesCount + 1);

      displayedWordsRef.current = [...displayedWordsRef.current, newWord];
      setFirstWordPrepared(true);
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
   * Renders the main Stroop task screen with word and next button.
   */
  function stroopScreen() {
    prepareFirstWord();

    return (
      <>
        <img src={require('../../images/mic.png')} style={{ maxHeight: '100px', height: '30vw', marginTop: '40px' }} alt="" />

        <StroopWordSVG word={current?.word ?? ''} fill={current?.color ?? '#000'} fontSize={64} />
        <div style={styles.instruction}>{t('screens.demo.instructions.stroopExample' + examplesCount)}</div>

        <div>
          <BigButton onClick={nextWord} text={t('screens.test.stroop.next')} style={{ margin: '0 auto' }} />
        </div>
      </>
    );
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0} withoutProgressbar={true}>
      <div style={styles.content}>{stroopScreen()}</div>
    </TestTemplate>
  );
};

export default StroopDemoScreen;

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
    WebkitTextStroke: '2px #000',
    margin: '40px 0',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  instruction: {
    fontSize: 20,
    margin: '20px 10px',
    textAlign: 'center' as const,
    position: 'absolute',
    top: '85%',
    transform: 'translateY(-50%)',
    color: colors.primary,
  },
});
