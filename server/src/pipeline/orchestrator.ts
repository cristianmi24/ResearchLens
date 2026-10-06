import { extractIdeaProfile, searchLiterature } from "./search.js";
import { scoreSimilarity, annotateTopArticles } from "./similarity.js";
import { buildDiagnosis } from "./diagnosis.js";
import { deriveTopics } from "./topics.js";
import { buildOpportunities } from "./generative.js";
import { analyzePublicInterest } from "./publicInterest.js";
import { buildGeoDistribution } from "./geoResearch.js";
import type { ResearchIdeaInput, ResearchSession } from "../types.js";

const MAX_ARTICLES_KEPT = 24;

function newSessionId(): string {
  return `diag-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Orquesta el pipeline completo: Qwen (extracción de conceptos) → búsqueda
 * multi-fuente (OpenAlex/Semantic Scholar/Crossref/arXiv) → similitud por
 * embeddings → diagnóstico grounded en cifras reales → temas → oportunidades.
 */
export async function runFullAnalysis(input: ResearchIdeaInput): Promise<ResearchSession> {
  const id = newSessionId();

  const profile = await extractIdeaProfile(input);
  const { articles: rawArticles, sources, topicIds } = await searchLiterature(profile.keywords);
  const scored = await scoreSimilarity(input.rawText, rawArticles);
  const annotated = await annotateTopArticles(input, scored);

  const articles = [...annotated]
    .sort((a, b) => b.similarityPercent - a.similarityPercent)
    .slice(0, MAX_ARTICLES_KEPT);

  const { diagnosis, trendByYear } = await buildDiagnosis({
    id,
    input,
    keywords: profile.keywords,
    relatedConcepts: profile.relatedConcepts,
    refinedQuestionPreview: profile.refinedQuestionPreview,
    articles,
  });

  // El interés público (Google Trends) no depende de los temas, así que se
  // calcula en paralelo con `deriveTopics` en vez de encadenarse detrás.
  // La distribución geográfica (dónde se investiga) también es independiente.
  const [topics, publicInterest, geoDistribution] = await Promise.all([
    deriveTopics(articles, topicIds),
    analyzePublicInterest(profile.keywords[0] ?? input.rawText, trendByYear).catch((err) => {
      console.error("[orchestrator] no se pudo analizar interés público (Google Trends):", (err as Error).message);
      return null;
    }),
    buildGeoDistribution(profile.keywords).catch((err) => {
      console.error("[orchestrator] no se pudo obtener la distribución geográfica (OpenAlex):", (err as Error).message);
      return null;
    }),
  ]);
  diagnosis.publicInterest = publicInterest;
  diagnosis.geoDistribution = geoDistribution;

  const { opportunities, delimitationOptions } = await buildOpportunities(input, diagnosis, topics, articles);

  const trends = trendByYear.slice(-6).map((y) => ({ year: y.year, publications: y.count }));

  return {
    id,
    originalIdea: input.rawText,
    keywords: profile.keywords,
    area: profile.area,
    diagnosis,
    articles,
    sources,
    topics,
    trends,
    opportunities,
    delimitationOptions,
    createdAt: new Date().toISOString(),
  };
}
