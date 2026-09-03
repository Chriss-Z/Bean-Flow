import { useSettings } from "../context/SettingsContext";

import { en } from "../i18n/en";
import { id } from "../i18n/id";

const translations = {
  English: en,
  Indonesia: id,
};

export function useTranslation() {
  const { settings } = useSettings();

  const language = settings?.general?.language || "Indonesia";

  const dictionary = translations[language] || id;

  const t = (key) => {
    const keys = key.split(".");
    let value = dictionary;

    for (const currentKey of keys) {
      value = value?.[currentKey];
    }

    return value ?? key;
  };

  return {
    t,
    language,
  };
}
