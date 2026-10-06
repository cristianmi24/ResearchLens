import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, LogOut } from "lucide-react";
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

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    logout();
    navigate("/");
  }

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

  const currentLang = LANGUAGE_OPTIONS.find((o) => o.code === language) ?? LANGUAGE_OPTIONS[0];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-gradient-to-b from-white to-brand-50/40">

      {/* ── Header: Logo ── */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <img src="/logo.png" alt="ResearchLens logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
        <span className="font-semibold text-ink-primary tracking-tight">ResearchLens</span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to !== "/projects"}
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
                    layoutId="sidebar-active"
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

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-border">

        {/* ── Selector de idioma desplegable ── */}
        <div className="px-3 py-3" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-muted transition-all focus-ring group"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Globe size={14} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest leading-none mb-0.5">
                {t("settings.languageTitle", "Idioma")}
              </p>
              <p className="text-sm font-medium text-ink-primary flex items-center gap-1.5">
                <span>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
              </p>
            </div>
            <ChevronDown
              size={15}
              className={`text-ink-muted transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="mt-1.5 rounded-xl border border-border bg-white shadow-lg overflow-hidden"
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
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                        isActive
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-ink-primary hover:bg-surface-muted",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span className="flex-1">{opt.label}</span>
                      {isActive && <Check size={14} className="text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Usuario + cerrar sesión ── */}
        {user && (
          <div className="px-3 py-3 border-t border-border/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-xs font-semibold">
                {initials(user.firstName, user.lastName, user.email)}
              </div>
              <div className="min-w-0">
                {(user.firstName || user.lastName) && (
                  <p className="text-xs font-semibold text-ink-primary truncate leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                )}
                <p className="text-[11px] text-ink-secondary truncate leading-tight" title={user.email}>
                  {user.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t("nav.logout", "Cerrar sesión")}
              title={t("nav.logout", "Cerrar sesión")}
              className="shrink-0 p-1.5 rounded-lg text-ink-secondary hover:bg-[var(--color-status-critical-bg)] hover:text-[var(--color-status-critical-text)] focus-ring transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
