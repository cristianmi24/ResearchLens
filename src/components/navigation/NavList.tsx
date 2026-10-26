import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { navItems, toneChip } from "@/components/navigation/navItems";
import { useLanguage } from "@/i18n/LanguageContext";

interface NavListProps {
  /** Identificador de la animación de la "píldora" activa; distinto para el menú lateral y el móvil. */
  layoutId: string;
  onNavigate?: () => void;
}

/** Lista de secciones con chip de color pastel; la sección activa flota en una tarjeta blanca. */
export function NavList({ layoutId, onNavigate }: NavListProps) {
  const { t } = useLanguage();
  return (
    <ul className="space-y-1">
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.to !== "/projects"}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group relative flex min-h-12 items-center gap-3 rounded-2xl px-2.5 py-1.5 text-sm transition-colors focus-ring",
                isActive ? "font-semibold text-ink-primary" : "font-medium text-ink-secondary hover:bg-white/70 hover:text-ink-primary",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-border"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${toneChip[item.tone]}`}
                >
                  <item.icon size={18} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span className="relative flex-1 truncate">{t(item.translationKey, item.label)}</span>
                {isActive && <span className="relative mr-1 h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
