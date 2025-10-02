import React, { FC, useState, useEffect, useRef, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Colors, { TColors } from '../style/colors';

/**
 * Context type for theme and test management
 */
type ThemeContextType = {
  /** Current color palette */
  colors: TColors;

  /** Function to apply a new color palette */
  applyColors: (colors: TColors) => void;

  /** Start a countdown timer with the specified duration in seconds */
  startTimer: (durationInSeconds: number) => void;

  /** Stop the countdown timer */
  stopTimer: () => void;

  /** Remaining time in seconds or null if timer is not running */
  remaining: number | null;

  /** Whether the timer is currently running */
  isRunning: boolean;

  /** Navigate to the next test route */
  gotoNextTest: () => void;

  /** Get the total number of test routes */
  getRouteCount: () => number;
};

/** ThemeContext provides colors, timer, and test navigation functionality */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Custom hook to access ThemeContext safely */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

type Props = {
  children?: React.ReactNode;
};

/**
 * ThemeProvider Component
 *
 * Provides the current color theme, a countdown timer, and navigation between test pages.
 *
 * @param children - React children components
 */
export const ThemeProvider: FC<Props> = ({ children }) => {
  // Current color palette (light by default)
  const [colors, setColors] = useState<TColors>(Colors.light);

  // Timer state
  const [initialDuration, setInitialDuration] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Test navigation state
  const [routeList, setRouteList] = useState<string[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const navigate = useNavigate();

  // Fixed routes at the start and end of the test sequence
  const fixedStartRoutes = ['/q/fatigue', '/q/symptoms-mental'];
  const fixedEndRoutes = [
    '/q/activities-must',
    '/q/activities-recovery',
    '/q/substances',
    '/q/symptoms-physical',
    '/q/mood',
    '/q/fatigue',
    '/last-test-opinion',
    '/q/performance',
    '/test-end',
  ];

  /** Apply a new color palette */
  const applyColors = (colorTheme: TColors) => {
    setColors(colorTheme);
  };

  /** Start the countdown timer */
  const startTimer = (durationInSeconds: number) => {
    setInitialDuration(durationInSeconds);
    setRemaining(durationInSeconds);
    setIsRunning(true);
  };

  /** Stop the countdown timer */
  const stopTimer = () => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    setRemaining(null);
    setIsRunning(false);
  };

  /**
   * Build the full list of test routes based on a test order string
   * @param testOrder - comma-separated test order
   */
  function buildRouteList(testOrder: string): string[] {
    const testOrderArr = testOrder.split(',');

    const dynamicRoutes = testOrderArr
      .map((item) => {
        const key = item.replace(/\d+/g, '').trim();
        switch (key) {
          case 'color':
            return '/t/stroop';
          case 'symbol':
            return '/t/matching';
          case 'word':
            return '/t/memory';
          default:
            return '';
        }
      })
      .filter(Boolean);

    return [...fixedStartRoutes, ...dynamicRoutes, ...fixedEndRoutes];
  }

  /** Navigate to the next test route */
  const gotoNextTest = () => {
    let list = routeList;

    // Build route list if empty
    if (list.length === 0) {
      const testNumber = localStorage.getItem('testNumber') ?? '';
      const testOrder = localStorage.getItem('markerTestOrder' + testNumber) ?? '';
      list = buildRouteList(testOrder);
      setRouteList(list);
    }

    // Navigate to the next route or end the test if finished
    if (testIndex >= list.length) {
      setTestIndex(0);
      setRouteList([]);
      navigate('/test-end', { replace: true });
    } else {
      const next = list[testIndex];
      setTestIndex((prev) => prev + 1);
      navigate(next, { replace: true, state: { progress: testIndex + 1 } });
    }
  };

  /** Get total number of test routes */
  const getRouteCount = () => {
    return routeList.length;
  };

  /**
   * Countdown timer effect
   * - Decrements remaining seconds every second
   * - Stops the timer and navigates to test end when time is up
   */
  useEffect(() => {
    if (!isRunning || remaining === null) return;

    if (remaining <= 0) {
      stopTimer();
      navigate('/test-end', {
        replace: true,
        state: {
          timesup: true,
          initialDuration: initialDuration != null && initialDuration > 0 ? initialDuration / 60 : 0,
        },
      });
      return;
    }

    intervalRef.current = setTimeout(() => {
      setRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [remaining, isRunning, initialDuration, navigate]);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        applyColors,
        startTimer,
        stopTimer,
        remaining,
        isRunning,
        gotoNextTest,
        getRouteCount,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
