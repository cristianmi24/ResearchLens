import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CircleHelp, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Ayuda contextual de los datos que pide el sistema: un ícono "?" junto a la
 * etiqueta que, al hacer clic, explica qué escribir y da un ejemplo. Los textos
 * viven en las traducciones bajo `help.<clave>.what` y `help.<clave>.example`.
 */
export type HelpKey =
  | "idea"
  | "level"
  | "objective"
  | "area"
  | "population"
  | "context"
  | "intervention"
  | "outcome"
  | "geography"
  | "studyType";

const POPOVER_WIDTH = 288;
const POPOVER_ESTIMATED_HEIGHT = 250;
const EDGE = 12;

interface Position {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
}

export function FieldHelp({ label, helpKey }: { label: string; helpKey: HelpKey }) {
  const { t } = useLanguage();
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const open = position !== null;

  const close = () => setPosition(null);

  function toggle() {
    if (open) return close();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - EDGE * 2);
    const left = Math.min(Math.max(EDGE, rect.left), window.innerWidth - width - EDGE);
    const fitsBelow = rect.bottom + POPOVER_ESTIMATED_HEIGHT < window.innerHeight;
    // Si abajo no cabe y arriba sí, se abre hacia arriba.
    setPosition(
      fitsBelow || rect.top < POPOVER_ESTIMATED_HEIGHT
        ? { left, width, top: rect.bottom + 8 }
        : { left, width, bottom: window.innerHeight - rect.top + 8 },
    );
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setPosition(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPosition(null);
    // La posición es fija: al desplazarse se cierra. Al redimensionar solo si cambia el ancho
    // (en celular la barra del navegador cambia el alto al desplazarse y no debe cerrarlo).
    const openedWidth = window.innerWidth;
    const onScroll = () => setPosition(null);
    const onResize = () => window.innerWidth !== openedWidth && setPosition(null);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`${t("help.aboutField", "Ayuda sobre")}: ${label}`}
        className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-600 focus-ring"
      >
        <CircleHelp size={15} />
      </button>

      {createPortal(
        <AnimatePresence>
          {position && (
            <motion.div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={label}
              initial={{ opacity: 0, y: position.top !== undefined ? -4 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ position: "fixed", left: position.left, top: position.top, bottom: position.bottom, width: position.width }}
              className="z-[70] rounded-xl border border-border bg-white p-4 text-left shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ink-primary">{label}</p>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("help.close", "Cerrar ayuda")}
                  className="-mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-primary focus-ring"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-600">{t("help.whatToWrite", "Qué escribir")}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{t(`help.${helpKey}.what`)}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("help.example", "Ejemplo")}</p>
              <p className="mt-1 rounded-lg bg-surface-muted px-3 py-2 text-sm italic leading-relaxed text-ink-primary">
                {t(`help.${helpKey}.example`)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

interface FieldLabelProps {
  htmlFor: string;
  label: string;
  helpKey: HelpKey;
  /** "primary" = campos principales (más grandes); "secondary" = campos opcionales. */
  variant?: "primary" | "secondary";
}

/** Etiqueta de un campo con su ícono de ayuda al lado. */
export function FieldLabel({ htmlFor, label, helpKey, variant = "secondary" }: FieldLabelProps) {
  const primary = variant === "primary";
  return (
    <div className={`flex items-center gap-1.5 ${primary ? "mb-2" : "mb-1.5"}`}>
      <label htmlFor={htmlFor} className={primary ? "text-sm font-medium text-ink-primary" : "text-xs font-medium text-ink-secondary"}>
        {label}
      </label>
      <FieldHelp label={label} helpKey={helpKey} />
    </div>
  );
}
