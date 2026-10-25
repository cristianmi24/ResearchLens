import { config } from "../config.js";
import type { Article } from "../types.js";

// Springer Nature Metadata API. Sin SPRINGER_API_KEY el conector queda inactivo
// y devuelve [] sin hacer la petición.
const BASE_URL = "https://api.springernature.com/meta/v2/json";

interface SpringerRecord {
  identifier?: string;
  doi?: string;
  title?: string;
  creators?: { creator?: string }[];
  publicationDate?: string;
  // La API devuelve el resumen como texto o, en algunos registros, como objeto { p: [...] }.
  abstract?: string | { p?: string | string[] };
}

function abstractText(abstract: SpringerRecord["abstract"]): string {
  if (!abstract) return "";
  if (typeof abstract === "string") return abstract;
  const p = abstract.p;
  return Array.isArray(p) ? p.join(" ") : p ?? "";
}

function normalize(record: SpringerRecord): Article {
  const doi = record.doi ?? "";
  return {
    id: `springer-${doi || record.identifier || record.title}`,
    title: record.title ?? "(sin título)",
    // Springer entrega los autores como "Apellido, Nombre".
    authors: (record.creators ?? [])
      .map((c) => (c.creator ?? "").split(",").map((part) => part.trim()).reverse().join(" "))
      .filter(Boolean),
    year: Number.parseInt(record.publicationDate?.slice(0, 4) ?? "", 10) || 0,
    source: "Springer Nature",
    doi,
    abstract: abstractText(record.abstract).replace(/<[^>]+>/g, ""),
    mainConcepts: [],
    similarityPercent: 0,
    similarityReason: "",
    comparison: [],
  };
}

export async function searchRecords(searchQuery: string, rows = 10): Promise<Article[]> {
  if (!config.springer.apiKey) return [];
  const params = new URLSearchParams({ q: searchQuery, p: String(rows), api_key: config.springer.apiKey });
  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.error("[springer] search failed", res.status, await res.text());
      return [];
    }
    const data = (await res.json()) as { records?: SpringerRecord[] };
    return (data.records ?? []).map(normalize);
  } catch (err) {
    console.error("[springer] search failed", err);
    return [];
  }
}
