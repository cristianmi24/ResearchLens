import { Bot, GraduationCap, Lightbulb, Map as MapIcon, PenLine, Radar, Rocket, Search, Target, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// El inicio no se recorre con scroll: cada entrada del menú muestra una sola sección a pantalla completa.
// La sección activa vive en el hash (#como-funciona…) para que el botón Atrás y los enlaces directos funcionen.
export const SECTION_IDS = ["inicio", "que-hace", "como-funciona", "quienes-somos"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export function sectionFromHash(): SectionId {
  const id = window.location.hash.slice(1);
  return (SECTION_IDS as readonly string[]).includes(id) ? (id as SectionId) : "inicio";
}

export interface TeamMember {
  name: string;
  initials: string;
  roleKey: string;
  badgeKey: string;
  bioKey: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Cristian Miguel Peñata Andrades",
    initials: "CP",
    roleKey: "welcome.team.roleStudent",
    badgeKey: "welcome.team.badgeDev1",
    bioKey: "welcome.team.bio1",
  },
  {
    name: "Andreina Esther Sami Almanza",
    initials: "AS",
    roleKey: "welcome.team.roleStudent",
    badgeKey: "welcome.team.badgeDev2",
    bioKey: "welcome.team.bio2",
  },
  {
    name: "Alexander Toscano",
    initials: "AT",
    roleKey: "welcome.team.roleTeacher",
    badgeKey: "welcome.team.badgeTeacher",
    bioKey: "welcome.team.bio3",
  },
];

// Bases de datos conectadas: logo oficial y un color propio para distinguirlas de un vistazo.
const SOURCE_LOGOS = "https://pub-f692a19a9eeb4a918004610ccd64fcf0.r2.dev";
export const sources: { label: string; logo: string; color: string }[] = [
  { label: "Semantic Scholar", logo: `${SOURCE_LOGOS}/605274dd4af9b0ca8ac84182_s2-logo.svg`, color: "#5b8cff" },
  { label: "OpenAlex", logo: `${SOURCE_LOGOS}/openalex.png`, color: "#ff9f43" },
  { label: "Crossref", logo: `${SOURCE_LOGOS}/crossref.png`, color: "#2ed3b7" },
  { label: "arXiv", logo: `${SOURCE_LOGOS}/images.png`, color: "#ff6b81" },
  { label: "Springer Nature", logo: `${SOURCE_LOGOS}/images%20(1).png`, color: "#ffd23f" },
  { label: "IEEE Xplore", logo: `${SOURCE_LOGOS}/iee.png`, color: "#4cc9f0" },
  { label: "Scopus", logo: `${SOURCE_LOGOS}/scorpus.png`, color: "#f77fbe" },
  { label: "Unicórdoba", logo: "/logos/unicordoba.webp", color: "#7bd88f" },
];

export const features: { icon: LucideIcon; key: string }[] = [
  { icon: Lightbulb, key: "f1" },
  { icon: Search, key: "f2" },
  { icon: MapIcon, key: "f3" },
  { icon: Target, key: "f4" },
  { icon: Bot, key: "f5" },
  { icon: GraduationCap, key: "f6" },
];

export const steps: { icon: LucideIcon; key: string }[] = [
  { icon: PenLine, key: "s1" },
  { icon: Radar, key: "s2" },
  { icon: TrendingUp, key: "s3" },
  { icon: Rocket, key: "s4" },
];

// Acentos de color (tomados del logo) para diferenciar tarjetas y pasos.
export const accents = ["#5b8cff", "#a77bff", "#ff8fc7", "#ffb057", "#2ed3b7", "#4cc9f0"];

// Logos institucionales que acompañan al de Zetia en el menú (public/logos, recortados en WebP).
export const partners = [
  { src: "/logos/unicordoba.webp", name: "Universidad de Córdoba" },
  { src: "/logos/edutlan.webp", name: "Grupo de investigación EDUTLAN" },
  { src: "/logos/labsie.webp", name: "LABSIE" },
];
