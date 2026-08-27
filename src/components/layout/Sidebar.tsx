import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Microscope } from "lucide-react";
import { navItems } from "@/components/navigation/navItems";
import { useAuth } from "@/hooks/useAuth";

function initials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-gradient-to-b from-white to-brand-50/40">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_2px_8px_-2px_rgba(42,120,214,0.5)]">
          <Microscope size={18} />
        </div>
        <span className="font-semibold text-ink-primary tracking-tight">ResearchLens</span>
      </div>

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
                    layoutId="sidebar-active-pill"
                    className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-brand-600"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <item.icon size={18} strokeWidth={2} className={isActive ? "text-brand-600" : undefined} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-xs font-semibold">
                {initials(user.firstName, user.lastName, user.email)}
              </div>
              <span className="text-xs text-ink-secondary truncate" title={user.email}>
                {user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="shrink-0 p-1.5 rounded-lg text-ink-secondary hover:bg-[var(--color-status-critical-bg)] hover:text-[var(--color-status-critical-text)] focus-ring transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
        <p className="text-xs text-ink-muted leading-relaxed">
          Asesor de exploración investigativa. Los resultados son estimaciones basadas en fuentes científicas.
        </p>
      </div>
    </aside>
  );
}
