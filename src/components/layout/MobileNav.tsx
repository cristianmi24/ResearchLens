import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, LogOut, Menu, X } from "lucide-react";
import { navItems } from "@/components/navigation/navItems";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";

function initials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  }
  return (email?.[0] ?? "?").toUpperCase();
}

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
          <img src="/logos/zetia-icon.webp" alt="Zetia logo" className="h-9 w-9 object-contain rounded-md shadow-xs" />
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
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menu", "Menú")}
              className="absolute left-0 top-0 flex h-full w-80 max-w-[88vw] flex-col bg-white shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/logos/zetia-icon.webp" alt="Zetia logo" className="h-6 w-6 object-contain rounded-md" />
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

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overscroll-contain">
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

              {user && (
                <div className="border-t border-border px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                  <div className="mb-2 flex items-center gap-2.5 px-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-semibold text-white">
                      {initials(user.firstName, user.lastName, user.email)}
                    </div>
                    <div className="min-w-0">
                      {(user.firstName || user.lastName) && (
                        <p className="truncate text-sm font-semibold leading-tight text-ink-primary">
                          {user.firstName} {user.lastName}
                        </p>
                      )}
                      <p className="truncate text-xs leading-tight text-ink-secondary" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                  </div>
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
