export type Language = "es" | "en" | "pt";

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  shortLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "es", label: "Español", flag: "🇪🇸", shortLabel: "ES" },
  { code: "en", label: "English", flag: "🇺🇸", shortLabel: "EN" },
  { code: "pt", label: "Português", flag: "🇧🇷", shortLabel: "PT" },
];
