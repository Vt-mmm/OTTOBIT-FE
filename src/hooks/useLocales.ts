import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { Language } from "common/enums/language.enum";
import { StorageKeys } from "constants/storageKeys";

export default function useLocales() {
  const { t, i18n } = useTranslation();

  const currentLang = (i18n.language || Language.VI) as Language;

  const onChangeLang = useCallback(
    (newLang: Language) => {
      i18n.changeLanguage(newLang);
      localStorage.setItem(StorageKeys.I18_LANGUAGE, newLang);
    },
    [i18n]
  );

  return {
    t,
    translate: t, // Alias cho t để đồng nhất với convention
    currentLang,
    onChangeLang,
    allLangs: Object.values(Language),
  };
}
