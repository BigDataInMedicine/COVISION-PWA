import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { SmallButton } from '../../components/SmallButton';
import Checkbox from '../../components/Checkbox';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireSubstancesScreen Component
 *
 * Collects user-reported substance use after a test session.
 * Supports multi-selection with exclusive single choice for "nothing".
 * Includes free-text input for "other" substances.
 * Stores data in sessionStorage and proceeds to next test.
 */
const QuestionnaireSubstancesScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextTest } = useTheme();
  const [selectedSubstances, setSelectedSubstances] = useState<string[]>([]);
  const [otherInputs, setOtherInputs] = useState<string[]>([]);
  const substances: string[] = t('screens.post_test.substances.options', { returnObjects: true });

  /**
   * Handles checkbox changes with exclusive logic for 'nothing'.
   * Ensures only one of 'nothing' can be selected.
   * Updates the substances selection state accordingly.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const isExclusive = value === 'nothing';

    const updateState = (prev: string[], val: string): string[] => {
      if (isExclusive) {
        return [val];
      }

      let cleaned = prev.filter((v) => v !== 'nothing');

      if (cleaned.includes(val)) {
        return cleaned.filter((v) => v !== val);
      } else {
        return [...cleaned, val];
      }
    };

    setSelectedSubstances((prev) => updateState(prev, value));
  };

  /**
   * Updates free-text input for "other" substances.
   */
  const handleOtherInputsUpdate = (values: string[]) => {
    setOtherInputs(values);
  };

  /**
   * Saves substance data to sessionStorage.
   * If "other" is selected, includes custom inputs.
   * Proceeds to next test via `gotoNextTest`.
   */
  function next() {
    let data = null;

    if (selectedSubstances.includes('other') && otherInputs.length > 0) {
      data = { substances: JSON.stringify([...selectedSubstances, ...otherInputs]) };
    } else {
      data = { substances: JSON.stringify(selectedSubstances) };
    }

    sessionStorage.setItem('substances', JSON.stringify(data));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        <h1 style={styles.headline}>{t('screens.post_test.substances.question')}</h1>

        {substances.map((substance) => (
          <Checkbox
            key={substance}
            name="substances"
            value={substance}
            label={substance}
            checked={selectedSubstances.includes(substance)}
            onChange={handleChange}
          />
        ))}

        <Checkbox
          mode="multi"
          name="substances"
          value="other"
          label={t('screens.post_test.substances.other')}
          checked={selectedSubstances.includes('other')}
          onChange={handleChange}
          showInputField
          onInputUpdate={handleOtherInputsUpdate}
        />

        <hr style={{ width: '90%' }} />

        <Checkbox
          mode="single"
          name="substances"
          value="nothing"
          label={t('screens.post_test.substances.nothing')}
          checked={selectedSubstances.includes('nothing')}
          onChange={handleChange}
        />
      </div>

      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.substances.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireSubstancesScreen;

/**
 * Custom styles for the substances questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
