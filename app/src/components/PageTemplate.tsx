import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from '../hooks/useStyles';
import { useNavigate, useLocation } from 'react-router-dom';
import { TColors } from '../style/colors';

/**
 * Props for PageTemplate component
 */
export type PageTemplateProps = {
  /** Children elements to render inside the page */
  children: React.ReactNode;

  /** Whether to hide the progress bar */
  withoutProgressbar?: boolean;
};

/**
 * PageTemplate Component
 *
 * A wrapper for pages that provides consistent layout and styling.
 * Typically used to wrap individual pages in the app.
 *
 * @param children - page content
 */
export const PageTemplate: React.FC<PageTemplateProps> = ({ children }) => {
  const { styles } = usePageContext(); // retrieve merged styles from context
  return <div style={styles.page}>{children}</div>;
};

/**
 * usePageContext Hook
 *
 * Provides a unified page context including:
 * - colors from theme
 * - merged default + custom styles
 * - translation function
 * - navigation and location objects from react-router
 *
 * @param customStyles - optional custom styles to merge with defaults
 * @returns Object containing t, colors, styles, navigate, location
 */
export const usePageContext = (customStyles?: (customColors: TColors) => any) => {
  const { colors } = useStyles(() => ({})); // get color palette
  const defaultStylesObj = defaultStyles(colors); // default page styles
  const customStylesObj = customStyles ? customStyles(colors) : {}; // optional custom styles
  const mergedStyles = { ...defaultStylesObj, ...customStylesObj }; // merge styles
  const { styles } = useStyles(() => mergedStyles); // generate final styles

  const { t } = useTranslation(); // translation function
  const navigate = useNavigate(); // router navigation
  const location = useLocation(); // current route location

  return { t, colors, styles, navigate, location };
};

/**
 * Default styles for PageTemplate component
 *
 * @param colors - color palette from TColors
 * @returns Object containing default styles for the page template
 */
const defaultStyles = (colors: TColors) => ({
  page: {
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
  },
  titleBar: {
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: colors.backgroundHeader,
    borderBottom: '1px solid #ccc',
    boxSizing: 'border-box',
    padding: '0 16px',
    zIndex: 1000,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '40rem',
    padding: '2rem',
    boxSizing: 'border-box',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    flexGrow: 1,
  },
  footer: {
    width: '90%',
    marginBottom: '1em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headline: {
    fontSize: '1.25rem',
    margin: '0 0 10px 0',
  },
  subheadline: {
    fontSize: '1rem',
    margin: '0 0 10px 0',
  },
  text: {
    fontSize: '1rem',
    textAlign: 'center' as const,
    fontWeight: 500,
    margin: '10px auto 10px',
    whiteSpace: 'pre-line',
  },
  neutralButton: {}, // placeholder for neutral buttons
  positivButton: {
    backgroundColor: colors.accept,
  },
  negativeButton: {
    backgroundColor: colors.error,
  },
});
