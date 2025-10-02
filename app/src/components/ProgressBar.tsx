import React from 'react';
import useStyles from '../hooks/useStyles';
import { TColors } from '../style/colors';

/**
 * Props for the ProgressBar component
 */
interface ProgressBarProps {
  /** Current value of the progress */
  value: number;

  /** Maximum value of the progress */
  max: number;
}

/**
 * ProgressBar Component
 *
 * A simple horizontal progress bar that visually represents the
 * completion percentage based on `value` and `max`.
 *
 * @param value - Current progress value
 * @param max - Maximum progress value
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  // Generate styles based on default color palette
  const { styles } = useStyles(defaultStyles);

  // Calculate percentage, clamped between 0 and 100
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div style={styles.container}>
      {/* Inner bar representing the progress */}
      <div
        style={{
          ...styles.content,
          width: `${percentage}%`, // dynamic width based on progress
        }}
      />
    </div>
  );
};

/**
 * Default styles for the ProgressBar component
 *
 * @param colors - color palette from TColors
 * @returns Object containing styles for container and inner content
 */
const defaultStyles = (colors: TColors) => ({
  container: {
    width: '80%', // progress bar width relative to parent
    backgroundColor: colors.white,
    borderRadius: '8px',
    border: '1px solid',
    borderColor: colors.black,
    overflow: 'hidden', // ensures content doesn't overflow rounded corners
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const, // required for absolute inner content
    fontSize: '12px',
    fontWeight: 'bold',
    color: colors.black,
  },
  content: {
    backgroundColor: colors.secondary, // progress fill color
    height: '100%',
    position: 'absolute' as const,
    left: 0,
    top: 0,
    zIndex: 0,
    transition: 'width 0.3s ease', // smooth width animation
  },
});
