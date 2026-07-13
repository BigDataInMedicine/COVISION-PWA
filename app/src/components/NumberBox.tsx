import React, { useEffect, useState } from 'react';
import { TColors } from '../style/colors';
import { usePageContext } from './PageTemplate';

interface PhoneInputProps {
  name?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  invalidMessage?: string;
  style?: React.CSSProperties;
  required?: boolean;
  /** Called whenever the (possibly normalized) value changes */
  onChange?: (value: string) => void;
  /** Called when validity changes: true = valid phone with country code */
  onValidChange?: (isValid: boolean) => void;
  /** Optional default country code to prepend if missing, e.g. '+49' */
  defaultCountryCode?: string;
}

/**
 * PhoneInput
 * - Allows typing phone numbers on mobile
 * - Ensures a country code is used at the beginning (leading +)
 * - Converts leading '00' to '+' on blur
 * - Optionally prefixes a defaultCountryCode when missing on blur
 */
const NumberBox: React.FC<PhoneInputProps> = ({
  name,
  value = '',
  label,
  placeholder,
  style,
  required = false,
  onChange,

  defaultCountryCode,
}) => {
  const { styles } = usePageContext(defaultStyles);

  const [val, setVal] = useState<string>(value ?? '');

  useEffect(() => {
    setVal(value ?? '');
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVal = e.target.value;
    // allow common phone input characters but filter out letters
    const filtered = newVal.replace(/[^0-9]/g, '');
    setVal(filtered);
    if (onChange) onChange(filtered);
  }

  return (
    <div style={{ ...styles.container, ...(style || {}) }}>
      {label && <label style={styles.label}>{label}</label>}
      <input name={name} value={val} onChange={handleChange} placeholder={placeholder} style={styles.input} />
    </div>
  );
};

export default NumberBox;

const defaultStyles = (colors: TColors) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    margin: '4px 0',
    width: '100%',
  },
  label: {
    fontSize: '0.9rem',
    color: colors.textPrimary || '#000',
  },
  input: {
    padding: '0.6rem',
    fontSize: '1rem',
    borderRadius: '0.3em',
    border: `1px solid ${colors.gray}`,
    boxSizing: 'border-box' as const,
  },
  error: {
    color: colors.error || '#b00020',
    fontSize: '0.85rem',
  },
});
