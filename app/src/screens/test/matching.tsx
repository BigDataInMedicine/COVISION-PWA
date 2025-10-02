import React, { useState, useEffect } from 'react';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { SmallButton } from '../../components/SmallButton';
import { TColors } from '../../style/colors';
import { useTheme } from '../../context/ThemeContext';

const symbols = ['>', '⊢', '÷', '+', '⊣', ')'];

/**
 * TestMatchingScreen Component
 *
 * Implements a cognitive matching task where users match symbols to positions.
 * Features countdown, real-time feedback, time limit (30s), and result tracking.
 * Stores results in sessionStorage and proceeds to next test.
 */
const TestMatchingScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextTest } = useTheme();
  const [running, setRunning] = useState(false);
  const [startTimer, setStartTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timeUp, setTimeUp] = useState(false);
  const [topOrder, setTopOrder] = useState<string[]>([]);
  const [bottomOrder, setBottomOrder] = useState<string[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);

  const [results, setResults] = useState<{ number: number; symbol: string; chosen: string; isCorrect: boolean }[]>([]);

  /**
   * Shuffles an array using Fisher-Yates algorithm.
   * @param arr - Input array to shuffle
   * @returns New shuffled array
   */
  function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  /**
   * Starts the test sequence: countdown → start → game.
   * Sets up initial state, shuffles symbol orders, and sets first number.
   * If test hasn't started yet, sets time to 30s instead of 120s.
   */
  function start() {
    const storedDate = localStorage.getItem('testStartDate');
    let testStarted = false;

    if (storedDate) {
      const today = new Date();
      const startDate = new Date(storedDate);

      if (today >= startDate) {
        testStarted = true;
      }
    }

    for (let index = 3; index >= 0; index--) {
      setTimeout(() => {
        setStartTimer(index);

        if (index === 0) {
          setRunning(true);
          !testStarted && setTimeLeft(30);
          setTopOrder(shuffle(symbols));
          setBottomOrder(shuffle(symbols));
          setCurrentNumber(Math.floor(Math.random() * symbols.length) + 1);
          setResults([]);
        }
      }, (3 - index) * 1000);
    }
  }

  /**
   * Timer effect: Decrements timeLeft every second.
   * Stops when timeLeft reaches 0 and saves results.
   */
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setTimeUp(true);
      sessionStorage.setItem('matching', JSON.stringify(results));
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft, results]);

  /**
   * Handles user click on a symbol.
   * Checks if the choice matches the correct symbol at the current position.
   * Updates results, generates new number, and shuffles symbol orders.
   */
  function handleClick(symbol: string) {
    if (!currentNumber) return;
    const correctSymbol = topOrder[currentNumber - 1];

    setResults((prev) => [
      ...prev,
      {
        number: currentNumber,
        symbol: correctSymbol,
        chosen: symbol,
        isCorrect: symbol === correctSymbol,
      },
    ]);

    setCurrentNumber(Math.floor(Math.random() * symbols.length) + 1);
    setTopOrder(shuffle(symbols));
    setBottomOrder(shuffle(symbols));
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
        <h1 style={styles.title}>{t('screens.test.matching.title')}</h1>
        <p style={styles.text}>{t('screens.test.matching.introduction')}</p>

        <img src={`../../images/matching/matching.png`} style={{ maxWidth: '200px', width: '60vw' }} alt="" />

        <SmallButton onClick={start} text={t('screens.test.matching.button')} style={{ marginTop: '20px' }} />
      </>
    );
  }

  /**
   * Renders the countdown screen (3 → 2 → 1 → Start).
   */
  function timerScreen() {
    return (
      <div style={styles.wrapper}>
        <p style={{ ...styles.wordText, fontSize: 24 }}>{t('screens.test.matching.start_text')}</p>
        <p style={styles.wordText}>{startTimer}</p>
      </div>
    );
  }

  /**
   * Renders the main matching game screen with top grid, number and bottom buttons.
   */
  function matchingScreen() {
    return (
      <div style={styles.wrapper}>
        <div style={styles.topGrid}>
          {topOrder.map((s, i) => (
            <div key={i} style={styles.topCell}>
              <div>{i + 1}</div>
              <div>{s}</div>
            </div>
          ))}
        </div>

        <h1 style={styles.number}>{currentNumber}</h1>

        <div style={styles.bottomGrid}>
          {bottomOrder.map((s, i) => (
            <button key={i} onClick={() => handleClick(s)} style={styles.bottomButton}>
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Renders the "Time's up" screen with final message and next button.
   */
  function timesUpScreen() {
    return (
      <>
        <h1 style={styles.title}>{t('screens.test.matching.timesup_title')}</h1>
        <h1 style={styles.text}>{t('screens.test.matching.timesup_text')}</h1>
        <div style={styles.wrapper}>
          <SmallButton onClick={goNextPage} text={t('screens.test.matching.next')} />
        </div>
      </>
    );
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        {!running && !startTimer ? introductionScreen() : startTimer ? timerScreen() : timeUp ? timesUpScreen() : matchingScreen()}
      </div>
    </TestTemplate>
  );
};

export default TestMatchingScreen;

/**
 * Custom styles for the matching test screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({
  wrapper: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '6px',
  },
  topCell: {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '1.3rem',
    textAlign: 'center',
  },
  number: {
    fontSize: '3rem',
    margin: '40px 0',
    textAlign: 'center',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    width: '70vw',
    margin: '0 auto',
  },
  bottomButton: {
    padding: '1.5vw',
    fontSize: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '20vw',
    height: '10vh',
  },
  wordText: {
    fontSize: 48,
    margin: '10px 0px',
    textAlign: 'center' as const,
  },
});
