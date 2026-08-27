import type { LucideIcon } from "lucide-react";
import { Compass, FileText, FlaskConical, History, Home, Lightbulb, Search, Settings } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: "/inicio", label: "Inicio", icon: Home },
  { to: "/idea", label: "Mi idea", icon: Lightbulb },
  { to: "/articles", label: "Explorar literatura", icon: Search },
  { to: "/map", label: "Mapa de investigación", icon: Compass },
  { to: "/opportunities", label: "Oportunidades", icon: FlaskConical },
  { to: "/projects", label: "Mis proyectos", icon: FileText },
  { to: "/history", label: "Mi historial", icon: History },
  { to: "/settings", label: "Configuración", icon: Settings },
];
