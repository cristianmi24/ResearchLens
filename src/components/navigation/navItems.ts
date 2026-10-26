import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, FileText, History, Home, Lightbulb, Search, Settings } from "lucide-react";
import type { TranslationKey } from "@/i18n/translations";

/** Tonos pastel del sistema de diseño (tokens --color-pastel-* en index.css). */
export type PastelTone = "lavender" | "butter" | "sky" | "mint" | "peach" | "aqua" | "indigo";

export interface NavItem {
  to: string;
  label: string;
  translationKey: TranslationKey;
  icon: LucideIcon;
  /** Cada sección tiene su color: ayuda a reconocerla de un vistazo (reconocimiento sobre recuerdo). */
  tone: PastelTone;
}

export const navItems: NavItem[] = [
  { to: "/inicio", label: "Inicio", translationKey: "nav.home", icon: Home, tone: "sky" },
  { to: "/idea", label: "Mi idea", translationKey: "nav.idea", icon: Lightbulb, tone: "butter" },
  { to: "/unicordoba", label: "Buscar literatura", translationKey: "nav.search", icon: Search, tone: "lavender" },
  { to: "/evaluar", label: "Evaluar documento", translationKey: "nav.evaluate", icon: ClipboardCheck, tone: "indigo" },
  { to: "/projects", label: "Mis proyectos", translationKey: "nav.projects", icon: FileText, tone: "mint" },
  { to: "/history", label: "Mi historial", translationKey: "nav.history", icon: History, tone: "peach" },
  { to: "/settings", label: "Configuración", translationKey: "nav.settings", icon: Settings, tone: "aqua" },
];

// Clases completas (no interpoladas) para que Tailwind las genere.
export const toneChip: Record<PastelTone, string> = {
  lavender: "bg-pastel-lavender text-pastel-lavender-ink",
  butter: "bg-pastel-butter text-pastel-butter-ink",
  sky: "bg-pastel-sky text-pastel-sky-ink",
  mint: "bg-pastel-mint text-pastel-mint-ink",
  peach: "bg-pastel-peach text-pastel-peach-ink",
  aqua: "bg-pastel-aqua text-pastel-aqua-ink",
  indigo: "bg-pastel-indigo text-pastel-indigo-ink",
};
