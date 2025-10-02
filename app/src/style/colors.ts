export type ColorTheme = {
  background: string;
  backgroundHeader: string;
  primary: string;
  secondary: string;
  textSecondary: string;
  textPrimary: string;
  shadow: string;
};

const uol = {
  main: '#003e6b',
  blue: {
    one: { '100': '#004e9f', '80': 'rgba(0, 78, 159, 0.8)', '40': 'rgba(0, 78, 159, 0.4)' },
    two: { '100': '#00abd9', '80': 'rgba(0, 171, 217, 0.8)', '40': 'rgba(0, 171, 217, 0.4)' },
    three: { '100': '#5bc5f2', '80': 'rgba(91, 197, 242, 0.8)', '40': 'rgba(91, 197, 242, 0.4)' },
    four: { '100': '#a1d9f8', '80': 'rgba(161, 217, 248, 0.8)', '40': 'rgba(161, 217, 248, 0.4)' },
  },
  green: {
    one: { '100': '#007878', '80': 'rgba(0, 120, 120, 0.8)', '40': 'rgba(0, 120, 120, 0.4)' },
    two: { '100': '#00a879', '80': 'rgba(0, 168, 121, 0.8)', '40': 'rgba(0, 168, 121, 0.4)' },
    three: { '100': '#94c11c', '80': 'rgba(148, 193, 28, 0.8)', '40': 'rgba(148, 193, 28, 0.4)' },
    four: { '100': '#c7d300', '80': 'rgba(199, 211, 0, 0.8)', '40': 'rgba(199, 211, 0, 0.4)' },
  },
  orange: {
    one: { '100': '#d53b0a', '80': 'rgba(213, 59, 10, 0.8)', '40': 'rgba(213, 59, 10, 0.4)' },
    two: { '100': '#ee7100', '80': 'rgba(238, 113, 0, 0.8)', '40': 'rgba(238, 113, 0, 0.4)' },
    three: { '100': '#f39100', '80': 'rgba(243, 145, 0, 0.8)', '40': 'rgba(243, 145, 0, 0.4)' },
    four: { '100': '#fdc300', '80': 'rgba(253, 195, 0, 0.8)', '40': 'rgba(253, 195, 0, 0.4)' },
  },
};

const sharedColors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#CCCCCC',
  shadow: 'rgba(0,0,0,0.3)',
  accept: '#0B6623',
  error: '#FF0000',
};

type SharedColors = typeof sharedColors;

export type TColors = ColorTheme & SharedColors;

type ColorPalettes = {
  light: TColors;
  dark: TColors;
};

const UolColors: ColorPalettes = {
  dark: {
    background: uol.main,
    backgroundHeader: uol.main,
    primary: uol.blue.four[100],
    secondary: uol.blue.two[100],
    textPrimary: sharedColors.white,
    textSecondary: sharedColors.black,
    ...sharedColors,
  },
  light: {
    background: sharedColors.white,
    backgroundHeader: uol.blue.four[100],
    primary: uol.blue.one[100],
    secondary: uol.blue.three[100],
    textPrimary: sharedColors.black,
    textSecondary: sharedColors.white,
    ...sharedColors,
  },
};

export default UolColors;
