import language_en from "./en.json";

const registry: {[k: string]: {[k: string]: string}} = {
  "en": language_en,
}
const language = 'en'

export default function i18n(key: string, variables?: Record<string, string | number>): string {
  let translation = registry[language][key] || ("missing key " + key);
  if (variables) {
    for (const varKey in variables) {
      translation = translation.replace(`{${varKey}}`, String(variables[varKey]));
    }
  }
  return translation;
}
