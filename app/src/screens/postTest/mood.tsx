import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { Slider } from '../../components/Slider';
import { SmallButton } from '../../components/SmallButton';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireMoodScreen Component
 *
 * Collects user-reported mood after a test session using a slider.
 * Stores the mood value in sessionStorage and proceeds to the next test.
 */
const QuestionnaireMoodScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextTest } = useTheme();
  const [mood, setMood] = useState(0);

  /**
   * Saves mood value to sessionStorage and proceeds to next test.
   * Stores mood as a string in JSON format under `mood`.
   */
  function next() {
    const moodJSON = { mood: mood.toString() };
    sessionStorage.setItem('mood', JSON.stringify(moodJSON));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        <img src={require('../../images/mood.png')} style={{ maxWidth: '100px', width: '30vw' }} alt="" />
        <h1 style={styles.headline}>{t('screens.post_test.mood.question')}</h1>

        <Slider type="mood" value={mood} onChange={setMood} />
      </div>

      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.mood.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireMoodScreen;

/**
 * Custom styles for the mood questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
