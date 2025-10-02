import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { SmallButton } from '../../components/SmallButton';
import Checkbox from '../../components/Checkbox';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireActivitiesRecovery Component
 *
 * Collects user-reported recovery activities after a test session.
 * Supports multi-selection with exclusive single choice for "no recovery".
 * Includes free-text input for "other" activities.
 * Stores data in sessionStorage and proceeds to next test.
 */
const QuestionnaireActivitiesRecovery: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const [selectedRecovery, setSelectedRecovery] = useState<string[]>([]);
  const [otherInputs, setOtherInputs] = useState<string[]>([]);
  const { gotoNextTest } = useTheme();

  /**
   * Handles checkbox changes with exclusive logic for 'no_recovery'.
   * Ensures only one of 'no_recovery' can be selected.
   * Updates the recovery selection state accordingly.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const isExclusive = value === 'no_recovery';

    const updateState = (prev: string[], val: string): string[] => {
      if (isExclusive) {
        return [val];
      }

      let cleaned = prev.filter((v) => v !== 'no_recovery');

      if (cleaned.includes(val)) {
        return cleaned.filter((v) => v !== val);
      } else {
        return [...cleaned, val];
      }
    };

    setSelectedRecovery((prev) => updateState(prev, value));
  };

  /**
   * Saves recovery data to sessionStorage.
   * If "other" is selected, includes custom inputs.
   * Proceeds to next test via `gotoNextTest`.
   */
  function next() {
    let recovery = null;

    if (selectedRecovery.includes('other') && otherInputs.length > 0) {
      recovery = { substances: JSON.stringify([...selectedRecovery, ...otherInputs]) };
    } else {
      recovery = { substances: JSON.stringify(selectedRecovery) };
    }

    sessionStorage.setItem('recovery', JSON.stringify(recovery));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        <img src={require('../../images/activities.png')} style={{ maxWidth: '200px', width: '50vw' }} alt="" />

        <h1 style={{ ...styles.headline, margin: '10px 0' }}>{t('screens.post_test.activities_recovery.question')}</h1>

        <Checkbox
          mode="multi"
          name="recovery_multi"
          value="physical"
          label={t('screens.post_test.activities_recovery.answer_rested')}
          checked={selectedRecovery.includes('physical')}
          onChange={handleChange}
        />
        <Checkbox
          mode="multi"
          name="recovery_multi"
          value="mental"
          label={t('screens.post_test.activities_recovery.answer_slept')}
          checked={selectedRecovery.includes('mental')}
          onChange={handleChange}
        />
        <Checkbox
          mode="multi"
          name="recovery_multi"
          value="social"
          label={t('screens.post_test.activities_recovery.answer_retreated')}
          checked={selectedRecovery.includes('social')}
          onChange={handleChange}
        />

        <Checkbox
          mode="multi"
          name="recovery_multi"
          value="other"
          label={t('screens.post_test.activities_recovery.answer_other')}
          checked={selectedRecovery.includes('other')}
          onChange={handleChange}
          showInputField
          onInputUpdate={setOtherInputs}
        />

        <hr />

        <Checkbox
          mode="single"
          name="recovery_single"
          value="no_recovery"
          label={t('screens.post_test.activities_recovery.answer_nothing')}
          checked={selectedRecovery.includes('no_recovery')}
          onChange={handleChange}
        />
      </div>

      <div style={styles.footer}>
        <div></div>
        <SmallButton onClick={next} text={t('screens.post_test.activities_recovery.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireActivitiesRecovery;

/**
 * Custom styles for the recovery activities screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
