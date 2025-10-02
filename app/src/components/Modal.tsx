import React from 'react';
import { TColors } from '../style/colors';
import useStyles from '../hooks/useStyles';

/**
 * Props for the Modal component
 */
type ModalProps = {
  /** Optional title displayed at the top of the modal */
  title?: string;

  /** Optional text displayed below the title */
  text?: string;

  /** Content to be rendered inside the modal, usually buttons or forms */
  children: React.ReactNode;
};

/**
 * Modal Component
 *
 * A centered overlay modal that displays optional title and text,
 * and renders any children inside a buttons/content container.
 *
 * @param title - Optional title text
 * @param text - Optional body text
 * @param children - React nodes to render inside the modal
 */
export const Modal: React.FC<ModalProps> = ({ title, text, children }) => {
  // Generate styles based on default color palette
  const { styles } = useStyles(defaultStyles);

  // Convert children to array to simplify layout logic
  const childrenArray = React.Children.toArray(children);
  const isSingleChild = childrenArray.length === 1; // check if only one child

  // Dynamic styles for the container holding the buttons/children
  const buttonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: isSingleChild ? 'center' : 'space-between', // center if single, space-between otherwise
    gap: '1rem',
    marginTop: 24,
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Optional title */}
        {title && <h2 style={styles.title}>{title}</h2>}

        {/* Optional body text */}
        {text && <p style={styles.text}>{text}</p>}

        {/* Children container, usually buttons */}
        <div style={buttonsContainerStyle}>{childrenArray}</div>
      </div>
    </div>
  );
};

/**
 * Default styles for the Modal component
 *
 * @param colors - color palette from TColors
 * @returns Object containing styles for overlay, modal, title, and text
 */
const defaultStyles = (colors: TColors) => ({
  overlay: {
    position: 'fixed' as const, // fixed positioning to cover viewport
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // ensure overlay is above other content
  },
  modal: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 8,
    maxWidth: 400,
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: `0 4px 12px ${colors.shadow}`,
  },
  title: {
    marginTop: 0,
    color: colors.textPrimary,
  },
  text: {
    whiteSpace: 'pre-line',
    color: colors.textPrimary,
    marginTop: 8,
  },
});
