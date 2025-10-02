import React, { useEffect, useState } from 'react';
import { TColors } from '../../style/colors';
import { SmallButton } from '../../components/SmallButton';
import { TestTemplate, usePageContext } from '../../components/TestTemplate';
import { Slider } from '../../components/Slider';
import { useTheme } from '../../context/ThemeContext';
import { Database } from '../../db/Database';

/**
 * QuestionnaireSymptomsPhysicalScreen Component
 *
 * Collects user-reported physical symptoms after a test session.
 * Loads symptoms from local database and displays them as sliders.
 * Stores severity ratings in sessionStorage and proceeds to next test.
 */
const QuestionnaireSymptomsPhysicalScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextTest } = useTheme();

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, number>>({});

  /**
   * On mount: Loads user-reported symptoms from IndexedDB.
   * Initializes slider values to 0 for each symptom.
   * Handles errors gracefully.
   */
  useEffect(() => {
    const db = Database.getInstance();

    db.getAll('symptoms')
      .then((result) => {
        const symptomNames = result.map((s: any) => s.symptom);

        setSymptoms(symptomNames);

        const initialValues: Record<string, number> = {};
        symptomNames.forEach((name) => (initialValues[name] = 0));
        setValues(initialValues);
      })
      .catch((err) => {
        console.error('Error loading symptoms:', err);
      });
  }, []);

  /**
   * Updates the severity value for a specific symptom.
   * @param symptom - Name of the symptom
   * @param newValue - New severity value (0–10)
   */
  function handleChange(symptom: string, newValue: number) {
    setValues((prev) => ({
      ...prev,
      [symptom]: newValue,
    }));
  }

  /**
   * Saves symptom severity ratings to sessionStorage.
   * Converts values to strings and stores as JSON.
   * Proceeds to next test via `gotoNextTest`.
   */
  function next() {
    const formatted = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.toString()]));

    sessionStorage.setItem('symptomsPhysical', JSON.stringify(formatted));
    gotoNextTest();
  }

  return (
    <TestTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        <h1 style={styles.headline}>{t('screens.post_test.symptoms.question')}</h1>

        {symptoms.map((symptom) => (
          <Slider key={symptom} type="symptoms" label={symptom} value={values[symptom] ?? 0} onChange={(val) => handleChange(symptom, val)} />
        ))}
      </div>

      <div style={styles.footer}>
        <div></div>

        <SmallButton onClick={next} text={t('screens.post_test.symptoms.next')} />
      </div>
    </TestTemplate>
  );
};

export default QuestionnaireSymptomsPhysicalScreen;

/**
 * Custom styles for the physical symptoms questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
