import React, { FC, useState, useEffect, useRef, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Colors, { TColors } from '../style/colors';
import { saveSession } from '../saveSession';

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

  /** Set the test index to a specific value */
  setTestIndex: (index: number) => void;

  /** Navigate to the next test route */
  gotoNextTest: () => void;

  /** Prepare for demo */
  startDemo: () => void;

  /** Navigate to the next demo route */
  gotoNextDemo: () => void;

  /** Skip to other step of demo */
  gotoPartOfDemo: (newDemoIndex: number) => void;

  /** repeat demo or only a specific chapter of it */
  repeat_demo: (chapterName: string) => void;

  /** Navigate to the previous demo route */
  gotoPrevDemo: () => void;

  /** Navigate to a single demo chapter */
  selectDemoChapter: (chapterName: string) => void;

  /** Instructions for the demo steps */
  currentInstructions?: string;

  /** Image for the demo steps */
  currentImage?: string;

  /** Get the total number of test routes */
  getRouteCount: () => number;

  /** Get the total number of demo routes */
  getDemoRouteCount: () => number;

  /** Set the list of test routes (used for testing purposes)  */
  setRouteList: (routes: string[]) => void;
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
  const [demoRouteList, setDemoRouteList] = useState<DemoEntry[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);
  const navigate = useNavigate();

  // Fixed routes at the start and end of the test sequence
  const fixedStartRoutes = ['/q/fatigue', '/q/performance', '/q/symptoms-mental'];
  const fixedEndRoutes = [
    '/q/activities-must',
    '/q/activities-recovery',
    '/q/substances',
    '/q/symptoms-physical',
    '/q/mood',
    '/q/fatigue',
    '/q/performance',
    '/last-test-opinion',
    '/test-end',
  ];

  // Chapter 1 (Welcome)
  const demoChapterWelcome = [
    {
      // Welcome
      'route': '/d/instructions',
      'instruction': 'welcome',
    },
    {
      // Notification
      'route': '/d/instructions',
      'instruction': 'startButton1',
      'image': 'received_text_message.png'
    },
    {
      // Notification
      'route': '/d/instructions',
      'instruction': 'startButton2',
      'image': 'start_test.png'
    },
    {
      // Audio Recordings
      'route': '/d/instructions',
      'instruction': 'microphone1',
    },
    {
      // Permission
      'route': '/d/instructions',
      'instruction': 'microphone2',
    },
    {
      // Audio Recordings
      'route': '/d/instructions',
      'instruction': 'microphone3',
      'image': 'microphone.png'
    },
    {
      // Assessment start
      'route': '/d/instructions',
      'instruction': 'startButton3',
      'image': 'click_on_start_assessment.png'
    },
    {
      // Normal home screen
      'route': '/home',
      'instruction': 'screens.home.buttons.start',
    }
  ];

  // Chapter 2 (Duration)
  const demoChapterDuration = [
    {
      // Duration (Start)
      'route': '/d/instructions',
      'instruction': 'selectDuration1',
    },
    {
      // Duration (End)
      'route': '/d/instructions',
      'instruction': 'selectDuration2',
    },
    {
      // Duration (Fatigue)
      'route': '/d/instructions',
      'instruction': 'selectDuration3',
    },
    {
      // Duration (Unlimited)
      'route': '/d/instructions',
      'instruction': 'selectDuration4',
    },
    {
      // Duration (Select)
      'route': '/q/duration',
      'instruction': 'selectUnlimited',
    }
  ];

  // Chapter 3 (Questions: Current Wellbeing)
  const demoChapterWellbeing = [
    {
      // First Questions (Current fatigue)
      'route': '/d/instructions',
      'instruction': 'preQuestions1',
    },
    {
      // Rate Symptoms
      'route': '/d/instructions',
      'instruction': 'preQuestions2',
    },
    {
      // Just Choose
      'route': '/d/instructions',
      'instruction': 'preQuestions3',
    },
    {
      // Choose
      'route': '/q/fatigue',
      'instruction': 'preQuestionsFatigue',
    },
    {
      // Choose
      'route': '/q/performance',
      'instruction': 'preQuestionsMFI',
    },
    {
      // Choose
      'route': '/q/symptoms-mental',
      'instruction': 'preQuestionsCognition',
    }
  ];

  // Chapter 4 (Test: Matching)
  const demoChapterMatching = [
    {
      // Cognitive Tests (Introduction)
      'route': '/d/instructions',
      'instruction': 'cognitiveTestsIntro1',
    },
    {
      // Matching (Introduction)
      'route': '/d/instructions',
      'instruction': 'matchingIntro1',
    },
    {
      // Matching Demo (3 times)
      'route': '/d/matchingDemo',
    },
    {
      // Matching explain
      'route': '/d/instructions',
      'instruction': 'matchingExplain1',
    },
    {
      // Matching Introduction
      'route': '/d/instructions',
      'instruction': 'matchingExplain2',
    },
    {
      // Matching (30 seconds)
      'route': '/t/matching',
    },
    {
      // Matching (tomorrow)
      'route': '/d/instructions',
      'instruction': 'matchingExplain3',
    }
  ];

  // Chapter 5 (Test: Stroop)
  const demoChapterStroop = [
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopIntro1',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain1',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain2',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain3',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain4',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain5',
    },
    {
      // Stroop (3 times)
      'route': '/d/stroopDemo',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain8',
    },
    {
      // Stroop (Introduction)
      'route': '/d/instructions',
      'instruction': 'stroopExplain9',
    },
    {
      // Stroop (30 seconds)
      'route': '/t/stroop',
    },
    {
      // Stroop (tomorrow)
      'route': '/d/instructions',
      'instruction': 'stroopExplain10',
    }
  ];

  // Chapter 6 (Test: Memory)
  const demoChapterMemory = [
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryIntro1',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain1',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain2',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain3',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain4',
    },
    {
      // Memory (5 times)
      'route': '/t/memory',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain5',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain6',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain7',
    },
    {
      // Memory (Introduction)
      'route': '/d/instructions',
      'instruction': 'memoryExplain8',
    }
  ];

  // Test Conclusion
  const demoTestsConclusion = [
    {
      // Tests are random
      'route': '/d/instructions',
      'instruction': 'cognitiveTestsOutro1',
    }
  ];

  // Chapter 7 (Questions: Activities)
  const demoChapterActivities = [
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities1',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities2',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities3',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities4',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities5',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities6',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'activities7',
    },
    {
      // Test Page
      'route': '/q/activities-must',
    },
    {
      // Test Page
      'route': '/q/activities-recovery',
    },
    {
      // Test Page
      'route': '/q/substances',
    }
  ];

  // Chapter 8 (Symptoms)
  const demoChapterSymptoms = [
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'physicalSymptoms1',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'physicalSymptoms2',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'physicalSymptoms3',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'physicalSymptoms4',
      'image': 'change_symptoms.png',
    },
    {
      // Test Page
      'route': '/q/symptoms-physical',
    },
    {
      // Test Page
      'route': '/q/mood',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'postQuestions2',
    },
    {
      // Test Page
      'route': '/q/fatigue',
      'instruction': 'preQuestionsFatigue',
    },
    {
      // Test Page
      'route': '/q/performance',
      'instruction': 'preQuestionsMFI',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'evaluateLastTest1',
    },
    {
      // Test Page
      'route': '/last-test-opinion',
    }
  ];

  // Chapter 9 (Export)
  const demoChapterExport = [
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'export1',
      'image': 'export.png',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'export2',
      'image': 'click_on_export.png',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'export3',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'export4',
    },
    {
      // Export Test
      'route': '/home',
      'instruction': 'screens.home.buttons.export',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'export5',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'export6',
    }
  ];

  // Chapter 10 (Skip & Stop Test)
  const demoChapterSkipAndStop = [
    {
      // More Functions
      'route': '/d/instructions',
      'instruction': 'almostDone1',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'skip1',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'skip2',
    },
    {
      // Select No
      'route': '/q/duration',
      'instruction': 'selectSkip',
    },
    {
      // Reason
      'route': '/no-test-now',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'finish1',
    },
    {
      // Explanation
      'route': '/d/instructions',
      'instruction': 'finish2',
    },
    {
      // Select Exit
      'route': '/q/activities-must',
      'instruction': 'finishEarly',
    }
  ];

  // Contact
  const demoChapterContact = [
    {
      'route': '/d/instructions',
      'instruction': 'demoDone1',
    },
    {
      'route': '/d/instructions',
      'instruction': 'demoDone2',
    },
    {
      'route': '/d/instructions',
      'instruction': 'demoDone3',
    }
  ];

  type DemoEntry = {
    route: string;
    instruction?: string;
    image?: string;
  };
  const demoWhole: DemoEntry[] = [
    ...demoChapterWelcome, ...demoChapterDuration, ...demoChapterWellbeing,
    ...demoChapterMatching, ...demoChapterStroop, ...demoChapterMemory, ...demoTestsConclusion,
    ...demoChapterActivities, ...demoChapterSymptoms, ...demoChapterExport,
    ...demoChapterSkipAndStop, ...demoChapterContact
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

    let dynamicRoutes = testOrderArr
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

    if(dynamicRoutes.length === 0) {
      dynamicRoutes = ['/t/stroop', '/t/matching', '/t/memory'];
    }

    return [...fixedStartRoutes, ...dynamicRoutes, ...fixedEndRoutes];
  }

  /** Navigate to the next test route */
  const gotoNextTest = () => {
    try {
      let list = routeList;

      // Build route list if empty
      if (list.length === 0) {
        const testNumber = localStorage.getItem('testNumber') ?? '';
        const testOrder = localStorage.getItem('markerTestOrder' + testNumber) ?? '';
        list = buildRouteList(testOrder);
        setRouteList(list);
      }

      // Set Time
      sessionStorage.setItem('time_' + list[testIndex] + '_testIndex' + testIndex, new Date().toISOString());

      // Save data so far
      saveSession();

      // Navigate to the next route or end the test if finished
      if (testIndex >= list.length - 1) {
        setTestIndex(0);
        setRouteList([]);
        navigate('/test-end', { replace: true });
      } else {
        const next = list[testIndex];

        if (next === list[testIndex - 1]) {
          sessionStorage.setItem('error', "Duplicated Route: '" + next + "'; routeList: " + routeList.toString());
        }

        setTestIndex((prev) => prev + 1);
        navigate(next, { replace: true, state: { progress: testIndex + 1 } });
      }
    } catch (err) {
      if (err instanceof Error) {
        sessionStorage.setItem('error', err.message);
      }
    }
  };

  /** Get total number of test routes */
  const getRouteCount = () => {
    return routeList.length;
  };

  /** Get total number of demo routes */
  const getDemoRouteCount = () => {
    return demoRouteList.length;
  };

  const startDemo = () => {
    setDemoRouteList(demoWhole);
    setDemoIndex(0);

    navigate(demoWhole[0].route, { replace: true, state: { progress: demoIndex + 1 } });
  }

  /** Navigate to the next test route */
  const gotoNextDemo = (entries?: DemoEntry[]) => {
    const demoEnd = localStorage.getItem('demoEnd');

    let list = entries ?? demoRouteList;

    // Save data so far
    saveSession();

    // Navigate to the next route or end the test if finished
    if (demoIndex >= list.length - 1 || (demoEnd !== null && demoIndex >= Number(demoEnd))) {
      setDemoIndex(0);
      localStorage.setItem('demoStage', 'demoFinished');
      localStorage.setItem('demoWasFinished', 'true');
      navigate('/home', { replace: true });
    } else {
      const next = list[demoIndex + 1];
      if(next === undefined) {
        navigate('/home', { replace: true });
      } else {
        setDemoIndex((prev) => prev + 1);

        navigate(next.route, { replace: true, state: { progress: demoIndex + 1 } });
      }
    }
  };

  /** Navigate to a specific part of the route */
  const gotoPartOfDemo = (newDemoIndex: number) => {
    if (newDemoIndex !== null) {
      setDemoIndex(newDemoIndex);
    }

    let list = demoWhole;
    setDemoRouteList(list);

    // Navigate to the next route or end the test if finished
    if (demoIndex >= list.length - 1) {
      setDemoIndex(0);
      localStorage.setItem('demoStage', 'demoFinished');
      localStorage.setItem('demoWasFinished', 'true');
      navigate('/home', { replace: true });
    } else {
      const next = list[demoIndex + 1];
      navigate(next.route, { replace: true, state: { progress: demoIndex + 1 } });
    }
  };

  /** Do only a chapter of the demo */
  const repeat_demo = (chapterName: string) => {
    let demoStart = 0;
    let demoEnd = demoWhole.length;
    if (chapterName === 'matching') {
      demoStart = 20;
      demoEnd = 25;
    } else if (chapterName === 'stroop') {
      demoStart = 27;
      demoEnd = 36;
    } else if (chapterName === 'memory') {
      demoStart = 38;
      demoEnd = 46;
    }

    localStorage.setItem('demoStage', 'demoOngoing');
    localStorage.setItem('demoStart', demoStart.toString());
    localStorage.setItem('demoEnd', demoEnd.toString());
    gotoPartOfDemo(demoStart);
  };

  const selectDemoChapter = (chapterName: string) => {
    localStorage.setItem('demoStage', 'demoOngoing');
    
    setDemoIndex(0);

    let list: DemoEntry[] = [];
    switch (chapterName) {
      case 'demoChapterWelcome':
        list = demoChapterWelcome;
        break;
      case 'demoChapterDuration':
        list = demoChapterDuration;
        break;
      case 'demoChapterWellbeing':
        list = demoChapterWellbeing;
        break;
      case 'demoChapterMatching':
        list = demoChapterMatching;
        break;
      case 'demoChapterStroop':
        list = demoChapterStroop;
        break;
      case 'demoChapterMemory':
        list = demoChapterMemory;
        break;
      case 'demoChapterActivities':
        list = demoChapterActivities;
        break;
      case 'demoChapterSymptoms':
        list = demoChapterSymptoms;
        break;
      case 'demoChapterExport':
        list = demoChapterExport;
        break;
      case 'demoChapterSkipAndStop':
        list = demoChapterSkipAndStop;
        break;
    
      default:
        break;
    }
    setDemoRouteList(list);
    console.log(list);

    // Navigate to the next route or end the test if finished
    if (demoIndex >= list.length - 1) {
      setDemoIndex(0);
      localStorage.setItem('demoStage', 'demoFinished');
      navigate('/home', { replace: true });
    } else {
      const next = list[demoIndex + 1];
      navigate(next.route, { replace: true, state: { progress: demoIndex + 1 } });
    }
  };

  /** Navigate to the next test route */
  const gotoPrevDemo = () => {
    const demoStart = localStorage.getItem('demoStart');

    // Navigate to the next route or end the test if finished
    if (demoIndex === 0) {
      navigate('/home', { replace: true });
      localStorage.setItem('demoStage', 'demoIncomplete');
    } else if (demoStart !== null && demoIndex <= Number(demoStart)) {
      setDemoIndex(0);
      localStorage.setItem('demoStage', 'demoFinished');
      localStorage.setItem('demoWasFinished', 'true');
      navigate('/home', { replace: true });
    } else {
      const next = demoRouteList[demoIndex - 1];
      setDemoIndex((prev) => prev - 1);

      navigate(next.route, { replace: true, state: { progress: demoIndex - 1 } });
    }
  };

  /** select demo text */
  const currentInstructions = demoRouteList[demoIndex]?.instruction ?? '';
  const currentImage = demoRouteList[demoIndex]?.image ?? '';

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
        setTestIndex,
        gotoNextTest,
        startDemo,
        gotoNextDemo,
        gotoPartOfDemo,
        repeat_demo,
        gotoPrevDemo,
        selectDemoChapter,
        currentInstructions,
        currentImage,
        getRouteCount,
        getDemoRouteCount,
        setRouteList,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
