import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { SmallButton } from '../../components/SmallButton';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { Slider } from '../../components/Slider';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnairePerformanceScreen Component
 *
 * Collects user-reported performance ratings across eight dimensions after a test.
 * Uses sliders for each item and stores results in sessionStorage.
 * Proceeds to next test after submission.
 */
const QuestionnairePerformanceScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextTest } = useTheme();
  const [one, setOne] = useState(1);
  const [two, setTwo] = useState(1);
  const [three, setThree] = useState(1);
  const [four, setFour] = useState(1);
  const [five, setFive] = useState(1);
  const [six, setSix] = useState(1);
  const [seven, setSeven] = useState(1);
  const [eight, setEight] = useState(1);

  /**
   * Saves all performance ratings to sessionStorage as JSON.
   * Proceeds to next test via `gotoNextTest`.
   */
  function next() {
    const performance = {
      first: one.toString(),
      second: two.toString(),
      third: three.toString(),
      fourth: four.toString(),
      fifth: five.toString(),
      sixth: six.toString(),
      seventh: seven.toString(),
      eighth: eight.toString(),
    };
    sessionStorage.setItem('performance', JSON.stringify(performance));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        <h1 style={styles.headline}>{t('screens.post_test.performance.question')}</h1>

        <Slider type="performance" label={t('screens.post_test.performance.questions.one')} value={one} onChange={setOne} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.two')} value={two} onChange={setTwo} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.three')} value={three} onChange={setThree} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.four')} value={four} onChange={setFour} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.five')} value={five} onChange={setFive} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.six')} value={six} onChange={setSix} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.seven')} value={seven} onChange={setSeven} text />
        <Slider type="performance" label={t('screens.post_test.performance.questions.eight')} value={eight} onChange={setEight} text />
      </div>

      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.performance.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnairePerformanceScreen;

/**
 * Custom styles for the performance questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
