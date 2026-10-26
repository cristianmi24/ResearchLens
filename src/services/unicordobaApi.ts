import { apiFetch } from "./api";

/**
 * Consulta el repositorio institucional de la Universidad de Córdoba a través
 * del backend (server/src/routes/unicordoba.ts), que a su vez llama al webhook
 * de n8n conectado a DSpace.
 */

export interface UnicordobaItem {
  titulo: string;
  abstract: string;
  autor: string[];
  anio: number;
}

export interface UnicordobaSearchResult {
  desdeAnio: number;
  page: number;
  size: number;
  totalElementos: number;
  totalPaginas: number;
  resultados: UnicordobaItem[];
}

export interface UnicordobaSearchParams {
  q: string;
  page: number;
  size: number;
  years: number;
}

export async function searchUnicordoba(params: UnicordobaSearchParams): Promise<UnicordobaSearchResult> {
  const query = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    size: String(params.size),
    years: String(params.years),
  });
  return apiFetch<UnicordobaSearchResult>(`/unicordoba/search?${query.toString()}`);
}

/** Fuentes del panel: el repositorio institucional y las bases con cuota limitada (solo se usan aquí). */
export type PanelSourceId = "unicordoba" | "semantic" | "openalex" | "crossref" | "ieee" | "springer" | "scopus";

/** Opción del selector del panel: una fuente o todas. */
export type SourceChoice = PanelSourceId | "all";

/** Fuentes que realmente se consultan para cada opción del selector. */
export function sourcesFor(choice: SourceChoice | PanelSourceId[]): PanelSourceId[] {
  if (Array.isArray(choice)) return choice;
  return choice === "all"
    ? ["unicordoba", "semantic", "openalex", "crossref", "ieee", "springer", "scopus"]
    : [choice];
}

/** Documento normalizado para mostrar resultados de cualquier fuente del panel con la misma tarjeta. */
export interface PanelDocument {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  doi: string;
  source: string;
}

export interface MultiSourceResult {
  desdeAnio: number;
  sources: { id: PanelSourceId; name: string; ok: boolean; count: number }[];
  articles: PanelDocument[];
}

export async function searchMultiSource(params: {
  q: string;
  sources: PanelSourceId[];
  size: number;
  years: number;
}): Promise<MultiSourceResult> {
  const query = new URLSearchParams({
    q: params.q,
    sources: params.sources.join(","),
    size: String(params.size),
    years: String(params.years),
  });
  return apiFetch<MultiSourceResult>(`/unicordoba/multi?${query.toString()}`);
}
