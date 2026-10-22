import { config } from "../config.js";

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
  q?: string;
  page?: number;
  size?: number;
  years?: number;
}

interface WebhookResponse {
  ok: boolean;
  desde_anio: number;
  page: number;
  size: number;
  total_elementos: number;
  total_paginas: number;
  resultados?: { titulo?: string; abstract?: string; autor?: string[] | string; anio?: number }[];
}

export class UnicordobaError extends Error {}

export async function searchRepository(params: UnicordobaSearchParams): Promise<UnicordobaSearchResult> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.years !== undefined) query.set("years", String(params.years));

  const res = await fetch(`${config.unicordoba.searchUrl}?${query.toString()}`, {
    headers: config.unicordoba.apiKey ? { "x-api-key": config.unicordoba.apiKey } : undefined,
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json().catch(() => null)) as WebhookResponse | null;
  if (!res.ok || !data?.ok) {
    console.error("[unicordoba] search failed", res.status, data);
    throw new UnicordobaError("El repositorio de la Universidad de Córdoba no respondió. Intenta de nuevo.");
  }

  return {
    desdeAnio: data.desde_anio,
    page: data.page,
    size: data.size,
    totalElementos: data.total_elementos,
    totalPaginas: data.total_paginas,
    resultados: (data.resultados ?? []).map((item) => ({
      titulo: item.titulo ?? "(sin título)",
      abstract: item.abstract ?? "",
      autor: Array.isArray(item.autor) ? item.autor : item.autor ? [item.autor] : [],
      anio: item.anio ?? 0,
    })),
  };
}
