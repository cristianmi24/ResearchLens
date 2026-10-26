import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, LogOut, Menu, X } from "lucide-react";
import { NavList } from "@/components/navigation/NavList";
import { UserCard } from "@/components/layout/UserCard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <div className="lg:hidden">
      {/* ── Header fijo ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-white/80 px-4 backdrop-blur-xl">
        {/* Logo + toggle */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("nav.menu", "Abrir menú")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pastel-lavender text-pastel-lavender-ink transition-transform hover:scale-105 focus-ring"
          >
            <Menu size={20} />
          </button>
          <Link to="/inicio" className="focus-ring rounded-lg" aria-label="Zetia">
            <img src="/logos/zetia.webp" alt="Zetia" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Desplegable de idioma compacto en el header */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-border/80 bg-white/90 px-3 text-xs font-semibold transition-colors hover:bg-white focus-ring"
          >
            <Globe size={13} className="text-pastel-sky-ink" />
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
                className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card-hover)]"
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
                          ? "bg-pastel-lavender text-brand-700 font-semibold"
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
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menu", "Menú")}
              className="absolute left-0 top-0 flex h-full w-80 max-w-[88vw] flex-col overflow-y-auto overscroll-contain bg-gradient-to-b from-white via-[#f7f9ff] to-pastel-sky shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-4">
                <img src="/logos/zetia.webp" alt="Zetia" className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("nav.closeMenu", "Cerrar menú")}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink-secondary transition-colors hover:bg-white focus-ring"
                >
                  <X size={20} />
                </button>
              </div>

              {user && (
                <div className="px-3 pb-2">
                  <UserCard user={user} />
                </div>
              )}

              <nav aria-label={t("nav.menu", "Menú")} className="flex-1 px-3 py-3">
                <NavList layoutId="mobilenav-active" onNavigate={() => setOpen(false)} />
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
                            ? "bg-white text-brand-700 font-semibold shadow-[var(--shadow-card)] ring-1 ring-border"
                            : "text-ink-primary hover:bg-white/70",
                        ].join(" ")}
                      >
                        <span className="text-base leading-none">{opt.flag}</span>
                        <span className="flex-1 text-left">{opt.label}</span>
                        {isActive && <Check size={14} className="shrink-0 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {user && (
                <div className="border-t border-border/60 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-status-critical-text transition-colors hover:bg-status-critical-bg focus-ring"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    {t("nav.logout", "Cerrar sesión")}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
