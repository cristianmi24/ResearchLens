import { config } from "../config.js";
import type { Article } from "../types.js";

// Elsevier Scopus Search API. Sin SCOPUS_API_KEY el conector queda inactivo y
// devuelve [] sin hacer la petición. La vista estándar solo trae el primer
// autor y no incluye el resumen; con SCOPUS_INST_TOKEN (acceso institucional)
// se pide la vista COMPLETE, que sí los incluye.
const BASE_URL = "https://api.elsevier.com/content/search/scopus";

interface ScopusEntry {
  eid?: string;
  "dc:title"?: string;
  "dc:creator"?: string;
  author?: { authname?: string }[];
  "prism:coverDate"?: string;
  "prism:doi"?: string;
  "dc:description"?: string;
  authkeywords?: string;
  error?: string;
}

function normalize(entry: ScopusEntry): Article {
  const authors = entry.author?.length
    ? entry.author.map((a) => a.authname ?? "").filter(Boolean)
    : entry["dc:creator"]
    ? [entry["dc:creator"]]
    : [];
  return {
    id: `scopus-${entry.eid ?? entry["prism:doi"] ?? entry["dc:title"]}`,
    title: entry["dc:title"] ?? "(sin título)",
    authors,
    year: Number.parseInt(entry["prism:coverDate"]?.slice(0, 4) ?? "", 10) || 0,
    source: "Scopus",
    doi: entry["prism:doi"] ?? "",
    abstract: entry["dc:description"] ?? "",
    mainConcepts: (entry.authkeywords ?? "").split("|").map((k) => k.trim()).filter(Boolean),
    similarityPercent: 0,
    similarityReason: "",
    comparison: [],
  };
}

export async function searchDocuments(searchQuery: string, rows = 10): Promise<Article[]> {
  if (!config.scopus.apiKey) return [];
  // Las comillas dobles delimitan la frase en la sintaxis de Scopus; se quitan del texto del usuario.
  const params = new URLSearchParams({
    query: `TITLE-ABS-KEY(${searchQuery.replace(/[()"]/g, " ")})`,
    count: String(rows),
  });
  if (config.scopus.instToken) params.set("view", "COMPLETE");
  const headers: Record<string, string> = { "X-ELS-APIKey": config.scopus.apiKey, Accept: "application/json" };
  if (config.scopus.instToken) headers["X-ELS-Insttoken"] = config.scopus.instToken;
  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, { headers, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.error("[scopus] search failed", res.status, await res.text());
      return [];
    }
    const data = (await res.json()) as { "search-results"?: { entry?: ScopusEntry[] } };
    // Sin resultados, Scopus devuelve una sola entrada con `error: "Result set was empty"`.
    return (data["search-results"]?.entry ?? []).filter((entry) => !entry.error).map(normalize);
  } catch (err) {
    console.error("[scopus] search failed", err);
    return [];
  }
}
