import { Router } from "express";
import { config } from "../config.js";
import { runFullAnalysis } from "../pipeline/orchestrator.js";
import { refineQuestion as refineQuestionPipeline } from "../pipeline/generative.js";
import {
  saveSession,
  getSession,
  getLatestSession,
  countSessionsToday,
  listSessionSummaries,
  countSessionsByDay,
} from "../db/researchSessions.js";
import { interestOverTime } from "../lib/googleTrends.js";
import { searchVideos } from "../lib/youtube.js";
import { searchPapers as searchSemanticPapers } from "../lib/semanticScholar.js";
import { searchWorks as searchOpenAlexWorks, searchWorksByGeo } from "../lib/openalex.js";
import { searchWorks as searchCrossrefWorks } from "../lib/crossref.js";
import type { RefineFormInput, ResearchIdeaInput, UsageStatus } from "../types.js";

export const researchRouter = Router();

function nextResetAt(): string {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.toISOString();
}

researchRouter.post("/analyze", async (req, res) => {
  try {
    const input = req.body as ResearchIdeaInput;
    if (!input?.rawText?.trim()) {
      return res.status(400).json({ error: "rawText es requerido" });
    }

    const used = await countSessionsToday(req.userId!);
    if (used >= config.usage.dailyAnalysisLimit) {
      return res.status(429).json({
        error: `Alcanzaste tu límite de ${config.usage.dailyAnalysisLimit} análisis por día. Vuelve a intentarlo después de ${nextResetAt()}.`,
        usage: { used, limit: config.usage.dailyAnalysisLimit, remaining: 0, resetsAt: nextResetAt() } satisfies UsageStatus,
      });
    }

    const session = await runFullAnalysis(input);
    await saveSession(session, req.userId!);
    res.json(session.diagnosis);
  } catch (err) {
    console.error("[POST /research/analyze]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

researchRouter.get("/usage", async (req, res) => {
  try {
    const used = await countSessionsToday(req.userId!);
    const limit = config.usage.dailyAnalysisLimit;
    const usage: UsageStatus = { used, limit, remaining: Math.max(0, limit - used), resetsAt: nextResetAt() };
    res.json(usage);
  } catch (err) {
    console.error("[GET /research/usage]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

/** Devuelve una búsqueda pasada completa (diagnóstico, artículos, temas, tendencias, oportunidades) tal cual quedó guardada, sin mezclarla con la más reciente. */
researchRouter.get("/sessions/:id", async (req, res) => {
  try {
    const session = await getSession(req.params.id, req.userId!);
    if (!session) return res.status(404).json({ error: "Esa búsqueda no existe o no te pertenece" });
    res.json(session);
  } catch (err) {
    console.error("[GET /research/sessions/:id]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

researchRouter.get("/history", async (req, res) => {
  try {
    const [summaries, byDay] = await Promise.all([
      listSessionSummaries(req.userId!),
      countSessionsByDay(req.userId!),
    ]);
    res.json({ analyses: summaries, activityByDay: byDay });
  } catch (err) {
    console.error("[GET /research/history]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

researchRouter.get("/article-search", async (req, res) => {
  try {
    const searchQuery = String(req.query.query ?? "").trim();
    const category = String(req.query.category ?? "").trim();
    const year = Number(req.query.year ?? 0);
    if (!searchQuery) return res.status(400).json({ error: "query es requerido" });
    const query = [searchQuery, category].filter(Boolean).join(" ");
    const [semanticResult, openAlexResult, crossrefPapers] = await Promise.all([
      searchSemanticPapers(query, 10),
      searchOpenAlexWorks(query, 10),
      searchCrossrefWorks(query, 10),
    ]);
    const allPapers = [...semanticResult.articles, ...openAlexResult.articles, ...crossrefPapers].filter(
      (paper) => !year || paper.year === year
    );
    res.json(allPapers);
  } catch (err) {
    console.error("[GET /research/article-search]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

researchRouter.post("/search", async (req, res) => {
  try {
    const { diagnosisId } = req.body as { diagnosisId?: string };
    const session = diagnosisId
      ? await getSession(diagnosisId, req.userId!)
      : await getLatestSession(req.userId!);
    if (!session) return res.status(404).json({ error: "No hay una sesión de búsqueda para ese diagnosisId" });
    res.json(session.articles);
  } catch (err) {
    console.error("[POST /research/search]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

researchRouter.get("/articles", async (req, res) => {
  const session = await getLatestSession(req.userId!);
  res.json(session?.articles ?? []);
});

researchRouter.get("/articles/:id", async (req, res) => {
  const session = await getLatestSession(req.userId!);
  const article = session?.articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: "Artículo no encontrado" });
  res.json(article);
});

researchRouter.get("/topics", async (req, res) => {
  const session = await getLatestSession(req.userId!);
  res.json(session?.topics ?? []);
});

researchRouter.get("/trends", async (req, res) => {
  const session = await getLatestSession(req.userId!);
  res.json(session?.trends ?? []);
});

researchRouter.get("/opportunities", async (req, res) => {
  const session = await getLatestSession(req.userId!);
  res.json({
    opportunities: session?.opportunities ?? [],
    delimitationOptions: session?.delimitationOptions ?? [],
  });
});

researchRouter.get("/sources", async (req, res) => {
  const session = await getLatestSession(req.userId!);
  res.json(session?.sources ?? []);
});

researchRouter.post("/refine", async (req, res) => {
  try {
    const formInput = req.body as RefineFormInput;
    const session = await getLatestSession(req.userId!);
    if (!session) return res.status(404).json({ error: "Primero analiza una idea con /research/analyze" });
    const proposals = await refineQuestionPipeline(formInput, session.diagnosis, session.topics);
    res.json(proposals);
  } catch (err) {
    console.error("[POST /research/refine]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

/**
 * Estudios (título + enlace) de un país o de un conjunto de instituciones para la
 * búsqueda de una sesión: alimenta la lista del mapa al seleccionar un país o departamento.
 * Parámetros: q (términos de búsqueda), country (ISO alfa-2) o institutions (ids "I123" separados por coma), limit (1-10).
 */
researchRouter.get("/geo-works", async (req, res) => {
  const q = String(req.query.q ?? "").trim().slice(0, 300);
  const country = String(req.query.country ?? "").trim().toUpperCase();
  const institutionIds = String(req.query.institutions ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 8));

  const validCountry = /^[A-Z]{2}$/.test(country);
  const validInstitutions = institutionIds.length > 0 && institutionIds.length <= 50 && institutionIds.every((id) => /^I\d{3,}$/.test(id));
  if (!q || (!validCountry && !validInstitutions)) {
    return res.status(400).json({ error: "Se requiere q y un country válido (ISO alfa-2) o institutions (ids de OpenAlex)" });
  }

  try {
    const result = await searchWorksByGeo(q, { country: validCountry ? country : undefined, institutionIds: validInstitutions ? institutionIds : undefined }, limit);
    res.json(result);
  } catch (err) {
    console.error("[GET /research/geo-works]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

/** Bonus: Google Trends real (paquete no oficial, Google no expone API pública). */
researchRouter.get("/google-trends", async (req, res) => {
  const q = String(req.query.q ?? "");
  if (!q) return res.status(400).json({ error: "query param 'q' es requerido" });
  const points = await interestOverTime(q);
  res.json(points);
});

/** Bonus: videos relacionados vía YouTube Data API v3. */
researchRouter.get("/youtube", async (req, res) => {
  try {
    const q = String(req.query.q ?? "");
    if (!q) return res.status(400).json({ error: "query param 'q' es requerido" });
    const videos = await searchVideos(q);
    res.json(videos);
  } catch (err) {
    console.error("[GET /research/youtube]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});
