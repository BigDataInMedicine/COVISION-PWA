import React, { useState } from 'react';
import { TColors } from '../style/colors';
import { usePageContext } from './PageTemplate';

/**
 * Mode type for the checkbox: either single (radio behavior) or multi (checkbox behavior)
 */
type Mode = 'single' | 'multi';

/**
 * Props for the Checkbox component
 */
interface CheckboxProps {
  /** Mode of the checkbox: 'single' for radio, 'multi' for multiple checkboxes */
  mode?: Mode;

  /** Name attribute of the input element */
  name: string;

  /** Value attribute of the input element */
  value: string;

  /** Label text displayed next to the input */
  label: string;

  /** Whether the checkbox/radio is checked */
  checked: boolean;

  /** Optional inline styles for the container */
  style?: React.CSSProperties;

  /** Change handler triggered when the input state changes */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /** Whether to show an additional text input field */
  showInputField?: boolean;

  /** Callback triggered when text input(s) are updated */
  onInputUpdate?: (values: string[]) => void;
}

/**
 * Checkbox Component
 *
 * A flexible checkbox or radio button component that optionally allows the user
 * to specify custom values through an input field. Supports both single and
 * multiple selection modes.
 *
 * @param mode - Mode of the checkbox ('single' or 'multi')
 * @param name - Name attribute for the input element
 * @param value - Value attribute for the input element
 * @param label - Label text displayed next to the input
 * @param checked - Boolean indicating if the checkbox/radio is checked
 * @param onChange - Callback function when input changes
 * @param showInputField - Whether to render a text input for custom values
 * @param onInputUpdate - Callback triggered when input field values change
 */
const Checkbox: React.FC<CheckboxProps> = ({ mode = 'multi', name, value, label, checked, onChange, showInputField = false, onInputUpdate }) => {
  // Get translations and styles from the page context
  const { t, styles } = usePageContext(defaultStyles);

  // Local state for text input values (for optional input fields)
  const [inputs, setInputs] = useState<string[]>(['']);

  /**
   * Handle changes to the text input fields
   *
   * @param index - Index of the input field being changed
   * @param newValue - New string value from the input field
   */
  const handleInputChange = (index: number, newValue: string) => {
    if (mode === 'single') {
      // SINGLE MODE: Only one input value is allowed
      const updated = [newValue];
      setInputs(updated);

      // If the checkbox/radio isn't checked yet and input is not empty,
      // trigger the onChange callback with a fake event to mark it as checked
      if (!checked && newValue.trim() !== '') {
        const fakeEvent = {
          target: { name, value },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(fakeEvent);
      }

      // Notify parent of non-empty input values
      if (onInputUpdate) {
        onInputUpdate(updated.filter((v) => v.trim() !== ''));
      }
    } else {
      // MULTI MODE: Allow multiple input values
      const updated = [...inputs];
      updated[index] = newValue;

      // If the last input is filled, append a new empty input for additional entries
      if (index === updated.length - 1 && newValue.trim() !== '') {
        updated.push('');
      }

      setInputs(updated);

      // Trigger onChange for first non-empty input if checkbox wasn't checked
      if (!checked && newValue.trim() !== '') {
        const fakeEvent = {
          target: { name, value },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(fakeEvent);
      }

      // Notify parent of non-empty input values
      if (onInputUpdate) {
        onInputUpdate(updated.filter((v) => v.trim() !== ''));
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Label and main input (checkbox or radio) */}
      <label style={styles.label}>
        <input
          type={mode === 'single' ? 'radio' : 'checkbox'}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
        />
        <span style={{ flex: 1 }}>{label}</span>
      </label>

      {/* Optional text input field(s) */}
      {showInputField &&
        (mode === 'single' ? (
          <input
            type="text"
            value={inputs[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            placeholder={t('components.specify')}
            style={styles.input}
          />
        ) : (
          inputs.map((val, idx) => (
            <input
              key={idx}
              type="text"
              value={val}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              placeholder={t('components.specify')}
              style={styles.input}
            />
          ))
        ))}
    </div>
  );
};

export default Checkbox;

/**
 * Default styles for the Checkbox component
 * @param colors - color palette from TColors
 */
const defaultStyles = (colors: TColors) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    padding: '0',
    margin: '4px 0',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    width: '100%',
  },
  input: {
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid',
    borderColor: colors.gray,
    borderRadius: '0.25rem',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
});
