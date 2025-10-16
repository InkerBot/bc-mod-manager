import language_en from "./EN.json";
import language_cn from "./CN.json";
import {LogService} from "../service/LogService.ts";

const registry: { [k: string]: { [k: string]: string } } = {
  'EN': language_en,
  'CN': language_cn,
}

let lastLanguage: string | undefined = undefined;
setInterval(() => {
  if (typeof TranslationLanguage !== 'undefined' && TranslationLanguage !== lastLanguage) {
    lastLanguage = TranslationLanguage;
    LogService.debug(`Language changed to ${TranslationLanguage}`);
    window.bmm.app.forceUpdate()
  }
}, 5000);

export default function i18n(key: string, variables?: Record<string, string | number>): string {
  let translation = registry[lastLanguage || 'EN']?.[key];
  if (typeof translation !== 'string') {
    translation = registry['EN']?.[key] || `missing translation: ${key}`;
  }

  if (variables) {
    for (const varKey in variables) {
      translation = translation.replace(`{${varKey}}`, String(variables[varKey]));
    }
  }
  return translation;
}
