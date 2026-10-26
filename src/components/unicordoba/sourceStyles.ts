import type { PanelSourceId } from "@/services/unicordobaApi";

/** Cada fuente tiene un tono pastel propio: se ve de dónde viene un resultado sin leer la etiqueta. */
interface SourceStyle {
  /** Texto de la etiqueta en las tarjetas (coincide con `doc.source`). */
  name: string;
  chip: string;
  dot: string;
  accent: string;
}

const STYLES: Record<PanelSourceId, SourceStyle> = {
  unicordoba: { name: "Unicórdoba", chip: "bg-pastel-mint text-pastel-mint-ink", dot: "bg-[#3fbf8a]", accent: "border-l-[#3fbf8a]" },
  semantic: { name: "Semantic Scholar", chip: "bg-pastel-sky text-pastel-sky-ink", dot: "bg-[#5b9bf0]", accent: "border-l-[#5b9bf0]" },
  openalex: { name: "OpenAlex", chip: "bg-pastel-peach text-pastel-peach-ink", dot: "bg-[#f29a6b]", accent: "border-l-[#f29a6b]" },
  crossref: { name: "Crossref", chip: "bg-pastel-lavender text-pastel-lavender-ink", dot: "bg-[#9483f4]", accent: "border-l-[#9483f4]" },
  ieee: { name: "IEEE Xplore", chip: "bg-pastel-aqua text-pastel-aqua-ink", dot: "bg-[#3fb7bd]", accent: "border-l-[#3fb7bd]" },
  springer: { name: "Springer Nature", chip: "bg-pastel-butter text-pastel-butter-ink", dot: "bg-[#e8b923]", accent: "border-l-[#e8b923]" },
  scopus: { name: "Scopus", chip: "bg-pastel-indigo text-pastel-indigo-ink", dot: "bg-[#6b7cf0]", accent: "border-l-[#6b7cf0]" },
};

const FALLBACK: SourceStyle = { name: "", chip: "bg-surface-muted text-ink-secondary", dot: "bg-ink-muted", accent: "border-l-border" };

export function sourceStyleById(id: PanelSourceId): SourceStyle {
  return STYLES[id];
}

/** Estilo a partir del nombre que trae cada documento (p. ej. "IEEE Xplore"). */
export function sourceStyleByName(name: string): SourceStyle {
  return Object.values(STYLES).find((s) => s.name === name) ?? FALLBACK;
}
