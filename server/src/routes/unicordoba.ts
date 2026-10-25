import { Router } from "express";
import { searchRepository, UnicordobaError } from "../lib/unicordoba.js";
import { searchArticles as searchIeeeArticles } from "../lib/ieee.js";
import { searchRecords as searchSpringerRecords } from "../lib/springer.js";
import { searchDocuments as searchScopusDocuments } from "../lib/scopus.js";
import type { Article } from "../types.js";

export const unicordobaRouter = Router();

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

unicordobaRouter.get("/search", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 200) : "";
    const result = await searchRepository({
      q,
      page: clampInt(req.query.page, 0, 0, 10_000),
      size: clampInt(req.query.size, 20, 1, 100),
      years: clampInt(req.query.years, 5, 1, 50),
    });
    res.json(result);
  } catch (err) {
    if (err instanceof UnicordobaError) return res.status(502).json({ error: err.message });
    console.error("[unicordoba]", err);
    res.status(502).json({ error: "No fue posible consultar el repositorio de la Universidad de Córdoba." });
  }
});

// IEEE Xplore, Springer Nature y Scopus tienen cuota diaria limitada: solo se consultan desde este
// panel, cuando el usuario las elige a propósito, y nunca en el análisis automático de ideas.
const SOURCES = {
  unicordoba: "Unicórdoba",
  ieee: "IEEE Xplore",
  springer: "Springer Nature",
  scopus: "Scopus",
} as const;
type SourceId = keyof typeof SOURCES;

interface PanelArticle {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  doi: string;
  source: string;
}

function fromArticle(article: Article): PanelArticle {
  const { id, title, authors, year, abstract, doi, source } = article;
  return { id, title, authors, year, abstract, doi, source };
}

unicordobaRouter.get("/multi", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 200) : "";
  if (q.length < 2) return res.status(400).json({ error: "Escribe un tema para buscar en las bases académicas." });

  const requested = typeof req.query.sources === "string" ? req.query.sources.split(",") : [];
  const sources = (Object.keys(SOURCES) as SourceId[]).filter((id) => requested.includes(id));
  if (!sources.length) return res.status(400).json({ error: "Elige al menos una fuente." });

  const size = clampInt(req.query.size, 10, 1, 25);
  const years = clampInt(req.query.years, 5, 1, 50);
  const desdeAnio = new Date().getFullYear() - years;

  const run: Record<SourceId, () => Promise<PanelArticle[]>> = {
    unicordoba: async () => {
      const result = await searchRepository({ q, page: 0, size, years });
      return result.resultados.map((item, i) => ({
        id: `unicordoba-${i}-${item.titulo}`,
        title: item.titulo,
        authors: item.autor,
        year: item.anio,
        abstract: item.abstract,
        doi: "",
        source: SOURCES.unicordoba,
      }));
    },
    ieee: async () => (await searchIeeeArticles(q, size)).map(fromArticle),
    springer: async () => (await searchSpringerRecords(q, size)).map(fromArticle),
    scopus: async () => (await searchScopusDocuments(q, size)).map(fromArticle),
  };

  const settled = await Promise.allSettled(sources.map((id) => run[id]()));
  const summary = sources.map((id, i) => {
    const outcome = settled[i];
    if (outcome.status === "rejected") console.error(`[multi:${id}]`, outcome.reason);
    const items = outcome.status === "fulfilled" ? outcome.value : [];
    // Mismo periodo para todas las fuentes; los registros sin año se conservan.
    const inRange = items.filter((item) => !item.year || item.year >= desdeAnio);
    return { id, name: SOURCES[id], ok: outcome.status === "fulfilled", articles: inRange };
  });

  res.json({
    desdeAnio,
    sources: summary.map(({ id, name, ok, articles }) => ({ id, name, ok, count: articles.length })),
    articles: summary.flatMap((s) => s.articles),
  });
});
