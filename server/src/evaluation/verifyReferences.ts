import { config } from "../config.js";
import { searchWorks as searchOpenAlex } from "../lib/openalex.js";
import type { ParsedReference } from "./references.js";

/**
 * Comprueba cada referencia contra las fuentes abiertas de Zetia (Crossref y OpenAlex): si existe, si el DOI
 * resuelve y si título y año coinciden. No usa IEEE, Springer ni Scopus para no gastar su cuota.
 */

export type ReferenceStatus = "verificada" | "encontrada" | "no-coincide" | "doi-invalido" | "no-encontrada";

export interface ReferenceCheck {
  raw: string;
  status: ReferenceStatus;
  doi?: string;
  matchedTitle?: string;
  matchedYear?: number;
  source?: "Crossref" | "OpenAlex";
  note?: string;
}

const MAX_TO_VERIFY = 30;
const CONCURRENCY = 4;

const tokens = (s: string) =>
  new Set(
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );

/** Parecido entre títulos (0 a 1) por palabras compartidas; tolera mayúsculas, tildes y puntuación. */
export function titleSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const w of ta) if (tb.has(w)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

interface CrossrefItem {
  DOI: string;
  title?: string[];
  issued?: { "date-parts"?: number[][] };
}

async function crossrefGet(path: string): Promise<Response> {
  const sep = path.includes("?") ? "&" : "?";
  const mailto = config.crossref.mailto ? `${sep}mailto=${encodeURIComponent(config.crossref.mailto)}` : "";
  return fetch(`https://api.crossref.org${path}${mailto}`, { signal: AbortSignal.timeout(9000) });
}

const yearOf = (item: CrossrefItem) => item.issued?.["date-parts"]?.[0]?.[0];

async function checkByDoi(ref: ParsedReference): Promise<ReferenceCheck> {
  const res = await crossrefGet(`/works/${encodeURIComponent(ref.doi!)}`);
  if (res.status === 404) {
    return { raw: ref.raw, status: "doi-invalido", doi: ref.doi, note: "El DOI no existe en Crossref: revisa que esté bien copiado." };
  }
  if (!res.ok) throw new Error(`crossref ${res.status}`);
  const item = ((await res.json()) as { message: CrossrefItem }).message;
  const title = item.title?.[0] ?? "";
  const year = yearOf(item);
  const titleOk = !ref.title || titleSimilarity(ref.title, title) >= 0.5;
  const yearOk = !ref.year || !year || Math.abs(Number(ref.year) - year) <= 1;
  if (titleOk && yearOk) return { raw: ref.raw, status: "verificada", doi: item.DOI, matchedTitle: title, matchedYear: year, source: "Crossref" };
  const diffs = [!titleOk && "el título", !yearOk && `el año (registro: ${year})`].filter(Boolean).join(" y ");
  return {
    raw: ref.raw,
    status: "no-coincide",
    doi: item.DOI,
    matchedTitle: title,
    matchedYear: year,
    source: "Crossref",
    note: `El DOI existe, pero no coincide ${diffs} con lo escrito en la referencia.`,
  };
}

async function checkByText(ref: ParsedReference): Promise<ReferenceCheck> {
  const query = encodeURIComponent(ref.raw.slice(0, 300));
  const res = await crossrefGet(`/works?query.bibliographic=${query}&rows=2&select=DOI,title,issued`);
  if (res.ok) {
    const items = ((await res.json()) as { message: { items: CrossrefItem[] } }).message.items ?? [];
    for (const item of items) {
      const title = item.title?.[0] ?? "";
      const year = yearOf(item);
      const similar = ref.title ? titleSimilarity(ref.title, title) >= 0.7 : false;
      const yearOk = !ref.year || !year || Math.abs(Number(ref.year) - year) <= 1;
      if (similar && yearOk) {
        return {
          raw: ref.raw,
          status: "encontrada",
          doi: item.DOI,
          matchedTitle: title,
          matchedYear: year,
          source: "Crossref",
          note: "Existe en Crossref; puedes añadir su DOI a la referencia.",
        };
      }
    }
  }
  if (ref.title && ref.title.length > 15) {
    const { articles } = await searchOpenAlex(ref.title, 2);
    const match = articles.find((a) => titleSimilarity(ref.title!, a.title) >= 0.7);
    if (match) {
      return {
        raw: ref.raw,
        status: "encontrada",
        doi: match.doi || undefined,
        matchedTitle: match.title,
        matchedYear: match.year || undefined,
        source: "OpenAlex",
      };
    }
  }
  return {
    raw: ref.raw,
    status: "no-encontrada",
    note: "No aparece en Crossref ni OpenAlex. Puede ser un libro, una tesis o literatura gris: verifícala manualmente.",
  };
}

async function checkOne(ref: ParsedReference): Promise<ReferenceCheck> {
  try {
    return ref.doi ? await checkByDoi(ref) : await checkByText(ref);
  } catch (err) {
    console.error("[verifyReferences]", (err as Error).message);
    return { raw: ref.raw, status: "no-encontrada", note: "No se pudo consultar las fuentes en este momento." };
  }
}

/** Verifica las primeras referencias (con un tope para no saturar las APIs públicas). */
export async function verifyReferences(refs: ParsedReference[]): Promise<{ checked: ReferenceCheck[]; total: number }> {
  const toCheck = refs.slice(0, MAX_TO_VERIFY);
  const results: ReferenceCheck[] = new Array(toCheck.length);
  let next = 0;
  async function worker() {
    while (next < toCheck.length) {
      const i = next++;
      results[i] = await checkOne(toCheck[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, toCheck.length) }, worker));
  return { checked: results, total: refs.length };
}
