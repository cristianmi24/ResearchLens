/**
 * Lectura de la lista de referencias y de las citas en el texto, y chequeos automáticos de APA 7 que sí se
 * pueden comprobar en texto plano (no sangrías ni cursivas, que el PDF pierde).
 */

export interface ParsedReference {
  raw: string;
  doi?: string;
  year?: string;
  firstAuthor?: string;
  title?: string;
}

export interface ApaIssue {
  type: "formato-anio" | "doi" | "et-al" | "recuperado-de" | "orden" | "cita-sin-referencia" | "referencia-no-citada";
  message: string;
  examples: string[];
}

const DOI_RE = /10\.\d{4,9}\/[^\s"<>]+/i;
const YEAR_RE = /\((\d{4}[a-z]?|s\.\s?f\.|n\.\s?d\.)(,[^)]*)?\)/i;
// Inicio típico de una referencia APA: "Apellido, X." / "Apellido-Apellido, Nombre" / "[12]" / "12."
const ENTRY_START = /^(\[\d+\]|\d{1,3}\.\s|[A-ZÁÉÍÓÚÑÜ][\p{L}'’-]+(\s(de|del|la|van|von|da|dos)\s?[\p{L}'’-]+)*,\s(?:[A-ZÁÉÍÓÚ]\.|[A-ZÁÉÍÓÚ][\p{L}]+))/u;

const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function cleanDoi(doi: string): string {
  return doi.replace(/[.,;)\]]+$/, "");
}

/** Separa la sección de referencias en entradas, uniendo las líneas que el PDF partió. */
export function splitReferences(sectionText: string): string[] {
  const entries: string[] = [];
  let current = "";
  for (const rawLine of sectionText.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const prevClosed = /[.)]$|\d$|doi\.org\/\S+$|https?:\/\/\S+$/.test(current);
    if (current && ENTRY_START.test(line) && (prevClosed || /^\[\d+\]/.test(line))) {
      entries.push(current);
      current = line;
    } else {
      current = current ? `${current} ${line}` : line;
    }
  }
  if (current) entries.push(current);
  // Fragmentos demasiado cortos suelen ser encabezados de página o números sueltos.
  return entries.map((e) => e.replace(/\s+/g, " ").trim()).filter((e) => e.length > 25);
}

export function parseReference(raw: string): ParsedReference {
  const doiMatch = raw.match(DOI_RE);
  const apaYear = raw.match(YEAR_RE);
  const anyYear = raw.match(/\b(?:19|20)\d{2}\b/);
  const year = apaYear && /^\d{4}/.test(apaYear[1]) ? apaYear[1].slice(0, 4) : anyYear?.[0];
  const firstAuthor = raw.replace(/^(\[\d+\]|\d{1,3}\.)\s*/, "").split(",")[0]?.trim();
  // APA: el título va después de "(año). " y termina en el siguiente punto.
  let title: string | undefined;
  const afterYear = raw.split(/\)\.\s/)[1];
  if (afterYear) title = afterYear.split(/\.\s/)[0];
  else {
    const parts = raw.split(/\.\s/).filter((p) => p.length > 20);
    title = parts.sort((a, b) => b.length - a.length)[0];
  }
  return { raw, doi: doiMatch ? cleanDoi(doiMatch[0]) : undefined, year, firstAuthor, title: title?.trim() };
}

export interface InTextCitation {
  surname: string;
  year: string;
}

/** Citas autor-fecha en el cuerpo: (Pérez, 2020), (Pérez & Gómez, 2019; Ruiz et al., 2021) y Pérez (2020). */
export function extractCitations(body: string): InTextCitation[] {
  const found: InTextCitation[] = [];
  const surname = "[A-ZÁÉÍÓÚÑÜ][\\p{L}'’-]+";
  for (const group of body.matchAll(/\(([^()]{3,250}?\d{4}[a-z]?)\)/gu)) {
    for (const part of group[1].split(";")) {
      const m = part.match(new RegExp(`(${surname})[^;]*?,\\s*(\\d{4})`, "u"));
      if (m) found.push({ surname: m[1], year: m[2] });
    }
  }
  for (const m of body.matchAll(new RegExp(`(${surname})(?:\\s(?:y|&|and|e)\\s${surname})?(?:\\set al\\.)?\\s\\((\\d{4})[a-z]?\\)`, "gu"))) {
    found.push({ surname: m[1], year: m[2] });
  }
  // Palabras que suelen colarse como "apellido" al inicio de una cita.
  const noise = new Set(["En", "Según", "Como", "Tabla", "Figura", "Ver", "See", "In", "Table", "Figure"]);
  return found.filter((c) => !noise.has(c.surname));
}

