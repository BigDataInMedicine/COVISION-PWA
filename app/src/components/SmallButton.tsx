import React from 'react';
import useStyles from '../hooks/useStyles';
import { TColors } from '../style/colors';

/**
 * Props for the SmallButton component
 */
interface SmallButtonProps {
  /** Text to display inside the button (optional) */
  text?: string;

  /** Callback function triggered when the button is clicked */
  onClick: () => void;

  /** Optional inline styles to override default button styles */
  style?: React.CSSProperties;
}

/**
 * SmallButton Component
 *
 * A smaller, clickable button for the app.
 * Uses the `useStyles` hook to apply default styles and allows optional overrides.
 *
 * @param text - Button label text
 * @param onClick - Click handler function
 * @param style - Optional styles to override default button styling
 */
export const SmallButton: React.FC<SmallButtonProps> = ({ text, onClick, style }) => {
  // Generate styles based on default color palette
  const { styles } = useStyles(defaultStyles);

  return (
    <button
      onClick={onClick}
      style={{ ...styles.button, ...style }} // Merge default styles with optional overrides
      type="button"
    >
      <span style={styles.text}>{text}</span> {/* Display button text */}
    </button>
  );
};

/**
 * Default styles for the SmallButton component
 *
 * @param colors - color palette from TColors
 * @returns Object containing styles for button and text
 */
const defaultStyles = (colors: TColors) => ({
  button: {
    width: 120,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.black,
    borderRadius: 5,
    cursor: 'pointer',
    userSelect: 'none' as const, // prevent text selection inside button
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
