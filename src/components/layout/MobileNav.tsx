import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Microscope, X } from "lucide-react";
import { navItems } from "@/components/navigation/navItems";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <header className="flex items-center gap-3 h-16 px-4 border-b border-border bg-white/85 backdrop-blur-sm sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-muted hover:text-ink-primary transition-colors focus-ring"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Microscope size={15} />
          </div>
          <span className="font-semibold text-ink-primary tracking-tight text-sm">ResearchLens</span>
        </div>
      </header>

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
              <div className="flex items-center gap-3 h-16 px-4 border-b border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar menú"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-muted hover:text-ink-primary transition-colors focus-ring"
                >
                  <X size={20} />
                </button>
                <span className="font-semibold text-ink-primary text-sm">Menú</span>
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
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
