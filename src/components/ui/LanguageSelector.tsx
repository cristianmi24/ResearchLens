import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";
import { cn } from "@/utils/cn";

interface LanguageSelectorProps {
  className?: string;
  variant?: "pill" | "dropdown" | "tabs";
  buttonClassName?: string;
}

export function LanguageSelector({ className, variant = "pill", buttonClassName }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) ?? LANGUAGE_OPTIONS[0];

  if (variant === "tabs") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface-muted border border-border", className)}>
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-ring",
              language === option.code
                ? "bg-white text-ink-primary shadow-xs"
                : "text-ink-secondary hover:text-ink-primary hover:bg-white/50"
            )}
          >
            <span>{option.flag}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar idioma / Change language / Mudar idioma"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-ring",
          "border border-border/80 bg-white/80 hover:bg-white text-ink-primary backdrop-blur-sm shadow-2xs",
          buttonClassName
        )}
      >
        <Globe size={13} className="text-brand-600" />
        <span>{currentOption.flag}</span>
        <span>{currentOption.shortLabel}</span>
        <ChevronDown size={11} className={cn("text-ink-muted transition-transform duration-150", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-border shadow-lg py-1 z-50 animate-fade-in">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                setLanguage(option.code);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left",
                language === option.code
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-ink-primary hover:bg-surface-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{option.flag}</span>
                <span>{option.label}</span>
              </div>
              {language === option.code && <Check size={13} className="text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