function uniqueExamples(items: string[], max = 3): string[] {
  return [...new Set(items)].slice(0, max).map((s) => (s.length > 140 ? `${s.slice(0, 137)}…` : s));
}

/** Chequeos de APA 7 sobre la lista de referencias y el cruce con las citas del texto (solo para tesis). */
export function apaIssues(refs: ParsedReference[], citations: InTextCitation[]): ApaIssue[] {
  const issues: ApaIssue[] = [];

  const noYear = refs.filter((r) => !YEAR_RE.test(r.raw) && !/^\[\d+\]/.test(r.raw));
  if (noYear.length) {
    issues.push({
      type: "formato-anio",
      message: `${noYear.length} referencia(s) sin el año entre paréntesis después de los autores, p. ej. "Pérez, A. (2020)." (usa "(s. f.)" si no tiene fecha).`,
      examples: uniqueExamples(noYear.map((r) => r.raw)),
    });
  }

  const badDoi = refs.filter((r) => r.doi && !/https?:\/\/doi\.org\//i.test(r.raw));
  if (badDoi.length) {
    issues.push({
      type: "doi",
      message: `${badDoi.length} DOI no están escritos como enlace: en APA 7 el formato es https://doi.org/10.xxxx/xxxx (sin "doi:" ni "DOI:").`,
      examples: uniqueExamples(badDoi.map((r) => r.raw)),
    });
  }

  const etAl = refs.filter((r) => /et al\./i.test(r.raw.split(YEAR_RE)[0] ?? ""));
  if (etAl.length) {
    issues.push({
      type: "et-al",
      message: `${etAl.length} referencia(s) usan "et al." en la lista: APA 7 lista hasta 20 autores; "et al." solo va en las citas dentro del texto.`,
      examples: uniqueExamples(etAl.map((r) => r.raw)),
    });
  }

  const retrieved = refs.filter((r) => /recuperado de|retrieved from/i.test(r.raw));
  if (retrieved.length) {
    issues.push({
      type: "recuperado-de",
      message: `${retrieved.length} referencia(s) usan "Recuperado de": en APA 7 se pone directamente la URL (solo se indica fecha de consulta si el contenido cambia con el tiempo).`,
      examples: uniqueExamples(retrieved.map((r) => r.raw)),
    });
  }

  const authors = refs.map((r) => strip(r.firstAuthor ?? "")).filter(Boolean);
  const outOfOrder = authors.findIndex((a, i) => i > 0 && a.localeCompare(authors[i - 1]) < 0);
  if (authors.length > 3 && outOfOrder > 0) {
    issues.push({
      type: "orden",
      message: "La lista de referencias no está en orden alfabético por el apellido del primer autor.",
      examples: uniqueExamples([`${refs[outOfOrder - 1].firstAuthor} → ${refs[outOfOrder].firstAuthor}`]),
    });
  }

  // El cruce citas ↔ referencias solo tiene sentido si el documento usa citas autor-fecha.
  if (citations.length >= 5) {
    const refIndex = refs.map((r) => strip(r.raw));
    const missing = citations.filter((c) => !refIndex.some((r) => r.includes(strip(c.surname)) && r.includes(c.year)));
    if (missing.length) {
      issues.push({
        type: "cita-sin-referencia",
        message: `${new Set(missing.map((c) => `${c.surname} ${c.year}`)).size} cita(s) del texto no aparecen en la lista de referencias.`,
        examples: uniqueExamples(missing.map((c) => `${c.surname} (${c.year})`), 6),
      });
    }
    const citedKeys = citations.map((c) => `${strip(c.surname)}|${c.year}`);
    const uncited = refs.filter((r) => r.firstAuthor && r.year && !citedKeys.some((k) => k === `${strip(r.firstAuthor!)}|${r.year}`));
    if (uncited.length) {
      issues.push({
        type: "referencia-no-citada",
        message: `${uncited.length} referencia(s) de la lista no se citan en el texto (en APA toda referencia debe estar citada).`,
        examples: uniqueExamples(uncited.map((r) => `${r.firstAuthor} (${r.year})`), 6),
      });
    }
  }

  return issues;
}
