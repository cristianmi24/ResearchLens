import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Language } from "./types";
import { translations, type TranslationKey } from "./translations";

const STORAGE_KEY = "researchlens_lang";
const DEFAULT_LANGUAGE: Language = "es";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "es" || saved === "en" || saved === "pt") {
      return saved;
    }
    // Detect browser language
    const browserLang = navigator.language?.toLowerCase() ?? "";
    if (browserLang.startsWith("pt")) return "pt";
    if (browserLang.startsWith("en")) return "en";
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(
    () => (key: TranslationKey | string, fallback?: string): string => {
      const dict = translations[language] || translations.es;
      return (dict as any)[key] ?? (translations.es as any)[key] ?? fallback ?? key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage debe usarse dentro de <LanguageProvider>");
  }
  return ctx;
}
