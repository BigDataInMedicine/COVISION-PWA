import React from 'react';
import { TColors } from '../style/colors';
import useStyles from '../hooks/useStyles';

/**
 * Props for the BigButton component
 */
interface BigButtonProps {
  /** Text to display inside the button (optional) */
  text?: string;

  /** Callback function triggered when the button is clicked */
  onClick: () => void;

  /** Optional CSS styles to override the default button styles */
  style?: React.CSSProperties;

  /** Indicates whether the button is disabled */
  disabled?: boolean;
}

/**
 * BigButton Component
 *
 * A large, clickable button for the app.
 * Uses the `useStyles` hook to apply default styles and dynamic colors.
 *
 * @param text - The button label
 * @param onClick - Click handler function
 * @param style - Additional styles to override default styling
 * @param disabled - If true, the button will be disabled
 */
export const BigButton: React.FC<BigButtonProps> = ({ text, onClick, style, disabled }) => {
  // Generate styles based on default color scheme
  const { styles } = useStyles(defaultStyles);

  return (
    <button
      onClick={onClick} // Trigger the provided click handler
      style={{ ...styles.button, ...style }} // Combine default styles with optional overrides
      type="button"
      disabled={disabled} // Disable button if `disabled` is true
    >
      <span style={styles.text}>{text}</span> {/* Render button text with styling */}
    </button>
  );
};

/**
 * Default styles for the BigButton component
 *
 * @param colors - Color palette from TColors
 * @returns An object containing styles for the button and its text
 */
const defaultStyles = (colors: TColors) => ({
  button: {
    width: 200,
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.black,
    borderRadius: 5,
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
