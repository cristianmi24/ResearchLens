import { config } from "../config.js";
import type { Article } from "../types.js";

// IEEE Xplore Metadata API. Sin IEEE_API_KEY el conector queda inactivo y
// devuelve [] sin hacer la petición.
const BASE_URL = "https://ieeexploreapi.ieee.org/api/v1/search/articles";

interface IeeeArticle {
  article_number?: string;
  doi?: string;
  title?: string;
  authors?: { authors?: { full_name?: string }[] };
  publication_year?: string | number;
  abstract?: string;
  index_terms?: { author_terms?: { terms?: string[] } };
}

function normalize(item: IeeeArticle): Article {
  return {
    id: `ieee-${item.article_number ?? item.doi ?? item.title}`,
    title: item.title ?? "(sin título)",
    authors: (item.authors?.authors ?? []).map((a) => a.full_name ?? "").filter(Boolean),
    year: Number(item.publication_year) || 0,
    source: "IEEE Xplore",
    doi: item.doi ?? "",
    abstract: (item.abstract ?? "").replace(/<[^>]+>/g, ""),
    mainConcepts: item.index_terms?.author_terms?.terms ?? [],
    similarityPercent: 0,
    similarityReason: "",
    comparison: [],
  };
}

export async function searchArticles(searchQuery: string, rows = 10): Promise<Article[]> {
  if (!config.ieee.apiKey) return [];
  const params = new URLSearchParams({
    querytext: searchQuery,
    max_records: String(rows),
    format: "json",
    apikey: config.ieee.apiKey,
  });
  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.error("[ieee] search failed", res.status, await res.text());
      return [];
    }
    const data = (await res.json()) as { articles?: IeeeArticle[] };
    return (data.articles ?? []).map(normalize);
  } catch (err) {
    console.error("[ieee] search failed", err);
    return [];
  }
}
