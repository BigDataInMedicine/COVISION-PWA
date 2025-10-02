import React from 'react';
import { useTranslation } from 'react-i18next';
import { TColors } from '../style/colors';
import useStyles from '../hooks/useStyles';

/**
 * Props for the Slider component
 */
type SliderProps = {
  /** Type of the slider: determines images, text, min/max values */
  type: string;

  /** Current value of the slider */
  value: number;

  /** Callback function triggered when the slider value changes */
  onChange: (value: number) => void;

  /** Optional image to display in the middle (used when text=false) */
  image?: string;

  /** Optional label for the slider */
  label?: string;

  /** If true, display slider with textual labels instead of central image */
  text?: boolean;
};

/**
 * Slider Component
 *
 * A versatile slider component with optional textual labels or central image.
 * Supports multiple types that determine images, text labels, and min/max values.
 *
 * @param type - Slider type ('fatigue', 'symptoms', 'mood', 'performance', etc.)
 * @param value - Current slider value
 * @param onChange - Callback function to update value
 * @param image - Optional image displayed in the middle
 * @param label - Optional label text
 * @param text - If true, renders textual slider instead of image-based
 */
export const Slider: React.FC<SliderProps> = ({ type, value, onChange, image, label, text = false }) => {
  const { t } = useTranslation(); // Translation hook
  const { styles } = useStyles(defaultStyles); // Generate styles

  /**
   * Get left image based on slider type
   */
  function getImageLeft() {
    switch (type) {
      case 'fatigue':
        return 'battery_full.png';
      case 'symptoms':
        return 'good.svg';
      case 'mood':
        return 'bad.svg';
      case 'performance':
        return 'cancel.svg';
      default:
        return 'battery_full.png';
    }
  }

  /**
   * Get right image based on slider type
   */
  function getImageRight() {
    switch (type) {
      case 'fatigue':
        return 'battery_empty.png';
      case 'symptoms':
        return 'bad.svg';
      case 'mood':
        return 'good.svg';
      case 'performance':
        return 'check.png';
      default:
        return 'battery_full.png';
    }
  }

  /**
   * Get translation key for left text label
   */
  function getTextLeft() {
    switch (type) {
      case 'fatigue':
        return 'screens.general.fatigue.no_fatigue';
      case 'symptoms':
        return 'screens.pre_test.symptoms.no_symptoms';
      case 'mood':
        return 'screens.post_test.mood.bad';
      case 'performance':
        return 'screens.post_test.performance.no';
      default:
        return 'no_fatigue';
    }
  }

  /**
   * Get translation key for right text label
   */
  function getTextRight() {
    switch (type) {
      case 'fatigue':
        return 'screens.general.fatigue.strong_fatigue';
      case 'symptoms':
        return 'screens.pre_test.symptoms.strong_symptoms';
      case 'mood':
        return 'screens.post_test.mood.good';
      case 'performance':
        return 'screens.post_test.performance.yes';
      default:
        return 'strong_fatigue';
    }
  }

  /**
   * Get minimum slider value based on type
   */
  function getMinValue() {
    switch (type) {
      case 'performance':
        return 1;
      case 'fatigue':
      case 'symptoms':
      case 'mood':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Get maximum slider value based on type
   */
  function getMaxValue() {
    switch (type) {
      case 'performance':
        return 5;
      case 'fatigue':
      case 'symptoms':
      case 'mood':
        return 10;
      default:
        return 10;
    }
  }

  // Render slider with text labels if `text` is true
  if (text) {
    return (
      <div>
        {/* Optional label above slider */}
        <p style={styles.middleText}>{label}</p>

        <div style={styles.fatigueContainer}>
          {/* Left side: image + text */}
          <div style={styles.fatgueSideContainer}>
            <img src={require('../images/' + getImageLeft())} alt={getImageLeft()} style={{ ...styles.sideImage, maxWidth: '30px' }} />
            <p style={styles.sideText}>{t(getTextLeft())}</p>
          </div>

          {/* Middle: slider input */}
          <div style={styles.fatgueMidContainer}>
            <input
              type="range"
              min={getMinValue()}
              max={getMaxValue()}
              step={1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              style={styles.slider}
            />
            {value} {/* display current slider value */}
          </div>

          {/* Right side: image + text */}
          <div style={styles.fatgueSideContainer}>
            <img src={require('../images/' + getImageRight())} alt={getImageRight()} style={{ ...styles.sideImage, maxWidth: '35px' }} />
            <p style={styles.sideText}>{t(getTextRight())}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render slider with central image if `text` is false
  return (
    <div style={styles.fatigueContainer}>
      {/* Left side: image + text */}
      <div style={styles.fatgueSideContainer}>
        <img src={require('../images/' + getImageLeft())} alt={getImageLeft()} style={styles.sideImage} />
        <p style={styles.sideText}>{t(getTextLeft())}</p>
      </div>

      {/* Middle: image + label + slider */}
      <div style={styles.fatgueMidContainer}>
        <img src={image} alt="" style={styles.middleImage} />
        <p style={styles.middleLabel}>{label}</p>
        <input
          type="range"
          min={getMinValue()}
          max={getMaxValue()}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={styles.slider}
        />
        {value} {/* display current slider value */}
      </div>

      {/* Right side: image + text */}
      <div style={styles.fatgueSideContainer}>
        <img src={require('../images/' + getImageRight())} alt={getImageRight()} style={styles.sideImage} />
        <p style={styles.sideText}>{t(getTextRight())}</p>
      </div>
    </div>
  );
};

/**
 * Custom styles for Slider component
 * @param colors - color palette from TColors
 */
const defaultStyles = (colors: TColors) => ({
  fatigueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    maxWidth: '90vw',
    margin: '0 auto',
  },
  fatgueSideContainer: {
    width: '20vw',
    maxWidth: '100px',
    height: '50%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fatgueMidContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1rem',
    paddingBottom: '4.375rem',
  },
  sideText: {
    fontSize: '0.75rem',
    textAlign: 'center' as const,
    fontWeight: 500,
    margin: '0.3rem auto 0.6rem',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word' as const,
  },
  middleText: {
    fontSize: '1.1rem',
    textAlign: 'center' as const,
    fontWeight: 500,
    margin: '0.2rem auto 0.1rem',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word' as const,
  },
  middleLabel: {
    fontSize: '1.25rem',
    textAlign: 'center' as const,
    fontWeight: 500,
    margin: '0.3rem auto 0.6rem',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word' as const,
  },
  sideImage: {
    width: '18vw',
    maxWidth: '70px',
  },
  middleImage: {
    width: '15vw',
    maxWidth: '50px',
  },
  slider: {
    width: '40vw',
    height: '15vw',
    maxWidth: '200px',
    maxHeight: '40px',
    accentColor: colors.primary, // color of the slider track and thumb
  },
});
