import { config } from "../config.js";
import type { Article } from "../types.js";

const BASE_URL = "https://api.semanticscholar.org/graph/v1/paper/search";
const FIELDS = "title,abstract,authors,year,externalIds,tldr";
const MIN_INTERVAL_MS = 1000;

interface S2Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  authors: { name: string }[];
  externalIds: { DOI?: string } | null;
  tldr: { text: string } | null;
}

function normalize(paper: S2Paper): Article {
  return {
    id: `s2-${paper.paperId}`,
    title: paper.title ?? "(sin título)",
    authors: paper.authors?.map((a) => a.name) ?? [],
    year: paper.year ?? 0,
    source: "Semantic Scholar",
    doi: paper.externalIds?.DOI ?? "",
    abstract: paper.abstract ?? paper.tldr?.text ?? "",
    mainConcepts: [],
    similarityPercent: 0,
    similarityReason: "",
    comparison: [],
  };
}

/**
 * Semantic Scholar permite 1 solicitud por segundo, acumulativa entre TODOS
 * los endpoints (no por API key ni por proceso). Se serializan aquí todas
 * las llamadas salientes a través de una cola en memoria para nunca disparar
 * dos requests con menos de 1s de diferencia desde este backend, aunque
 * varios análisis corran en paralelo. No se "fuerza" pidiendo más rápido de
 * lo que la propia Semantic Scholar permite: se espera lo que haga falta y
 * se informa cuánto se esperó, en vez de solo fallar en silencio.
 */
let queue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function throttle(): Promise<number> {
  const turn = queue.then(async () => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return wait;
  });
  queue = turn.then(() => undefined).catch(() => {});
  return turn;
}

export interface SemanticScholarResult {
  articles: Article[];
  /** Milisegundos totales que se esperó por el límite de 1 req/seg (throttle propio + backoff por 429). */
  waitedMs: number;
  /** true si se agotaron los reintentos y no se pudo consultar. */
  gaveUp: boolean;
}

export async function searchPapers(searchQuery: string, limit = 15, attempts = 3): Promise<SemanticScholarResult> {
  const params = new URLSearchParams({ query: searchQuery, fields: FIELDS, limit: String(limit) });
  let waitedMs = 0;

  for (let i = 0; i < attempts; i++) {
    waitedMs += await throttle();

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: config.semanticScholar.apiKey ? { "x-api-key": config.semanticScholar.apiKey } : {},
    });

    if (res.ok) {
      const data = (await res.json()) as { data: S2Paper[] };
      return { articles: (data.data ?? []).map(normalize), waitedMs, gaveUp: false };
    }

    if (res.status === 429 && i < attempts - 1) {
      const backoff = 1500 * 2 ** i;
      waitedMs += backoff;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      continue;
    }

    console.error("[semanticScholar] search failed", res.status, await res.text());
    return { articles: [], waitedMs, gaveUp: true };
  }

  return { articles: [], waitedMs, gaveUp: true };
}

