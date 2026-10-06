import type { LucideIcon } from "lucide-react";
import { FileText, History, Home, Lightbulb, Search, Settings } from "lucide-react";
import type { TranslationKey } from "@/i18n/translations";

export interface NavItem {
  to: string;
  label: string;
  translationKey: TranslationKey;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: "/inicio", label: "Inicio", translationKey: "nav.home", icon: Home },
  { to: "/idea", label: "Mi idea", translationKey: "nav.idea", icon: Lightbulb },
  { to: "/article-search", label: "Buscar literatura", translationKey: "nav.search", icon: Search },
  { to: "/projects", label: "Mis proyectos", translationKey: "nav.projects", icon: FileText },
  { to: "/history", label: "Mi historial", translationKey: "nav.history", icon: History },
  { to: "/settings", label: "Configuración", translationKey: "nav.settings", icon: Settings },
];
