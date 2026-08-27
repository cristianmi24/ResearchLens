import { Router } from "express";
import { randomUUID } from "node:crypto";
import { generateJSON } from "../lib/qwen.js";
import { getLatestSession } from "../db/researchSessions.js";
import { saveMessage } from "../db/assistantMessages.js";
import type { AssistantCitation, AssistantMessage } from "../types.js";

export const assistantRouter = Router();

const SYSTEM_INSTRUCTION = `Eres el asistente de investigación de ResearchLens. SOLO puedes responder preguntas
factuales usando los artículos que te se te dan como contexto (título, resumen, año, DOI). Está PROHIBIDO
inventar artículos, autores, cifras o DOI que no estén en el contexto. Si la pregunta no se puede responder con
el contexto dado, dilo explícitamente y sugiere reformular la búsqueda. Cita siempre las fuentes que uses.`;

interface AssistantJsonResponse {
  text: string;
  citedArticleIds: string[];
}

assistantRouter.post("/chat", async (req, res) => {
  try {
    const { question } = req.body as { question?: string };
    if (!question?.trim()) return res.status(400).json({ error: "question es requerido" });

    const session = await getLatestSession(req.userId!);
    if (!session || session.articles.length === 0) {
      const fallback: Omit<AssistantMessage, "id" | "role" | "createdAt"> = {
        text: "Todavía no he recuperado literatura para tu idea. Analiza una idea de investigación primero para que pueda responder citando fuentes reales.",
      };
      return res.json(fallback);
    }

    const context = session.articles
      .slice(0, 20)
      .map((a) => `articleId: ${a.id}\ntítulo: ${a.title}\naño: ${a.year}\ndoi: ${a.doi || "N/D"}\nresumen: ${a.abstract.slice(0, 500)}`)
      .join("\n---\n");

    const prompt = `Contexto (artículos recuperados de fuentes académicas reales):\n${context}\n\nPregunta del usuario: "${question}"\n\nResponde SOLO con este JSON:\n{\n  "text": string (respuesta en español, citando ideas del contexto),\n  "citedArticleIds": string[] (los articleId realmente usados para responder; vacío si no citaste ninguno)\n}`;

    const result = await generateJSON<AssistantJsonResponse>(prompt, SYSTEM_INSTRUCTION);

    const citations: AssistantCitation[] = result.citedArticleIds
      .map((id) => session.articles.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({ articleId: a.id, title: a.title, doi: a.doi }));

    const message: AssistantMessage = {
      id: randomUUID(),
      role: "assistant",
      text: result.text,
      citations,
      createdAt: new Date().toISOString(),
    };

    await saveMessage(session.id, message).catch((err) =>
      console.error("[assistant] no se pudo persistir el mensaje:", err),
    );

    const { id: _id, role: _role, createdAt: _createdAt, ...rest } = message;
    res.json(rest);
  } catch (err) {
    console.error("[POST /assistant/chat]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});
