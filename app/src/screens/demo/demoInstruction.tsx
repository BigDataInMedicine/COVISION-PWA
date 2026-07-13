import { TColors } from '../../style/colors';
import { DemoTemplate, usePageContext } from '../../components/DemoTemplate';
import { SmallButton } from '../../components/SmallButton';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../localization/i18n';
import { Trans } from 'react-i18next';

const DemoInstructionScreen: React.FC = () => {
  const { t, styles, location } = usePageContext(customStyles);
  const { gotoNextDemo, gotoPrevDemo, currentInstructions, currentImage } = useTheme();
  const currentLang = i18n.language;
  const demoInstructionsText = currentInstructions != null ? t('screens.demo.instructions.' + currentInstructions) : '';

  /** Navigate to next step of the tutorial */
  function next() {
    gotoNextDemo();
  }

  /**
   * Navigate back to previous step of the tutroial
   */
  function back() {
    gotoPrevDemo();
  }

  return (
    <DemoTemplate page={location.state !== null ? location.state.progress : 0}>
      <div style={styles.content}>
        {demoInstructionsText != null ? (
          <div style={styles.title}>
            <Trans
              i18nKey="demo.instructions"
              values={{ addr: t('general.support_mail') }}
              components={{
                // content comes from language file / value
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                email: <a href={`mailto:${t('general.support_mail')}`} />,
              }}
            >
              {demoInstructionsText}
            </Trans>
          </div>
        ) : null}

        {currentImage != null ? <img src={`../../images/tutorial_images/${currentLang}/${currentImage}`} style={{ maxHeight: '50vh' }} alt="" /> : null}
      </div>
      <div style={styles.footer}>
        <div></div>
        <SmallButton onClick={back} text={t('screens.general.no_test_now.back')} />
        <SmallButton onClick={next} text={t('screens.weekly.ill.next')} />
      </div>
    </DemoTemplate>
  );
};

export default DemoInstructionScreen;

/**
 * Custom styles for the substances questionnaire screen
 *
 * @param colors - Theme colors object (TColors)
 * @returns Style object for this component
 */
const customStyles = (colors: TColors) => ({});
