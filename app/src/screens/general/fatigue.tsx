import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { SmallButton } from '../../components/SmallButton';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { Slider } from '../../components/Slider';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireFatigueScreen Component
 *
 * Collects user input for mental and physical fatigue.
 * The values are stored in sessionStorage:
 * - First entry is saved as `fatigue1`
 * - Second entry (if present) is saved as `fatigue2`
 *
 * After saving the data, the test flow continues to the next step.
 */
const QuestionnaireFatigueScreen: React.FC = () => {
  // Access translation function, styles, and progress state from context
  const { t, styles, location } = usePageContext(customStyles);

  // State hooks to store slider values
  const [mentalFatigue, setMentalFatigue] = useState(0);
  const [physicalFatigue, setPhysicalFatigue] = useState(0);

  // Access navigation to the next test step from theme/context
  const { gotoNextTest, gotoNextDemo } = useTheme();

  const studyPhase = localStorage.getItem('studyPhase');

  /**
   * Handle the next step when the user confirms their fatigue ratings
   * - Stores fatigue values in sessionStorage (as `fatigue1` or `fatigue2`)
   * - Proceeds to the next test screen
   */
  function nextStep() {
    const fatigue = {
      mentalFatigue: mentalFatigue.toString(),
      physicalFatigue: physicalFatigue.toString(),
    };

    // Decide whether to store as first or second fatigue entry
    if (sessionStorage.getItem('fatigue1') === null) {
      sessionStorage.setItem('fatigue1', JSON.stringify(fatigue));
    } else {
      sessionStorage.setItem('fatigue2', JSON.stringify(fatigue));
    }
    if (studyPhase === 'DemoDay1') {
      gotoNextDemo();
    } else {
      gotoNextTest();
    }
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0} withoutProgressbar={studyPhase === 'DemoDay1'}>
      <div style={styles.content}>
        <h1 style={styles.headline}>{t('screens.general.fatigue.question')}</h1>

        {/* Slider for mental fatigue */}
        <Slider
          type="fatigue"
          label={t('screens.general.fatigue.mental')}
          image={require('../../images/mental.png')}
          value={mentalFatigue}
          onChange={setMentalFatigue}
        />

        {/* Slider for physical fatigue */}
        <Slider
          type="fatigue"
          label={t('screens.general.fatigue.physical')}
          image={require('../../images/physical.png')}
          value={physicalFatigue}
          onChange={setPhysicalFatigue}
        />
      </div>

      {/* Footer with next button */}
      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={nextStep} text={t('screens.general.fatigue.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireFatigueScreen;

/**
 * Custom styles function for this screen
 *
 * Receives colors object and returns style properties
 */
const customStyles = (colors: TColors) => ({});
