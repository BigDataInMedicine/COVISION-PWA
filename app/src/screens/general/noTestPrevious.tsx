import React, { useState, useEffect } from 'react';
import { TColors } from '../../style/colors';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { SmallButton } from '../../components/SmallButton';
import Checkbox from '../../components/Checkbox';

/**
 * NoTestPreviousScreen Component
 *
 * Displays a reason selection screen when a user missed a scheduled test.
 * Allows users to explain why they skipped the test and records the decision.
 * Stores the reason and test number in sessionStorage and marks the test as "done later" in localStorage.
 * Proceeds to the test end screen after submission.
 */
const NoTestPreviousScreen: React.FC = () => {
  // Access translation function, styles, and navigation from context
  const { t, styles, navigate } = usePageContext(customStyles);

  // State for selected reason (from predefined options or "other")
  const [selectedReason, setSelectedReason] = useState<string>('');

  // State for free-text input when "other" is selected
  const [otherInputs, setOtherInputs] = useState<string[]>([]);

  // State for the number of the missed test (e.g., test #5)
  const [missedTestNumber, setMissedTestNumber] = useState<number | null>(null);

  // State for the time the missed test was scheduled (formatted as HH:MM)
  const [missedTestTime, setMissedTestTime] = useState<string>('');

  /**
   * useEffect: Detect the most recent missed test
   *
   * Iterates through localStorage markers (`markerStatus1`, `markerStatus2`, ...)
   * to find the latest test that was marked as "missed".
   *
   * - If a missed test is found, its number and scheduled time are extracted
   * - The time is formatted to HH:MM (e.g., "14:30") for user clarity
   * - States are updated accordingly
   *
   * This ensures the screen dynamically reflects the correct test context
   * without requiring manual input.
   */
  useEffect(() => {
    let latestMissed: { number: number; time: string } | null = null;

    // Loop through test markers until a non-existent one is found
    for (let i = 1; ; i++) {
      const status = localStorage.getItem(`markerStatus${i}`);
      if (!status) break;

      if (status === 'missed') {
        const timeStr = localStorage.getItem(`markerTestTime${i}`);
        latestMissed = { number: i, time: timeStr ?? '' };
      }
    }

    // If a missed test was found, update state
    if (latestMissed) {
      setMissedTestNumber(latestMissed.number);
      setMissedTestTime(formatTime(latestMissed.time));
    }
  }, []);

  /**
   * Helper function: Format time string from "HH:MM:SS" to "HH:MM"
   *
   * @param timeStr - Time string in format "HH:MM:SS" or "HH:MM"
   * @returns Formatted time string as "HH:MM"
   */
  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * Handler for selecting a predefined reason
   *
   * Updates the selected reason state based on the input value.
   * This is used for all radio-style checkboxes.
   *
   * @param e - Change event from the checkbox input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedReason(e.target.value);
  };

  /**
   * Handler for updating free-text input when "other" is selected
   *
   * Updates the `otherInputs` state with the current value(s) from the input field.
   * Automatically sets the selected reason to "other" if any text is entered.
   *
   * @param values - Array of strings from the input field (supports multiple lines)
   */
  const handleOtherInputsUpdate = (values: string[]) => {
    setOtherInputs(values);

    if (values.length > 0) {
      setSelectedReason('other');
    }
  };

  /**
   * Navigate to the test end screen after saving data
   *
   * - If no test number is available (e.g., no missed test), proceed directly
   * - Otherwise, store:
   *   - The test number and reason in `sessionStorage` under `no_test_previous`
   *   - Mark the test as "done later" in `localStorage` to prevent re-prompting
   * - Redirect to `/test-end` with `replace: true` to avoid back navigation
   *
   * The reason is stored as a JSON string to support both single values and arrays.
   */
  function next() {
    if (!missedTestNumber) {
      navigate('/test-end', { replace: true });
      return;
    }

    let data: any = { testNumber: missedTestNumber };

    if (selectedReason.includes('other') && otherInputs.length > 0) {
      data.reason = JSON.stringify(otherInputs);
    } else {
      data.reason = JSON.stringify(selectedReason);
    }

    sessionStorage.setItem('no_test_previous', JSON.stringify(data));
    localStorage.setItem(`markerStatus${missedTestNumber}`, 'done_later');

    navigate('/test-end', { replace: true });
  }

  return (
    <TestTemplate withoutProgressbar>
      <div style={styles.content}>
        {/* Main question with dynamic time placeholder */}
        <h1 style={styles.title}>{t('screens.general.no_test_previous.question', { time: missedTestTime })}</h1>

        {/* Predefined reasons */}
        <Checkbox
          mode="single"
          name="reason"
          value="fatigue"
          label={t('screens.general.no_test_previous.answer_fatigue')}
          checked={selectedReason === 'fatigue'}
          onChange={handleChange}
        />
        <Checkbox
          mode="single"
          name="reason"
          value="time"
          label={t('screens.general.no_test_previous.answer_time')}
          checked={selectedReason === 'time'}
          onChange={handleChange}
        />
        <Checkbox
          mode="single"
          name="reason"
          value="mood"
          label={t('screens.general.no_test_previous.answer_mood')}
          checked={selectedReason === 'mood'}
          onChange={handleChange}
        />
        <Checkbox
          mode="single"
          name="reason"
          value="notification_missing"
          label={t('screens.general.no_test_previous.answer_notification_missing')}
          checked={selectedReason === 'notification_missing'}
          onChange={handleChange}
        />
        <Checkbox
          mode="single"
          name="reason"
          value="notification_missed"
          label={t('screens.general.no_test_previous.answer_notification_missed')}
          checked={selectedReason === 'notification_missed'}
          onChange={handleChange}
        />
        <Checkbox
          mode="single"
          name="reason"
          value="internet"
          label={t('screens.general.no_test_previous.answer_internet')}
          checked={selectedReason === 'internet'}
          onChange={handleChange}
        />

        {/* Custom "other" reason with input field */}
        <Checkbox
          mode="single"
          name="reason"
          value="other"
          label={t('screens.general.no_test_previous.answer_other')}
          checked={selectedReason === 'other'}
          onChange={handleChange}
          showInputField
          onInputUpdate={handleOtherInputsUpdate}
        />

        {/* Divider for visual separation */}
        <hr style={{ width: '90%' }} />

        {/* Additional reasons (e.g., no response, wrong test) */}
        <Checkbox
          mode="single"
          name="reason"
          value="no_response"
          label={t('screens.general.no_test_previous.answer_no_response')}
          checked={selectedReason === 'no_response'}
          onChange={handleChange}
        />
        <Checkbox
          mode="single"
          name="reason"
          value="wrong"
          label={t('screens.general.no_test_previous.answer_wrong')}
          checked={selectedReason === 'wrong'}
          onChange={handleChange}
        />
      </div>

      {/* Footer with single "Next" button */}
      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.mood.next')} />
      </div>
    </TestTemplate>
  );
};

export default NoTestPreviousScreen;

/**
 * Custom styles function for this screen
 *
 * Receives the color theme and returns style objects.
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
