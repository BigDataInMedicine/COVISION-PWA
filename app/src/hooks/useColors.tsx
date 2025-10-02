import { useContext } from 'react';
import { TColors } from '../style/colors';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Return type for the useColors hook
 */
interface ColorType {
  /** Current color palette */
  colors: TColors;

  /** Function to update/apply a new color palette */
  applyColors: (colors: TColors) => void;
}

/**
 * useColors Hook
 *
 * Provides access to the current theme colors and the `applyColors` function
 * from the ThemeContext. This allows components to read the color palette
 * or update it dynamically.
 *
 * Throws an error if used outside of a ThemeContext provider.
 *
 * @returns Object containing current colors and applyColors function
 */
const useColors = (): ColorType => {
  const store = useContext(ThemeContext);

  if (!store) {
    throw new Error('useColors must be used within a ThemeContext provider.');
  }

  return {
    colors: store.colors,
    applyColors: store.applyColors,
  };
};

export default useColors;
