import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, LogOut } from "lucide-react";
import { NavList } from "@/components/navigation/NavList";
import { UserCard } from "@/components/layout/UserCard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";

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
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border/70 bg-gradient-to-b from-white/90 via-[#f7f9ff]/90 to-pastel-sky/70 backdrop-blur-xl">
      {/* ── Logo ── */}
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link to="/inicio" className="focus-ring rounded-lg" aria-label="Zetia">
          <img src="/logos/zetia.webp" alt="Zetia" className="h-9 w-auto" />
        </Link>
      </div>

      {/* ── Perfil ── */}
      {user && (
        <div className="px-3 pb-2">
          <UserCard user={user} />
        </div>
      )}

      {/* ── Navegación ── */}
      <nav aria-label={t("nav.menu", "Menú")} className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">{t("nav.menu", "Menú")}</p>
        <NavList layoutId="sidebar-active" />
      </nav>

      {/* ── Idioma + salir ── */}
      <div className="shrink-0 space-y-2 px-3 pb-4 pt-2">
        <div className="relative" ref={langRef}>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card-hover)]"
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
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                        isActive ? "bg-pastel-lavender font-semibold text-brand-700" : "text-ink-primary hover:bg-surface-muted",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span className="flex-1">{opt.label}</span>
                      {isActive && <Check size={14} className="shrink-0 text-brand-600" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            className="group flex w-full items-center gap-2.5 rounded-2xl border border-border/80 bg-white/80 px-3 py-2 transition-all hover:bg-white focus-ring"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pastel-sky text-pastel-sky-ink">
              <Globe size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[10px] font-bold uppercase leading-none tracking-widest text-ink-muted">
                {t("settings.languageTitle", "Idioma")}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                <span>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
              </span>
            </span>
            <ChevronDown size={15} className={`text-ink-muted transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-2.5 rounded-2xl px-3 text-sm font-semibold text-ink-secondary transition-colors hover:bg-status-critical-bg hover:text-status-critical-text focus-ring"
          >
            <LogOut size={17} aria-hidden="true" />
            {t("nav.logout", "Cerrar sesión")}
          </button>
        )}
      </div>
    </aside>
  );
}
