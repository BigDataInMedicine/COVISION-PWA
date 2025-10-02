import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { SmallButton } from '../../components/SmallButton';
import Checkbox from '../../components/Checkbox';
import { useTheme } from '../../context/ThemeContext';

/**
 * LastTestOpinionScreen Component
 *
 * Collects user feedback about their experience with the last test session.
 * The screen has two parts:
 *  - Energy comparison: how long the energy lasted compared to normal
 *  - PEM (Post-Exertional Malaise): whether the test had a negative impact
 *
 * The answers are stored in sessionStorage under `last_survey_opinion`,
 * and the flow then continues to the next test screen.
 */
const LastTestOpinionScreen: React.FC = () => {
  // Access translation function, styles, and navigation context
  const { t, styles, location } = usePageContext(customStyles);

  // Access function to navigate to the next test
  const { gotoNextTest } = useTheme();

  // State to store selected answers
  const [selectedEnergy, setSelectedEnergy] = useState<string>('');
  const [selectedPEM, setSelectedPEM] = useState<string>('');

  /**
   * Handlers for updating state when a checkbox is selected
   */
  const handleChangeEnergy = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEnergy(e.target.value);
  };

  const handleChangePEM = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPEM(e.target.value);
  };

  /**
   * Save answers and go to next test
   */
  function next() {
    const opinion = { energy: selectedEnergy, pem: selectedPEM };
    sessionStorage.setItem('last_survey_opinion', JSON.stringify(opinion));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        {/* Energy-related question */}
        <div style={{ width: '100%' }}>
          <p style={styles.text}>{t('screens.general.last_test_opinion.energy.question', { time: '17:30' })}</p>

          {/* Energy answer options */}
          <Checkbox
            mode="single"
            name="energy"
            value="much_shorter"
            label={t('screens.general.last_test_opinion.energy.answer_much_shorter')}
            checked={selectedEnergy === 'much_shorter'}
            onChange={handleChangeEnergy}
          />
          <Checkbox
            mode="single"
            name="energy"
            value="shorter"
            label={t('screens.general.last_test_opinion.energy.answer_shorter')}
            checked={selectedEnergy === 'shorter'}
            onChange={handleChangeEnergy}
          />
          <Checkbox
            mode="single"
            name="energy"
            value="equal"
            label={t('screens.general.last_test_opinion.energy.answer_equal')}
            checked={selectedEnergy === 'equal'}
            onChange={handleChangeEnergy}
          />
          <Checkbox
            mode="single"
            name="energy"
            value="longer"
            label={t('screens.general.last_test_opinion.energy.answer_longer')}
            checked={selectedEnergy === 'longer'}
            onChange={handleChangeEnergy}
          />
          <Checkbox
            mode="single"
            name="energy"
            value="much_longer"
            label={t('screens.general.last_test_opinion.energy.answer_much_longer')}
            checked={selectedEnergy === 'much_longer'}
            onChange={handleChangeEnergy}
          />

          {/* Divider line */}
          <hr style={{ width: '90%' }} />

          {/* No response option */}
          <Checkbox
            mode="single"
            name="energy"
            value="no_response"
            label={t('screens.general.last_test_opinion.energy.answer_no_response')}
            checked={selectedEnergy === 'no_response'}
            onChange={handleChangeEnergy}
          />
        </div>

        {/* PEM-related question */}
        <div style={{ width: '100%', marginTop: '30px' }}>
          <p style={styles.text}>{t('screens.general.last_test_opinion.pem.question', { time: '17:30' })}</p>

          {/* PEM answer options */}
          <Checkbox
            mode="single"
            name="pem"
            value="yes"
            label={t('screens.general.last_test_opinion.pem.answer_yes')}
            checked={selectedPEM === 'yes'}
            onChange={handleChangePEM}
          />
          <Checkbox
            mode="single"
            name="pem"
            value="no"
            label={t('screens.general.last_test_opinion.pem.answer_no')}
            checked={selectedPEM === 'no'}
            onChange={handleChangePEM}
          />
          <Checkbox
            mode="single"
            name="pem"
            value="unsure_relation"
            label={t('screens.general.last_test_opinion.pem.answer_unsure_relation')}
            checked={selectedPEM === 'unsure_relation'}
            onChange={handleChangePEM}
          />
          <Checkbox
            mode="single"
            name="pem"
            value="no_response"
            label={t('screens.general.last_test_opinion.pem.answer_no_response')}
            checked={selectedPEM === 'no_response'}
            onChange={handleChangePEM}
          />
        </div>
      </div>

      {/* Footer with next button */}
      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.general.last_test_opinion.next')} />
      </div>
    </TestTemplate>
  );
};

export default LastTestOpinionScreen;

/**
 * Custom styles function for this screen
 *
 * Receives colors object and returns style properties
 */
const customStyles = (colors: TColors) => ({});
