import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, Menu, X } from "lucide-react";
import { navItems } from "@/components/navigation/navItems";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useLanguage();

  const currentLang = LANGUAGE_OPTIONS.find((o) => o.code === language) ?? LANGUAGE_OPTIONS[0];

  // Cerrar al hacer click fuera
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div className="lg:hidden">
      {/* ── Header fijo ── */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        {/* Logo + toggle */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("nav.menu", "Abrir menú")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-muted hover:text-ink-primary transition-colors focus-ring"
          >
            <Menu size={20} />
          </button>
          <img src="/logo.png" alt="ResearchLens logo" className="h-7 w-7 object-contain rounded-md shadow-xs" />
          <span className="font-semibold text-ink-primary tracking-tight text-sm">ResearchLens</span>
        </div>

        {/* Desplegable de idioma compacto en el header */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border bg-white hover:bg-surface-muted transition-colors focus-ring"
          >
            <Globe size={13} className="text-brand-600" />
            <span>{currentLang.flag}</span>
            <span className="text-ink-primary">{currentLang.shortLabel}</span>
            <ChevronDown size={11} className={`text-ink-muted transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-border bg-white shadow-lg overflow-hidden z-50"
              >
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isActive = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        setLangOpen(false);
                      }}
                      className={[
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left",
                        isActive
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-ink-primary hover:bg-surface-muted",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span className="flex-1 text-xs">{opt.label}</span>
                      {isActive && <Check size={12} className="text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Drawer lateral ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40">
            <motion.button
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-ink-primary/35 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="absolute left-0 top-0 h-full w-72 max-w-[82vw] bg-white shadow-2xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="ResearchLens logo" className="h-6 w-6 object-contain rounded-md" />
                  <span className="font-semibold text-ink-primary text-sm">{t("nav.menu", "Menú")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar menú"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-muted transition-colors focus-ring"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to !== "/projects"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-secondary hover:bg-surface-muted hover:text-ink-primary",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="mobilenav-active-pill"
                            className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-brand-600"
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                          />
                        )}
                        <item.icon size={18} strokeWidth={2} className={isActive ? "text-brand-600" : undefined} />
                        {t(item.translationKey, item.label)}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Selector de idioma dentro del drawer */}
              <div className="px-3 py-3 border-t border-border/60">
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <Globe size={12} className="text-ink-muted" />
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest">
                    {t("settings.languageTitle", "Idioma")}
                  </span>
                </div>
                <div className="space-y-1">
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const isActive = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => {
                          setLanguage(opt.code);
                          setOpen(false);
                        }}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all focus-ring",
                          isActive
                            ? "bg-brand-600 text-white font-semibold"
                            : "text-ink-primary hover:bg-surface-muted",
                        ].join(" ")}
                      >
                        <span className="text-base leading-none">{opt.flag}</span>
                        <span className="flex-1 text-left">{opt.label}</span>
                        {isActive && <Check size={14} className="text-white/80 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
