import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { Slider } from '../../components/Slider';
import { SmallButton } from '../../components/SmallButton';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireSymptomsMentalScreen Component
 *
 * Collects user input for mental symptoms before the test.
 * Users can rate their:
 * - Concentration
 * - Wordfinding ability
 * - Memory
 *
 * The collected values are stored in sessionStorage and the test flow continues to the next step.
 */
const QuestionnaireSymptomsMentalScreen: React.FC = () => {
  // Access translation function, custom styles, and page progress from context
  const { t, styles, location } = usePageContext(customStyles);

  // Access test navigation function from theme/context
  const { gotoNextTest } = useTheme();

  // State hooks to store slider values for each symptom
  const [concentration, setConcentration] = useState(0);
  const [wordfinding, setWordfinding] = useState(0);
  const [memory, setMemory] = useState(0);

  /**
   * Handle the next step when the user confirms their symptom ratings
   * - Converts numeric values to strings
   * - Stores the results in sessionStorage
   * - Proceeds to the next test screen
   */
  function nextStep() {
    const symptoms = {
      concentration: concentration.toString(),
      wordfinding: wordfinding.toString(),
      memory: memory.toString(),
    };

    sessionStorage.setItem('symptomsMental', JSON.stringify(symptoms));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        {/* Mental symptoms illustration */}
        <img src={require('../../images/mental.png')} style={{ maxWidth: '70px', width: '20vw' }} alt="Mental Symptoms" />

        <h1 style={styles.headline}>{t('screens.pre_test.symptoms.question')}</h1>

        {/* Slider for concentration */}
        <Slider type="symptoms" label={t('screens.pre_test.symptoms.concentration')} value={concentration} onChange={setConcentration} />

        {/* Slider for wordfinding */}
        <Slider type="symptoms" label={t('screens.pre_test.symptoms.wordfinding')} value={wordfinding} onChange={setWordfinding} />

        {/* Slider for memory */}
        <Slider type="symptoms" label={t('screens.pre_test.symptoms.memory')} value={memory} onChange={setMemory} />
      </div>

      {/* Footer with next button */}
      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={nextStep} text={t('screens.pre_test.symptoms.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireSymptomsMentalScreen;

/**
 * Custom styles function for this screen
 *
 * Receives colors object and returns style properties
 */
const customStyles = (colors: TColors) => ({});
