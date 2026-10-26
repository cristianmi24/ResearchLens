import type { DocumentType } from "../skills/documentEvaluation.js";

/**
 * Detección de secciones en el texto extraído de un PDF/DOCX. Es heurística (los PDF pierden el formato),
 * por eso cada sección se busca con varios nombres en español, inglés y portugués y, cuando un título aparece
 * varias veces (tabla de contenido + capítulo real), se elige la aparición con más contenido debajo.
 */

export interface SectionDef {
  id: string;
  name: string;
  pattern: RegExp;
}

const COMMON: SectionDef[] = [
  { id: "resumen", name: "Resumen", pattern: /^(resumen|resumo)\b/ },
  { id: "abstract", name: "Abstract", pattern: /^abstract\b/ },
  { id: "palabras-clave", name: "Palabras clave", pattern: /^(palabras clave|palabras claves|keywords|key words|palavras-chave)\b/ },
  { id: "introduccion", name: "Introducción", pattern: /introducci[oó]n|^introduction\b|introdu[cç][aã]o/ },
  {
    id: "problema",
    name: "Planteamiento del problema",
    pattern: /planteamiento del problema|problema de investigaci[oó]n|descripci[oó]n del problema|formulaci[oó]n del problema|pregunta de investigaci[oó]n|problem statement/,
  },
  { id: "justificacion", name: "Justificación", pattern: /^(\d+(\.\d+)*\.?\s*)?justificaci[oó]n|^rationale\b|^justification\b/ },
  { id: "objetivos", name: "Objetivos", pattern: /^(\d+(\.\d+)*\.?\s*)?(objetivos?|objectives?)\b/ },
  {
    id: "marco",
    name: "Marco teórico / estado del arte",
    pattern: /marco te[oó]rico|marco referencial|marco conceptual|estado del arte|antecedentes|revisi[oó]n de (la )?literatura|theoretical framework|literature review|referencial te[oó]rico/,
  },
  {
    id: "metodologia",
    name: "Metodología",
    pattern: /metodolog[ií]a|dise[ñn]o metodol[oó]gico|materiales y m[eé]todos|^(\d+(\.\d+)*\.?\s*)?m[eé]todos?\b|methodology|^methods?\b|materials and methods/,
  },
  { id: "resultados", name: "Resultados", pattern: /^(\d+(\.\d+)*\.?\s*)?(resultados|results|hallazgos|findings)\b|an[aá]lisis de (los )?resultados/ },
  { id: "discusion", name: "Discusión", pattern: /^(\d+(\.\d+)*\.?\s*)?(discusi[oó]n|discussion|discuss[aã]o)\b/ },
  { id: "conclusiones", name: "Conclusiones", pattern: /^(\d+(\.\d+)*\.?\s*)?(conclusi[oó]n(es)?|conclusions?|conclus[oõ]es|consideraciones finales)\b/ },
  { id: "referencias", name: "Referencias", pattern: /^(\d+(\.\d+)*\.?\s*)?(referencias( bibliogr[aá]ficas)?|bibliograf[ií]a|references|refer[eê]ncias|works cited)\b/ },
];

/** Secciones que se esperan según el tipo de documento (las demás se informan si aparecen). */
export const EXPECTED: Record<DocumentType, string[]> = {
  tesis: ["resumen", "abstract", "introduccion", "problema", "justificacion", "objetivos", "marco", "metodologia", "resultados", "discusion", "conclusiones", "referencias"],
  articulo: ["resumen", "palabras-clave", "introduccion", "metodologia", "resultados", "discusion", "conclusiones", "referencias"],
};

export interface DetectedSection {
  id: string;
  name: string;
  start: number;
  end: number;
  words: number;
  text: string;
}

function normalizeHeading(line: string): string {
  return line
    .toLowerCase()
    .replace(/^(cap[ií]tulo|chapter)\s+[ivxlc\d]+[.:\-\s]*/i, "")
    .replace(/^[ivxlc]+[.)]\s+/i, "")
    .trim();
}

// Línea de tabla de contenido: termina en puntos suspensivos o en un número de página.
const TOC_LINE = /(\.{3,}|…)\s*\d+\s*$|\s\d{1,3}\s*$/;

const wordCount = (text: string) => (text.match(/\S+/g) ?? []).length;

export function detectSections(text: string): DetectedSection[] {
  // Posición de inicio de cada línea, para cortar el texto por títulos.
  const lines: { text: string; start: number }[] = [];
  let offset = 0;
  for (const raw of text.split("\n")) {
    lines.push({ text: raw.trim(), start: offset });
    offset += raw.length + 1;
  }

  const candidates: { def: SectionDef; start: number; contentStart: number }[] = [];
  for (const line of lines) {
    if (!line.text || line.text.length > 90 || TOC_LINE.test(line.text)) continue;
    const heading = normalizeHeading(line.text);
    // "Palabras clave: a, b" y "Resumen: texto" pueden venir en la misma línea que el contenido.
    const def = COMMON.find((d) => d.pattern.test(heading));
    if (!def) continue;
    const colon = line.text.indexOf(":");
    const inlineContent = colon > 0 && line.text.slice(colon + 1).trim().length > 3;
    candidates.push({ def, start: line.start, contentStart: line.start + (inlineContent ? colon + 1 : line.text.length) });
  }
  candidates.sort((a, b) => a.start - b.start);

  // Para cada sección, la aparición con más texto hasta el siguiente título candidato.
  const best = new Map<string, DetectedSection>();
  candidates.forEach((c, i) => {
    const end = i + 1 < candidates.length ? candidates[i + 1].start : text.length;
    const body = text.slice(c.contentStart, end).trim();
    const words = wordCount(body);
    const current = best.get(c.def.id);
    // Las referencias suelen estar al final: ahí gana la última aparición con contenido.
    const better = c.def.id === "referencias" ? words > 20 || !current : !current || words > current.words;
    if (better) best.set(c.def.id, { id: c.def.id, name: c.def.name, start: c.start, end, words, text: body });
  });

  return [...best.values()].sort((a, b) => a.start - b.start);
}

/** Primer y último tramo de una sección, para que el modelo vea cómo empieza y cómo cierra sin leerla entera. */
export function excerpt(section: DetectedSection, budget: number): string {
  const t = section.text.replace(/\s+/g, " ");
  if (t.length <= budget) return t;
  const head = Math.round(budget * 0.75);
  return `${t.slice(0, head)} […] ${t.slice(-(budget - head))}`;
}

export function countWords(text: string): number {
  return wordCount(text);
}
