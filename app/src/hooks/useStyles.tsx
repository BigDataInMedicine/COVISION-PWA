import React, { useMemo } from 'react';
import { TColors } from '../style/colors';
import useColors from './useColors';

/**
 * Return type for the useStyles hook
 *
 * @template T - object containing CSSProperties
 */
interface Styles<T> {
  /** Current color palette */
  colors: TColors;

  /** Generated styles object */
  styles: T;
}

/**
 * useStyles Hook
 *
 * Generates a styles object based on the current color palette.
 * Recomputes styles only when the color palette or the style-creating function changes.
 *
 * @template T - object containing CSSProperties
 * @param createStyle - function that takes colors and returns a styles object
 * @returns Object containing current colors and generated styles
 */
export default function useStyles<T extends Record<string, React.CSSProperties>>(createStyle: (colors: TColors) => T): Styles<T> {
  // Get current color palette from useColors hook
  const { colors } = useColors();

  // Memoize the generated styles to avoid unnecessary recalculations
  const styles = useMemo(() => createStyle(colors), [colors, createStyle]);

  return { colors, styles };
}
