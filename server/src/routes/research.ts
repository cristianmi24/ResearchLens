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

/** Bonus: Google Trends real (paquete no oficial, Google no expone API pública). */
researchRouter.get("/google-trends", async (req, res) => {
  const q = String(req.query.q ?? "");
  if (!q) return res.status(400).json({ error: "query param 'q' es requerido" });
  const points = await interestOverTime(q);
  res.json(points);
});

/** Bonus: videos relacionados vía YouTube Data API v3. */
researchRouter.get("/youtube", async (req, res) => {
  const q = String(req.query.q ?? "");
  if (!q) return res.status(400).json({ error: "query param 'q' es requerido" });
  const videos = await searchVideos(q);
  res.json(videos);
});
