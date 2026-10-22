import { Router } from "express";
import { searchRepository, UnicordobaError } from "../lib/unicordoba.js";

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
