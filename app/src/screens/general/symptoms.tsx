import React, { useState } from 'react';
import { PageTemplate, usePageContext } from '../../components/PageTemplate';
import { TColors } from '../../style/colors';
import { SmallButton } from '../../components/SmallButton';
import { Database } from '../../db/Database';

/**
 * SymptomsScreen Component
 *
 * Allows users to enter self-reported symptoms during onboarding.
 * Stores symptoms in the local database and navigates to home after submission.
 */
const SymptomsScreen: React.FC = () => {
  const { styles, navigate, t } = usePageContext(customStyles);
  const [fields, setFields] = useState(['']);

  /**
   * Updates a symptom input and adds a new field if the last one is filled.
   */
  const handleChange = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    if (index === fields.length - 1 && value.trim() !== '') newFields.push('');
    setFields(newFields);
  };

  /**
   * Saves all non-empty symptoms to the database and navigates to home.
   */
  const finish = async () => {
    const db = Database.getInstance();
    for (const symptom of fields.filter(Boolean)) {
      await db.add('symptoms', { symptom });
    }
    navigate('/home');
  };

  return (
    <PageTemplate>
      <div style={styles.container}>
        <div style={{ paddingTop: 40 }}>
          <h1 style={styles.title}>{t('screens.symptoms.title')}</h1>
        </div>

        <div style={styles.content}>
          {fields.map((val, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={t('screens.symptoms.add')}
              value={val}
              onChange={(e) => handleChange(idx, e.target.value)}
              style={styles.input}
            />
          ))}
        </div>

        <div style={styles.footer}>
          <div></div>
          <SmallButton onClick={finish} text={t('screens.symptoms.finish')} />
        </div>
      </div>
    </PageTemplate>
  );
};

export default SymptomsScreen;

/**
 * Custom styles for the symptoms input screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object with layout and input styling
 */
const customStyles = (colors: TColors) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    flexGrow: 1,
    padding: '0 2rem',
    overflowY: 'auto',
    marginBottom: '20px',
  },
  input: {
    width: '80%',
    maxWidth: '400px',
    padding: '0.6em',
    fontSize: '1rem',
    borderRadius: '0.3em',
    border: `1px solid ${colors.gray}`,
    boxSizing: 'border-box' as const,
  },
});
