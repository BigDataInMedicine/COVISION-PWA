import React from 'react';
import useStyles from '../hooks/useStyles';
import { TColors } from '../style/colors';

/**
 * Props for the TimeButton component
 */
interface TimeButtonProps {
  /** Callback function triggered when the button is clicked */
  onClick: () => void;

  /** Optional text to display inside the button */
  text?: string;

  /** Optional inline styles to override the button container styles */
  style?: React.CSSProperties;

  /** Optional inline styles to override the button text styles */
  styleText?: React.CSSProperties;
}

/**
 * TimeButton Component
 *
 * A button designed to display time or similar information.
 * Allows overriding styles for both the button container and text.
 *
 * @param text - Optional label text inside the button
 * @param onClick - Click handler function
 * @param style - Optional styles to override default button container styling
 * @param styleText - Optional styles to override default text styling
 */
export const TimeButton: React.FC<TimeButtonProps> = ({ text, onClick, style, styleText }) => {
  // Generate styles based on default color palette
  const { styles } = useStyles(defaultStyles);

  return (
    <button
      onClick={onClick}
      style={{ ...styles.button, ...style }} // Merge default and custom container styles
      type="button"
    >
      <span style={{ ...styles.text, ...styleText }}>{text}</span> {/* Merge default and custom text styles */}
    </button>
  );
};

/**
 * Default styles for the TimeButton component
 *
 * @param colors - color palette from TColors
 * @returns Object containing styles for button container and text
 */
const defaultStyles = (colors: TColors) => ({
  button: {
    width: 300,
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.primary,
    borderRadius: 5,
    cursor: 'pointer',
    userSelect: 'none' as const, // prevent text selection
  },
  text: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
