import React, { useState } from 'react';
import { TColors } from '../../style/colors';
import { SmallButton } from '../../components/SmallButton';
import Checkbox from '../../components/Checkbox';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuestionnaireActivitiesMust Component
 *
 * Collects user-reported activities after a test session.
 * Distinguishes between mandatory (must) and optional (free) activities.
 * Handles exclusive selection (single choice) and multi-selection.
 * Stores data in sessionStorage and proceeds to next test.
 */
const QuestionnaireActivitiesMust: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const [selectedMust, setSelectedMust] = useState<string[]>([]);
  const [selectedFree, setSelectedFree] = useState<string[]>([]);
  const { gotoNextTest } = useTheme();

  /**
   * Handles checkbox changes with special logic for exclusive options.
   * Ensures only one of 'not_challenging' or 'no_activities' can be selected.
   * Updates either must or free activity list based on input name.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    const isExclusive = value === 'not_challenging' || value === 'no_activities';

    const updateState = (prev: string[], val: string): string[] => {
      if (isExclusive) {
        return [val];
      }

      let cleaned = prev.filter((v) => v !== 'not_challenging' && v !== 'no_activities');

      if (cleaned.includes(val)) {
        return cleaned.filter((v) => v !== val);
      } else {
        return [...cleaned, val];
      }
    };

    if (name === 'activities_free') {
      setSelectedFree((prev) => updateState(prev, value));
    } else if (name === 'activities_must') {
      setSelectedMust((prev) => updateState(prev, value));
    }
  };

  /**
   * Saves selected activities to sessionStorage and proceeds to next test.
   * Stores both must and free activity selections as JSON strings.
   */
  function next() {
    const activities = { selectedMust: JSON.stringify(selectedMust), selectedFree: JSON.stringify(selectedFree) };
    sessionStorage.setItem('activities', JSON.stringify(activities));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        <img src={require('../../images/activities.png')} style={{ maxWidth: '200px', width: '50vw' }} alt="" />

        <h1 style={{ ...styles.headline, margin: '10px 0' }}>{t('screens.post_test.activities_must.question')}</h1>

        <div style={{ width: '100%' }}>
          <p style={{ ...styles.text, margin: '10px auto 0 0', marginRight: 'auto', textAlign: 'left', textDecoration: 'underline' }}>
            {t('screens.post_test.activities_must.title')}
          </p>
          <p style={{ ...styles.text, margin: '1px auto 5px 0', textAlign: 'left', fontWeight: 400 }}>{t('screens.post_test.activities_must.examples')}</p>

          <Checkbox
            mode="multi"
            name="activities_must"
            value="physical"
            label={t('screens.post_test.activities_must.answer_physical')}
            checked={selectedMust.includes('physical')}
            onChange={handleChange}
          />
          <Checkbox
            mode="multi"
            name="activities_must"
            value="mental"
            label={t('screens.post_test.activities_must.answer_mental')}
            checked={selectedMust.includes('mental')}
            onChange={handleChange}
          />
          <hr />
          <Checkbox
            mode="single"
            name="activities_must"
            value="not_challenging"
            label={t('screens.post_test.activities_must.answer_not_challenging')}
            checked={selectedMust.includes('not_challenging')}
            onChange={handleChange}
          />
          <Checkbox
            mode="single"
            name="activities_must"
            value="no_activities"
            label={t('screens.post_test.activities_must.answer_no_activities')}
            checked={selectedMust.includes('no_activities')}
            onChange={handleChange}
          />

          <p style={{ ...styles.text, margin: '30px auto 0 0', marginRight: 'auto', textAlign: 'left', textDecoration: 'underline' }}>
            {t('screens.post_test.activities_free.title')}
          </p>
          <p style={{ ...styles.text, margin: '1px auto 5px 0', textAlign: 'left', fontWeight: 400 }}>{t('screens.post_test.activities_free.examples')}</p>

          <Checkbox
            mode="multi"
            name="activities_free"
            value="physical"
            label={t('screens.post_test.activities_free.answer_physical')}
            checked={selectedFree.includes('physical')}
            onChange={handleChange}
          />
          <Checkbox
            mode="multi"
            name="activities_free"
            value="mental"
            label={t('screens.post_test.activities_free.answer_mental')}
            checked={selectedFree.includes('mental')}
            onChange={handleChange}
          />
          <hr />
          <Checkbox
            mode="single"
            name="activities_free"
            value="not_challenging"
            label={t('screens.post_test.activities_free.answer_not_challenging')}
            checked={selectedFree.includes('not_challenging')}
            onChange={handleChange}
          />
          <Checkbox
            mode="single"
            name="activities_free"
            value="no_activities"
            label={t('screens.post_test.activities_free.answer_no_activities')}
            checked={selectedFree.includes('no_activities')}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.activities_must.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireActivitiesMust;

/**
 * Custom styles for the activities questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
