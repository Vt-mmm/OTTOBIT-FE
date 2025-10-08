import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./en";
import viTranslations from "./vi";
import { StorageKeys } from "constants/storageKeys";
import { Language } from "common/enums/language.enum";

const resources = {
  en: {
    translations: enTranslations,
  },
  vi: {
    translations: viTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem(StorageKeys.I18_LANGUAGE) || Language.VI,
    fallbackLng: Language.VI,
    ns: ["translations"],
    defaultNS: "translations",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: StorageKeys.I18_LANGUAGE,
    },
  });

export default i18n;
