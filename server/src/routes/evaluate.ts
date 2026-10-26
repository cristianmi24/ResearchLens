import { Router } from "express";
import { evaluateDocument } from "../evaluation/evaluate.js";
import { publicErrorMessage } from "../lib/httpErrors.js";
import type { AcademicLevel } from "../types.js";
import type { OutputLanguage } from "../pipeline/prompts.js";

export const evaluateRouter = Router();

const MIN_WORDS = 300;
// ~150 páginas de tesis; el texto se procesa por fragmentos, pero se acota para no aceptar cuerpos enormes.
const MAX_CHARS = 600_000;
const LEVELS: AcademicLevel[] = ["pregrado", "maestria", "doctorado"];
const LANGUAGES: OutputLanguage[] = ["es", "en", "pt"];

evaluateRouter.post("/", async (req, res) => {
  const { docType, level, text, language } = (req.body ?? {}) as Record<string, unknown>;
  if (docType !== "tesis" && docType !== "articulo") {
    return res.status(400).json({ error: "Indica si el documento es una tesis o un artículo." });
  }
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "No llegó el texto del documento." });
  }
  if (text.length > MAX_CHARS) {
    return res.status(413).json({ error: "El documento es demasiado largo (máximo ~150 páginas)." });
  }
  if ((text.match(/\S+/g) ?? []).length < MIN_WORDS) {
    return res.status(400).json({ error: `El documento es muy corto para evaluarlo (mínimo ${MIN_WORDS} palabras).` });
  }

  try {
    const report = await evaluateDocument({
      docType,
      level: LEVELS.includes(level as AcademicLevel) ? (level as AcademicLevel) : "pregrado",
      text: text.replace(/\r\n?/g, "\n"),
      language: LANGUAGES.includes(language as OutputLanguage) ? (language as OutputLanguage) : "es",
    });
    res.json(report);
  } catch (err) {
    console.error("[POST /evaluate]", err);
    res.status(502).json({ error: publicErrorMessage(err) });
  }
});
