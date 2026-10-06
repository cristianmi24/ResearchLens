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
  authorships: { author: { display_name: string }; countries?: string[] }[];
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
    // Países (ISO alfa-2) de las instituciones de los autores; alimenta el mapa
    // geográfico. Solo OpenAlex lo entrega: las demás fuentes no traen país.
    countries: [...new Set(work.authorships.flatMap((a) => a.countries ?? []))],
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

/* ------------------------------------------------------------------ */
/* Geografía de la investigación (alimenta el mapa)                    */
/* ------------------------------------------------------------------ */

const INSTITUTIONS_URL = "https://api.openalex.org/institutions";
const GEO_BATCH = 50;

/** "https://openalex.org/countries/US" → "US"; descarta claves que no son un ISO alfa-2. */
function countryCodeFromKey(key: string): string | null {
  const code = key.split("/").pop() ?? "";
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/**
 * Conteo EXACTO de estudios por país sobre todos los resultados de la búsqueda
 * (no solo la muestra recuperada): un estudio cuenta en un país si al menos una
 * institución de sus autores está en él.
 */
export async function worksByCountry(
  searchQuery: string,
): Promise<{ total: number; countries: { code: string; count: number }[] }> {
  const params = commonParams();
  params.set("search", searchQuery);
  params.set("group_by", "authorships.countries");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return { total: 0, countries: [] };
  const data = (await res.json()) as { meta: { count: number }; group_by: { key: string; count: number }[] };
  const countries = data.group_by
    .map((g) => ({ code: countryCodeFromKey(g.key), count: g.count }))
    .filter((g): g is { code: string; count: number } => g.code !== null)
    .sort((a, b) => b.count - a.count);
  return { total: data.meta.count, countries };
}

export interface CountryInstitutionWorks {
  /** Estudios de la búsqueda con al menos una institución del país. */
  total: number;
  /** Por cada trabajo analizado, los ids (cortos) de sus instituciones del país, sin repetir. */
  works: string[][];
  /** id corto → nombre de cada institución del país que aparece en la muestra. */
  institutions: Map<string, string>;
}

/**
 * Los `perPage` estudios más relevantes de la búsqueda con alguna institución de
 * `countryCode`, y qué instituciones de ese país participan en cada uno.
 */
export async function institutionWorksForCountry(
  searchQuery: string,
  countryCode: string,
  perPage = 200,
): Promise<CountryInstitutionWorks> {
  const params = commonParams();
  params.set("search", searchQuery);
  params.set("filter", `authorships.institutions.country_code:${countryCode}`);
  params.set("per_page", String(perPage));
  params.set("select", "id,authorships");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) return { total: 0, works: [], institutions: new Map() };
  const data = (await res.json()) as {
    meta: { count: number };
    results: {
      authorships: { institutions?: { id: string; display_name: string; country_code: string | null }[] }[];
    }[];
  };

  const institutions = new Map<string, string>();
  const works = data.results.map((work) => {
    const ids = new Set<string>();
    for (const authorship of work.authorships ?? []) {
      for (const inst of authorship.institutions ?? []) {
        if (inst.country_code !== countryCode) continue;
        const shortId = inst.id.split("/").pop() ?? inst.id;
        ids.add(shortId);
        institutions.set(shortId, inst.display_name);
      }
    }
    return [...ids];
  });

  return { total: data.meta.count, works, institutions };
}

export interface GeoWork {
  id: string;
  title: string;
  year: number | null;
  /** DOI si existe; si no, la página de la fuente; si tampoco, la ficha de OpenAlex. */
  url: string;
}

/**
 * Los estudios más relevantes de la búsqueda cuyos autores tienen institución en
 * un país (`country`, ISO alfa-2) o en alguna de las instituciones dadas (ids
 * cortos de OpenAlex). Alimenta la lista de títulos con enlace del mapa.
 */
export async function searchWorksByGeo(
  searchQuery: string,
  geo: { country?: string; institutionIds?: string[] },
  limit = 8,
): Promise<{ total: number; works: GeoWork[] }> {
  const filters: string[] = [];
  if (geo.country) filters.push(`authorships.countries:${geo.country}`);
  if (geo.institutionIds?.length) filters.push(`authorships.institutions.id:${geo.institutionIds.join("|")}`);
  if (filters.length === 0) return { total: 0, works: [] };

  const params = commonParams();
  params.set("search", searchQuery);
  params.set("filter", filters.join(","));
  params.set("per_page", String(limit));
  params.set("select", "id,display_name,publication_year,doi,primary_location");
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`OpenAlex respondió ${res.status}`);
  const data = (await res.json()) as {
    meta: { count: number };
    results: {
      id: string;
      display_name: string | null;
      publication_year: number | null;
      doi: string | null;
      primary_location?: { landing_page_url?: string | null } | null;
    }[];
  };

  return {
    total: data.meta.count,
    works: data.results
      .filter((w) => w.display_name)
      .map((w) => ({
        id: w.id.split("/").pop() ?? w.id,
        title: w.display_name as string,
        year: w.publication_year,
        url: w.doi ?? w.primary_location?.landing_page_url ?? w.id,
      })),
  };
}

export interface InstitutionGeo {
  city: string | null;
  region: string | null;
  lat: number;
  lon: number;
}

/** Coordenadas y ciudad de instituciones (por lotes de 50 ids cortos, ej. "I324290372"). */
export async function institutionGeo(shortIds: string[]): Promise<Map<string, InstitutionGeo>> {
  const out = new Map<string, InstitutionGeo>();
  for (let i = 0; i < shortIds.length; i += GEO_BATCH) {
    const batch = shortIds.slice(i, i + GEO_BATCH);
    const params = commonParams();
    params.set("filter", `openalex:${batch.join("|")}`);
    params.set("select", "id,geo");
    params.set("per_page", String(GEO_BATCH));
    const res = await fetch(`${INSTITUTIONS_URL}?${params.toString()}`);
    if (!res.ok) continue;
    const data = (await res.json()) as {
      results: {
        id: string;
        geo?: { city: string | null; region: string | null; latitude: number | null; longitude: number | null };
      }[];
    };
    for (const inst of data.results) {
      const geo = inst.geo;
      if (!geo || geo.latitude == null || geo.longitude == null) continue;
      out.set(inst.id.split("/").pop() ?? inst.id, {
        city: geo.city,
        region: geo.region,
        lat: geo.latitude,
        lon: geo.longitude,
      });
    }
  }
  return out;
}
