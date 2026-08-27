import { config } from "../config.js";
import type { Article } from "../types.js";

const BASE_URL = "https://api.openalex.org/works";

function commonParams(): URLSearchParams {
  const params = new URLSearchParams();
  if (config.openAlex.mailto) params.set("mailto", config.openAlex.mailto);
  if (config.openAlex.apiKey) params.set("api_key", config.openAlex.apiKey);
  return params;
}

/** OpenAlex no devuelve el abstract en texto plano, sino un índice invertido. */
function reconstructAbstract(invertedIndex: Record<string, number[]> | null | undefined): string {
  if (!invertedIndex) return "";
  const positioned: string[] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) positioned[pos] = word;
  }
  return positioned.filter(Boolean).join(" ");
}

interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string | null;
  display_name: string | null;
  publication_year: number | null;
  authorships: { author: { display_name: string } }[];
  abstract_inverted_index: Record<string, number[]> | null;
  topics: { id: string; display_name: string; score: number }[];
}

function normalize(work: OpenAlexWork): Article {
  return {
    id: `openalex-${work.id.split("/").pop()}`,
    title: work.display_name ?? work.title ?? "(sin título)",
    authors: work.authorships.map((a) => a.author?.display_name).filter(Boolean),
    year: work.publication_year ?? 0,
    source: "OpenAlex",
    doi: work.doi ? work.doi.replace("https://doi.org/", "") : "",
    abstract: reconstructAbstract(work.abstract_inverted_index),
    // `work.topics` (clasificación nueva de OpenAlex) es mucho más específico
    // que el antiguo `concepts` (que solía devolver áreas enormes como
    // "Computer science" o "Psychology" para casi cualquier paper).
    mainConcepts: [...work.topics]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((t) => t.display_name),
    similarityPercent: 0,
    similarityReason: "",
    comparison: [],
  };
}

export interface OpenAlexSearchResult {
  articles: Article[];
  /** nombre de tema (display_name) → id corto de OpenAlex (ej. "T12026"), para poder filtrar por ID en vez de texto libre. */
  topicIds: Map<string, string>;
}

export async function searchWorks(searchQuery: string, perPage = 15): Promise<OpenAlexSearchResult> {
  const params = commonParams();
  params.set("search", searchQuery);
  params.set("per_page", String(perPage));
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    console.error("[openalex] search failed", res.status, await res.text());
    return { articles: [], topicIds: new Map() };
  }
  const data = (await res.json()) as { results: OpenAlexWork[] };

  const topicIds = new Map<string, string>();
  for (const work of data.results) {
    for (const topic of work.topics) {
      topicIds.set(topic.display_name, topic.id.split("/").pop() ?? topic.id);
    }
  }

  return { articles: data.results.map(normalize), topicIds };
}

export async function countWorks(searchQuery: string): Promise<number> {
  const params = commonParams();
  params.set("search", searchQuery);
  params.set("per_page", "1");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return 0;
  const data = (await res.json()) as { meta: { count: number } };
  return data.meta.count;
}

export async function countWorksByTopic(topicId: string): Promise<number> {
  const params = commonParams();
  params.set("filter", `topics.id:${topicId}`);
  params.set("per_page", "1");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return 0;
  const data = (await res.json()) as { meta: { count: number } };
  return data.meta.count;
}

function parseYearBuckets(groupBy: { key: string; count: number }[]): { year: number; count: number }[] {
  // OpenAlex a veces incluye años erróneos (ej. fechas de "publicación
  // anticipada" mal parseadas); se descartan años fuera de un rango sensato.
  const currentYear = new Date().getFullYear();
  return groupBy
    .map((g) => ({ year: Number(g.key), count: g.count }))
    .filter((g) => Number.isFinite(g.year) && g.year > 1990 && g.year <= currentYear)
    .sort((a, b) => a.year - b.year);
}

export async function worksByYear(searchQuery: string): Promise<{ year: number; count: number }[]> {
  const params = commonParams();
  params.set("search", searchQuery);
  params.set("group_by", "publication_year");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { group_by: { key: string; count: number }[] };
  return parseYearBuckets(data.group_by);
}

export async function worksByYearForTopic(topicId: string): Promise<{ year: number; count: number }[]> {
  const params = commonParams();
  params.set("filter", `topics.id:${topicId}`);
  params.set("group_by", "publication_year");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { group_by: { key: string; count: number }[] };
  return parseYearBuckets(data.group_by);
}
