import { I18n } from 'i18n-js';
import { bs } from '../locales/bs';
import { en } from '../locales/en';

export type Locale = 'bs' | 'en';

const i18n = new I18n({ bs, en });

i18n.defaultLocale = 'bs';
i18n.enableFallback = true;

// Bosnian is always the default locale. Language is switched explicitly by the user.
i18n.locale = 'bs';

/**
 * Set the active locale. Called from useAppStore's setLanguage action.
 * This updates the i18n instance so t() returns the correct language
 * on the next render cycle (triggered by the store's language state change).
 */
export const setLocale = (locale: Locale): void => {
  i18n.locale = locale;
};

/**
 * Translate a dot-notation key, e.g. t('common.appName')
 */
export const t = (scope: string, options?: Record<string, unknown>): string => {
  return i18n.t(scope, options);
};

export { i18n };
