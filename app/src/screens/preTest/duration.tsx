import React from 'react';
import { TColors } from '../../style/colors';
import { TimeButton } from '../../components/TimeButton';
import { PageTemplate, usePageContext } from '../../components/PageTemplate';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireDurationScreen Component
 *
 * Allows the user to select the duration for the upcoming test.
 * Depending on the selection, it either:
 * - Starts the timer and moves to the next test, or
 * - Navigates to a "No Test Now" screen if the user chooses zero minutes.
 */
const QuestionnaireDurationScreen: React.FC = () => {
  // Access translation function, custom styles, and navigation context
  const { t, styles, navigate } = usePageContext(customStyles);

  // Access timer and test navigation functions from the theme/context
  const { startTimer, gotoNextTest } = useTheme();

  /**
   * Handle the next step after the user selects a duration
   *
   * @param duration - selected test duration in minutes
   */
  function nextStep(duration: number) {
    // Store selected duration in session storage for other components
    sessionStorage.setItem('durationInMinutes', duration.toString());

    if (duration > 0) {
      // If duration > 0, start the timer (convert minutes to seconds)
      startTimer(duration * 60);
      // Move to the next test screen
      gotoNextTest();
    } else {
      // If duration is 0, navigate to the "No Test Now" screen
      navigate('/no-test-now', { replace: true });
    }
  }

  return (
    <PageTemplate>
      <div style={styles.content}>
        {/* Display a chronograph icon at the top */}
        <img src={require('../../images/chronograph.png')} style={{ maxWidth: '40px', width: '15vw' }} alt="Chronograph" />

        <h1 style={styles.title}>{t('screens.pre_test.duration.question')}</h1>

        <p style={styles.text}>{t('screens.pre_test.duration.hint')}</p>

        {/* Buttons for predefined durations */}
        {[14, 12, 10, 8, 6].map((duration) => (
          <TimeButton key={duration} onClick={() => nextStep(duration)} text={`${duration} ${t('screens.pre_test.duration.minutes')}`} />
        ))}

        {/* Button for "No time available" (0 minutes) */}
        <TimeButton
          onClick={() => nextStep(0)}
          text={t('screens.pre_test.duration.no_time')}
          style={{ marginTop: 15 }}
          styleText={{ fontSize: 14, fontWeight: 'normal' }}
        />
      </div>
    </PageTemplate>
  );
};

export default QuestionnaireDurationScreen;

/**
 * Custom styles function for this screen
 *
 * Receives colors object and returns style properties
 */
const customStyles = (colors: TColors) => ({});
