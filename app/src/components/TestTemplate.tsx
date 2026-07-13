import React, { useState } from 'react';
import { PageTemplate, PageTemplateProps, usePageContext } from './PageTemplate';
import { ProgressBar } from './ProgressBar';
import { Modal } from './Modal';
import { SmallButton } from './SmallButton';
import { TColors } from '../style/colors';
import questionMark from '../images/question_mark.svg';
import { useTheme } from '../context/ThemeContext';
import { version } from '../context/version';

/**
 * Props for TestTemplate component
 */
interface TestTemplateProps extends PageTemplateProps {
  /** Current page number for the progress bar */
  page?: number;

  /** Whether to hide the progress bar */
  withoutProgressbar?: boolean;

  /** Whether to hide the help button and modal */
  withoutHelp?: boolean;
}

/**
 * TestTemplate Component
 *
 * Provides a consistent layout for test screens with:
 * - title bar
 * - optional progress bar
 * - help and exit buttons
 * - confirmation and help modals
 *
 * @param children - test page content
 * @param page - current test page number
 * @param withoutProgressbar - hide the progress bar if true
 */
export const TestTemplate: React.FC<TestTemplateProps> = ({ children, page = 5, withoutProgressbar = false, withoutHelp = false }) => {
  const { t, styles, navigate } = usePageContext(defaultStyles); // get translations, styles, and navigation
  const { getRouteCount } = useTheme(); // get total number of test pages

  // Local state for showing help and confirm modals
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const demoStage = localStorage.getItem('demoStage');
  const { currentInstructions } = useTheme();
  const supportEmail = t('general.support_mail');

  const withoutEndTest = demoStage === 'demoOngoing' && currentInstructions !== 'finishEarly';

  /** Show the help modal */
  function showHelpModal() {
    setShowHelp(true);
  }

  /** Close the help modal */
  function handleClose() {
    setShowHelp(false);
  }

  /** Show the exit confirmation modal */
  function endTest() {
    setShowConfirm(true);
  }

  /** Handle confirming the test exit */
  function handleConfirm() {
    setShowConfirm(false);
    navigate('/test-end', { replace: true, state: { exit: true } });
  }

  /** Cancel exiting the test */
  function handleCancel() {
    setShowConfirm(false);
  }

  return (
    <PageTemplate>
      {/* Title bar with help button, progress bar and end button */}
      <div style={styles.titleBar}>
        {!withoutHelp && (
          <button style={styles.helpButton} onClick={showHelpModal}>
            <img
              src={questionMark}
              style={{
                maxWidth: '30px',
                width: '15vw',
                maxHeight: '30px',
                height: '15vw',
              }}
              alt=""
            />
          </button>
        )}

        {!withoutProgressbar && <ProgressBar value={page} max={getRouteCount()} />}

        {!withoutEndTest && (
          <button style={styles.endButton} onClick={endTest}>
            <img src={require('../images/door.png')} style={{ maxWidth: '30px', width: '15vw' }} alt="" />
          </button>
        )}
      </div>

      {/* Test page content */}
      <div style={{ paddingTop: 40 }}>{children}</div>

      {/* Exit confirmation modal */}
      {showConfirm && (
        <Modal title={t('screens.general.exit.end_title')} text={t('screens.general.exit.end_question')}>
          <SmallButton text={t('screens.general.exit.end_confirm_no')} onClick={handleCancel} style={styles.neutralButton} />
          <SmallButton text={t('screens.general.exit.end_confirm_yes')} onClick={handleConfirm} style={styles.negativeButton} />
        </Modal>
      )}

      {/* Help modal */}
      {!withoutHelp && showHelp && (
        <Modal title={t('screens.general.help.title')} text={t('screens.general.help.text')}>
          <p style={{ alignItems: 'center' }}>
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            <SmallButton
              text={t('screens.general.help.confirm')}
              onClick={handleClose}
              style={{ ...styles.neutralButton, margin: '0 auto', marginTop: '20px', marginBottom: '20px' }}
            />
            Version: {version}
          </p>
        </Modal>
      )}
    </PageTemplate>
  );
};

/**
 * Default styles for TestTemplate component
 *
 * @param colors - color palette from TColors
 * @returns Object containing default styles
 */
const defaultStyles = (colors: TColors) => ({
  helpButton: {
    position: 'absolute',
    left: '4px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
  },
  endButton: {
    position: 'absolute',
    right: '4px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
  },
});

export { usePageContext };
