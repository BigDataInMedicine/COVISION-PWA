import React, { useRef, useState, useEffect } from 'react';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { TColors } from '../../style/colors';
import { useTheme } from '../../context/ThemeContext';

const symbols = ['>', '⌐', '∸', '+', '⊣', ')'];
const examplesN = 3;

const exampleTopOrders = [
  [0, 1, 2, 3, 4, 5],
  [4, 2, 1, 3, 0, 5],
  [1, 4, 5, 0, 3, 2],
];
const exampleBottomOrders = [
  [5, 1, 3, 0, 4, 2],
  [0, 1, 2, 3, 4, 5],
  [4, 5, 2, 0, 1, 3],
];

const hintTimes = [3000, 6000, 12000];
const exampleCurrentNumbers = [4, 5, 3];

/**
 * TestMatchingScreen Component
 *
 * Implements a cognitive matching task where users match symbols to positions.
 * Features countdown, real-time feedback, time limit (30s), and result tracking.
 * Stores results in sessionStorage and proceeds to next test.
 */
const MatchingDemoScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextDemo } = useTheme();

  const [topOrder, setTopOrder] = useState([
    symbols[exampleTopOrders[0][0]],
    symbols[exampleTopOrders[0][1]],
    symbols[exampleTopOrders[0][2]],
    symbols[exampleTopOrders[0][3]],
    symbols[exampleTopOrders[0][4]],
    symbols[exampleTopOrders[0][5]],
  ]);
  const [bottomOrder, setBottomOrder] = useState([
    symbols[exampleBottomOrders[0][0]],
    symbols[exampleBottomOrders[0][1]],
    symbols[exampleBottomOrders[0][2]],
    symbols[exampleBottomOrders[0][3]],
    symbols[exampleBottomOrders[0][4]],
    symbols[exampleBottomOrders[0][5]],
  ]);
  const [currentNumber, setCurrentNumber] = useState(exampleCurrentNumbers[0]);
  const [wrongResAlert, setWrongResAlert] = useState('screens.demo.alerts.matching_first');
  const [examplesCount, setExamplesCount] = useState(1);

  // Schedule hint (pulse) after a per-trial delay
  useEffect(() => {
    // Clear any previous timer
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    // Reset hint visibility for new trial
    setShowHint(false);

    // Determine current trial index (0-based)
    const trialIndex = examplesCount - 1;
    if (trialIndex < 0 || trialIndex >= examplesN) return;

    const delay = hintTimes[trialIndex];
    if (typeof delay === 'number' && delay >= 0) {
      hintTimerRef.current = setTimeout(() => {
        setShowHint(true);
      }, delay);
    }

    // Cleanup on unmount or when trial changes
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [examplesCount]);

  /**
   * Handles user click on a symbol.
   * Checks if the choice matches the correct symbol at the current position.
   * Updates results, generates new number, and shuffles symbol orders.
   */
  function handleClick(symbol: string) {
    if (!currentNumber) return;
    const correctSymbol = topOrder[currentNumber - 1];
    if (symbol === correctSymbol) {
      if (examplesCount >= examplesN) {
        gotoNextDemo();
      } else {
        setCurrentNumber(exampleCurrentNumbers[examplesCount]);
        setTopOrder([
          symbols[exampleTopOrders[examplesCount][0]],
          symbols[exampleTopOrders[examplesCount][1]],
          symbols[exampleTopOrders[examplesCount][2]],
          symbols[exampleTopOrders[examplesCount][3]],
          symbols[exampleTopOrders[examplesCount][4]],
          symbols[exampleTopOrders[examplesCount][5]],
        ]);
        setBottomOrder([
          symbols[exampleBottomOrders[examplesCount][0]],
          symbols[exampleBottomOrders[examplesCount][1]],
          symbols[exampleBottomOrders[examplesCount][2]],
          symbols[exampleBottomOrders[examplesCount][3]],
          symbols[exampleBottomOrders[examplesCount][4]],
          symbols[exampleBottomOrders[examplesCount][5]],
        ]);
        setWrongResAlert('screens.demo.alerts.alertMatching' + (examplesCount + 1));
        setExamplesCount(examplesCount + 1);
      }
    } else {
      alert(t(wrongResAlert));
    }
  }

  // Hint control: only start pulsing after a delay per example
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject @keyframes pulse globally so inline styles can use it
  useEffect(() => {
    const id = 'pulse-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes pulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  /**
   * Renders the main matching game screen with top grid, number and bottom buttons.
   */
  function matchingScreen() {
    const correctSymbol = topOrder[currentNumber - 1];
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
          {bottomOrder.map((s, i) => {
            const isSolution = s === correctSymbol;
            const style = isSolution && showHint ? styles.solutionButton : styles.bottomButton;
            return (
              <button key={i} onClick={() => handleClick(s)} style={style}>
                {s}
              </button>
            );
          })}
        </div>

        <div style={styles.instruction}>
          <br></br>
          <br></br>
          <br></br>
          {t('screens.demo.instructions.matchingExample1')}
        </div>
      </div>
    );
  }
  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0} withoutProgressbar={true}>
      <div style={styles.content}>{matchingScreen()}</div>
    </TestTemplate>
  );
};

export default MatchingDemoScreen;

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
  solutionButton: {
    padding: '1.5vw',
    fontSize: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '20vw',
    height: '10vh',
    animation: 'pulse 1.2s ease-in-out infinite',
    willChange: 'transform',
  },
  wordText: {
    fontSize: 48,
    margin: '10px 0px',
    textAlign: 'center' as const,
  },
  instruction: {
    fontSize: 20,
    margin: '20px 10px',
    textAlign: 'center' as const,
    position: 'absolute',
    transform: 'translateY(-50%)',
    color: colors.primary,
    pointerEvents: 'none',
  },
});
