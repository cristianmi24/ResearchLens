import { embedTexts, cosineSimilarity, generateJSON } from "../lib/qwen.js";
import type { Article, ComparisonField, ResearchIdeaInput } from "../types.js";

const TOP_N_FOR_REASONING = 8;

/** Calcula similitud idea↔artículo con embeddings reales de Qwen (coseno → %). */
export async function scoreSimilarity(ideaText: string, articles: Article[]): Promise<Article[]> {
  if (articles.length === 0) return [];

  const texts = [ideaText, ...articles.map((a) => `${a.title}\n${a.abstract}`.slice(0, 4000))];
  const vectors = await embedTexts(texts);
  const [ideaVector, ...articleVectors] = vectors;

  return articles.map((article, i) => {
    const sim = cosineSimilarity(ideaVector, articleVectors[i]);
    // El coseno de embeddings de texto rara vez baja de ~0.3 entre textos del
    // mismo dominio; se reescala a un rango 0-100 más legible para el usuario.
    const percent = Math.round(Math.max(0, Math.min(1, (sim - 0.3) / 0.55)) * 100);
    return { ...article, similarityPercent: percent };
  });
}

interface ReasonAndComparison {
  articleId: string;
  similarityReason: string;
  comparison: ComparisonField[];
}

/** Para el top-N de artículos, pide a Qwen una justificación y comparación campo a campo. */
export async function annotateTopArticles(input: ResearchIdeaInput, articles: Article[]): Promise<Article[]> {
  const sorted = [...articles].sort((a, b) => b.similarityPercent - a.similarityPercent);
  const top = sorted.slice(0, TOP_N_FOR_REASONING);
  const rest = sorted.slice(TOP_N_FOR_REASONING);

  if (top.length === 0) return articles;

  const prompt = `Comparas la idea de investigación de un usuario contra una lista de artículos científicos ya
recuperados. NO inventes datos que no estén en el resumen del artículo. Si un campo no se puede inferir del
resumen, usa "No especificado" como articleValue y "diferente" como match.

Idea del usuario:
- Texto: "${input.rawText}"
- Población: ${input.population ?? "no especificada"}
- Contexto: ${input.context ?? "no especificado"}
- Intervención/variable: ${input.intervention ?? "no especificada"}
- Objetivo: ${input.objective ?? "no especificado"}

Artículos (usa el mismo "articleId" en tu respuesta):
${top.map((a) => `- articleId: ${a.id}\n  título: ${a.title}\n  resumen: ${a.abstract.slice(0, 600)}`).join("\n")}

Responde SOLO con un JSON array. Cada elemento:
{
  "articleId": string (igual al dado),
  "similarityReason": string (1 frase en español explicando por qué se parece o no a la idea),
  "comparison": [
    { "label": "Población", "ideaValue": string, "articleValue": string, "match": "coincide"|"parcial"|"diferente" },
    { "label": "Contexto", "ideaValue": string, "articleValue": string, "match": "coincide"|"parcial"|"diferente" },
    { "label": "Variable/Intervención", "ideaValue": string, "articleValue": string, "match": "coincide"|"parcial"|"diferente" }
  ]
}`;

  let annotations: ReasonAndComparison[] = [];
  try {
    annotations = await generateJSON<ReasonAndComparison[]>(prompt);
  } catch (err) {
    console.error("[similarity] no se pudieron generar comparaciones con Qwen:", (err as Error).message);
  }

  const byId = new Map(annotations.map((a) => [a.articleId, a]));

  const annotatedTop = top.map((article) => {
    const annotation = byId.get(article.id);
    if (annotation) {
      return { ...article, similarityReason: annotation.similarityReason, comparison: annotation.comparison };
    }
    return {
      ...article,
      similarityReason: fallbackReason(article),
      comparison: [],
    };
  });

  const annotatedRest = rest.map((article) => ({ ...article, similarityReason: fallbackReason(article), comparison: [] }));

  return [...annotatedTop, ...annotatedRest];
}

function fallbackReason(article: Article): string {
  if (article.mainConcepts.length > 0) {
    return `Similitud calculada por proximidad semántica del resumen; comparte los conceptos ${article.mainConcepts.slice(0, 2).join(" y ")}.`;
  }
  return "Similitud calculada automáticamente por proximidad semántica entre el resumen y tu idea.";
}
