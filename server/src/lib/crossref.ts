import { config } from "../config.js";
import type { Article } from "../types.js";

const BASE_URL = "https://api.crossref.org/works";

interface CrossrefWork {
  DOI: string;
  title: string[];
  author?: { given?: string; family?: string }[];
  published?: { "date-parts": number[][] };
  abstract?: string;
}

function normalize(work: CrossrefWork): Article {
  const year = work.published?.["date-parts"]?.[0]?.[0] ?? 0;
  return {
    id: `crossref-${work.DOI}`,
    title: work.title?.[0] ?? "(sin título)",
    authors: (work.author ?? []).map((a) => [a.given, a.family].filter(Boolean).join(" ")),
    year,
    source: "Crossref",
    doi: work.DOI,
    abstract: (work.abstract ?? "").replace(/<[^>]+>/g, ""),
    mainConcepts: [],
    similarityPercent: 0,
    similarityReason: "",
    comparison: [],
  };
}

export async function searchWorks(searchQuery: string, rows = 10): Promise<Article[]> {
  const params = new URLSearchParams({ query: searchQuery, rows: String(rows) });
  if (config.crossref.mailto) params.set("mailto", config.crossref.mailto);
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    console.error("[crossref] search failed", res.status, await res.text());
    return [];
  }
  const data = (await res.json()) as { message: { items: CrossrefWork[] } };
  return (data.message.items ?? []).map(normalize);
}

export async function countWorks(searchQuery: string): Promise<number> {
  const params = new URLSearchParams({ query: searchQuery, rows: "0" });
  if (config.crossref.mailto) params.set("mailto", config.crossref.mailto);
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return 0;
  const data = (await res.json()) as { message: { "total-results": number } };
  return data.message["total-results"] ?? 0;
}
