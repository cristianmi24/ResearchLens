import { apiFetch, ApiError } from "./api";
import type {
  ResearchDiagnosis,
  ResearchIdeaInput,
  ResearchQuestionProposal,
  RefineFormInput,
  SourceConsultation,
  UsageStatus,
  SessionHistoryEntry,
  DailyUsagePoint,
  ResearchSession,
  GeoWork,
} from "@/types/research";
import type { Article } from "@/types/article";
import type { Opportunity, DelimitationOption, Topic } from "@/types/topic";
import type { YoutubeVideo } from "@/types/youtube";

/**
 * Capa de acceso a datos de investigación. Habla con el backend real
 * (Node/Express) que a su vez consulta OpenAlex, Semantic Scholar, Crossref,
 * arXiv y Gemini. Ver server/src/routes/research.ts para la implementación.
 */

export async function analyzeIdea(input: ResearchIdeaInput): Promise<ResearchDiagnosis> {
  return apiFetch<ResearchDiagnosis>("/research/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function searchLiterature(diagnosisId: string): Promise<Article[]> {
  return apiFetch<Article[]>("/research/search", {
    method: "POST",
    body: JSON.stringify({ diagnosisId }),
  });
}

export async function getArticles(): Promise<Article[]> {
  return apiFetch<Article[]>("/research/articles");
}

export async function getArticleDetail(id: string): Promise<Article | undefined> {
  try {
    return await apiFetch<Article>(`/research/articles/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function getTopics(): Promise<Topic[]> {
  return apiFetch<Topic[]>("/research/topics");
}

export async function getTrends(): Promise<{ year: number; publications: number }[]> {
  return apiFetch<{ year: number; publications: number }[]>("/research/trends");
}

export async function getOpportunities(): Promise<{ opportunities: Opportunity[]; delimitationOptions: DelimitationOption[] }> {
  return apiFetch("/research/opportunities");
}

export async function refineQuestion(input: RefineFormInput): Promise<ResearchQuestionProposal[]> {
  return apiFetch<ResearchQuestionProposal[]>("/research/refine", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getSources(): Promise<SourceConsultation[]> {
  return apiFetch<SourceConsultation[]>("/research/sources");
}

export async function getUsage(): Promise<UsageStatus> {
  return apiFetch<UsageStatus>("/research/usage");
}

export async function getHistory(): Promise<{ analyses: SessionHistoryEntry[]; activityByDay: DailyUsagePoint[] }> {
  return apiFetch("/research/history");
}

export async function searchArticles(params: { query: string; category?: string; year?: string }): Promise<Article[]> {
  const query = new URLSearchParams({ query: params.query });
  if (params.category) query.set("category", params.category);
  if (params.year) query.set("year", params.year);
  return apiFetch<Article[]>(`/research/article-search?${query.toString()}`);
}

/** Trae una búsqueda pasada completa (diagnóstico, literatura, temas, tendencias, oportunidades), tal como se guardó, sin mezclarla con la más reciente. */
export async function getSessionById(id: string): Promise<ResearchSession> {
  return apiFetch<ResearchSession>(`/research/sessions/${id}`);
}

/** Videos relacionados vía YouTube Data API v3 (requiere que esa API esté habilitada en Google Cloud para la key configurada). */
export async function getYoutubeVideos(query: string): Promise<YoutubeVideo[]> {
  return apiFetch<YoutubeVideo[]>(`/research/youtube?q=${encodeURIComponent(query)}`);
}

/** Estudios (título + enlace) de un país o de un conjunto de instituciones para unos términos de búsqueda; alimenta la lista del mapa. */
export async function getGeoWorks(params: {
  query: string;
  country?: string;
  institutions?: string[];
  limit?: number;
}): Promise<{ total: number; works: GeoWork[] }> {
  const search = new URLSearchParams({ q: params.query });
  if (params.country) search.set("country", params.country);
  if (params.institutions?.length) search.set("institutions", params.institutions.slice(0, 50).join(","));
  if (params.limit) search.set("limit", String(params.limit));
  return apiFetch<{ total: number; works: GeoWork[] }>(`/research/geo-works?${search.toString()}`);
}
