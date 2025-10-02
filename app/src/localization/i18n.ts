import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as translations from './translations';
import type { LanguageDetectorModule } from 'i18next';

/**
 * Key used to store the selected language in localStorage
 */
const STORE_LANGUAGE_KEY = 'language';

/**
 * Custom language detector plugin for i18next
 *
 * - Detects the user's language from localStorage
 * - Falls back to 'en' if not set or on error
 * - Caches the selected language in localStorage
 */
const languageDetectorPlugin: LanguageDetectorModule = {
  type: 'languageDetector',

  /** Initialization hook (not needed here) */
  init: () => {},

  /** Detect the current language */
  detect: () => {
    try {
      const language = localStorage.getItem(STORE_LANGUAGE_KEY);
      return language || 'en';
    } catch {
      return 'en';
    }
  },

  /** Cache the selected language */
  cacheUserLanguage: (language: string) => {
    try {
      localStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch {
      // ignore errors if localStorage is unavailable
    }
  },
};

/**
 * Convert translations object into i18next resources format
 *
 * Example:
 * { en: { translation: { ... } }, de: { translation: { ... } } }
 */
const resources = Object.fromEntries(Object.entries(translations).map(([lang, data]) => [lang, { translation: data }]));

/**
 * Initialize i18next
 */
i18n
  .use(initReactI18next) // Bind react-i18next to i18next
  .use(languageDetectorPlugin) // Use custom language detector
  .init({
    resources, // Translation resources
    compatibilityJSON: 'v3', // Ensures JSON v3 format compatibility
    fallbackLng: 'en', // Fallback language if detection fails
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;
