import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { PageTemplate, usePageContext } from '../../components/PageTemplate';
import { SmallButton } from '../../components/SmallButton';
import Checkbox from '../../components/Checkbox';

/**
 * NoTestNowScreen Component
 *
 * Displays a set of reasons why the user may choose not to take a test now.
 * The user can select one option or provide a custom reason ("other").
 *
 * Selected answer is stored in sessionStorage under `noTestNow`
 * and the navigation proceeds either forward or backward in the flow.
 */
const NoTestNowScreen: React.FC = () => {
  // Access translation function, styles, and navigation from context
  const { t, styles, navigate } = usePageContext(customStyles);

  // State for selected option
  const [selectedOption, setSelectedOption] = useState<string>('');
  // State for input when "other" is chosen
  const [otherInputs, setOtherInputs] = useState<string[]>([]);

  /**
   * Handler for selecting a predefined option
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  /**
   * Handler for updating free-text input (when "other" is selected)
   */
  const handleOtherInputsUpdate = (values: string[]) => {
    setOtherInputs(values);
  };

  /**
   * Save selected answer and go to test end
   */
  function next() {
    let data = null;

    if (selectedOption === 'other') {
      data = { reason: otherInputs[0] };
    } else {
      data = { reason: selectedOption };
    }

    sessionStorage.setItem('noTestNow', JSON.stringify(data));
    navigate('/test-end', { replace: true });
  }

  /**
   * Navigate back to previous step
   */
  function back() {
    navigate('/q/duration', { replace: true });
  }

  return (
    <PageTemplate>
      <div style={{ paddingTop: 40 }}>
        <div style={styles.content}>
          {/* Screen question */}
          <h1 style={styles.title}>{t('screens.general.no_test_now.question')}</h1>

          {/* Answer options */}
          <Checkbox
            mode="single"
            name="no_test"
            value="fatigued"
            label={t('screens.general.no_test_now.answer_fatigued')}
            checked={selectedOption === 'fatigued'}
            onChange={handleChange}
          />
          <Checkbox
            mode="single"
            name="no_test"
            value="time"
            label={t('screens.general.no_test_now.answer_time')}
            checked={selectedOption === 'time'}
            onChange={handleChange}
          />
          <Checkbox
            mode="single"
            name="no_test"
            value="mood"
            label={t('screens.general.no_test_now.answer_mood')}
            checked={selectedOption === 'mood'}
            onChange={handleChange}
          />
          <Checkbox
            mode="single"
            name="no_test"
            value="other"
            label={t('screens.general.no_test_now.answer_other')}
            checked={selectedOption === 'other'}
            onChange={handleChange}
            showInputField
            onInputUpdate={handleOtherInputsUpdate}
          />
          <Checkbox
            mode="single"
            name="no_test"
            value="no_response"
            label={t('screens.general.no_test_now.answer_no_response')}
            checked={selectedOption === 'no_response'}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Footer with navigation buttons */}
      <div style={styles.footer}>
        <SmallButton onClick={back} text={t('screens.general.no_test_now.back')} />
        <SmallButton onClick={next} text={t('screens.general.no_test_now.next')} />
      </div>
    </PageTemplate>
  );
};

export default NoTestNowScreen;

/**
 * Custom styles function for this screen
 *
 * Receives colors object and returns style properties
 */
const customStyles = (colors: TColors) => ({});
