import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { Slider } from '../../components/Slider';
import { SmallButton } from '../../components/SmallButton';

/**
 * QuestionnaireSleepScreen Component
 *
 * Collects user-reported sleep data after a test session.
 * Captures:
 * - Number of hours slept (via numeric input)
 * - Subjective sleep quality (via slider)
 *
 * Data is stored in sessionStorage under `sleep` as JSON.
 * After submission, navigates to `/test-end`.
 *
 * Designed for post-test feedback in a longitudinal study to assess sleep as a potential confounding factor.
 */
const QuestionnaireSleepScreen: React.FC = () => {
  const { t, styles, navigate, colors } = usePageContext(customStyles);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);

  /**
   * Save sleep data and navigate to test end
   *
   * Stores sleep hours and quality as strings in sessionStorage under `sleep`.
   * Redirects to `/test-end` with `replace: true` to prevent back navigation.
   */
  function next() {
    const sleepJSON = { sleepHours: sleepHours.toString(), sleepQuality: sleepQuality.toString() };
    sessionStorage.setItem('sleep', JSON.stringify(sleepJSON));
    navigate('/test-end', { replace: true });
  }

  return (
    <TestTemplate withoutProgressbar>
      <div style={styles.content}>
        <h1 style={styles.headline}>{t('screens.post_test.sleep.question1')}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 50px 0' }}>
          <span>{t('screens.post_test.sleep.answer_pre')}</span>
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            style={{
              width: '48px',
              border: '1px solid',
              borderColor: colors.gray,
              borderRadius: '4px',
              textAlign: 'center',
              outline: 'none',
              padding: '2px',
            }}
          />
          <span>{t('screens.post_test.sleep.answer_post')}</span>
        </div>

        <h1 style={styles.headline}>{t('screens.post_test.sleep.question2')}</h1>

        <Slider type="mood" value={sleepQuality} onChange={setSleepQuality} />
      </div>

      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.sleep.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireSleepScreen;

/**
 * Custom styles for the sleep questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
