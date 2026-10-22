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
