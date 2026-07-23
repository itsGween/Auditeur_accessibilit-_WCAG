import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './languages';
import commonFr from './locales/fr/common.json';
import commonEn from './locales/en/common.json';

export const defaultNamespace = 'common';

void i18n.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: defaultNamespace,
  resources: {
    fr: { common: commonFr },
    en: { common: commonEn },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
