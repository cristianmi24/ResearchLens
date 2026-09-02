import * as openAlex from "../lib/openalex.js";
import { generateJSON } from "../lib/qwen.js";
import { SENIOR_RESEARCHER_SYSTEM_INSTRUCTION } from "./generative.js";
import type {
  Article,
  ExplorationLevel,
  ResearchDiagnosis,
  ResearchIdeaInput,
  TrendDirection,
} from "../types.js";

function explorationLevelFromCount(count: number): ExplorationLevel {
  if (count < 150) return "bajo";
  if (count < 800) return "moderado";
  return "alto";
}

function averageSimilarityLabel(articles: Article[]): "Baja" | "Media" | "Media-Alta" | "Alta" {
  if (articles.length === 0) return "Baja";
  const avg = articles.reduce((sum, a) => sum + a.similarityPercent, 0) / articles.length;
  if (avg >= 70) return "Alta";
  if (avg >= 50) return "Media-Alta";
  if (avg >= 30) return "Media";
  return "Baja";
}

function differentiationLabel(articles: Article[]): "Baja" | "Moderada" | "Alta" {
  const label = averageSimilarityLabel(articles);
  if (label === "Alta") return "Baja";
  if (label === "Media-Alta") return "Moderada";
  return "Alta";
}

function trendFromYearly(byYear: { year: number; count: number }[]): TrendDirection {
  if (byYear.length < 2) return "estable";
  const sorted = [...byYear].sort((a, b) => a.year - b.year);
  const recent = sorted.slice(-2).reduce((sum, y) => sum + y.count, 0);
  const previous = sorted.slice(-4, -2).reduce((sum, y) => sum + y.count, 0);
  if (previous === 0) return recent > 0 ? "creciente" : "estable";
  const change = (recent - previous) / previous;
  if (change > 0.15) return "creciente";
  if (change < -0.15) return "decreciente";
  return "estable";
}

interface DiagnosisNarrative {
  label: string;
  explanation: string;
  disclaimer: string;
}

export interface DiagnosisInputs {
  id: string;
  input: ResearchIdeaInput;
  keywords: string[];
  relatedConcepts: string[];
  refinedQuestionPreview: string;
  articles: Article[];
}

export async function buildDiagnosis(params: DiagnosisInputs): Promise<{
  diagnosis: ResearchDiagnosis;
  trendByYear: { year: number; count: number }[];
}> {
  const query = params.keywords.join(" ");
  const [relatedStudiesCount, trendByYear] = await Promise.all([
    openAlex.countWorks(query),
    openAlex.worksByYear(query),
  ]);

  const level = explorationLevelFromCount(relatedStudiesCount);
  const trend = trendFromYearly(trendByYear);
  const simLabel = averageSimilarityLabel(params.articles);
  const diffLabel = differentiationLabel(params.articles);

  const narrativePrompt = `Con base ÚNICAMENTE en estos datos reales ya calculados (no inventes cifras nuevas),
redacta en español un diagnóstico breve para el investigador sobre hacia dónde conviene orientar el estudio.

Idea: "${params.input.rawText}"
Estudios relacionados encontrados en fuentes académicas: ${relatedStudiesCount}
Nivel de exploración calculado: ${level} (bajo=poco explorado/alta oportunidad, alto=muy explorado)
Similitud promedio con la literatura recuperada: ${simLabel}
Tendencia de publicaciones en los últimos años: ${trend}
Diferenciación potencial estimada: ${diffLabel}

Responde SOLO con este JSON:
{
  "label": string (2-4 palabras, ej. "Moderadamente explorado"),
  "explanation": string (2-3 frases explicando el diagnóstico anclado en las cifras dadas),
  "disclaimer": string (1 frase breve recordando que son estimaciones basadas en las fuentes consultadas)
}`;

  let narrative: DiagnosisNarrative;
  try {
    narrative = await generateJSON<DiagnosisNarrative>(narrativePrompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION);
  } catch (err) {
    console.error("[diagnosis] Qwen narrativa falló, uso fallback:", (err as Error).message);
    narrative = {
      label: level === "bajo" ? "Poco explorado" : level === "moderado" ? "Moderadamente explorado" : "Muy explorado",
      explanation: `Se encontraron ${relatedStudiesCount} estudios relacionados con una similitud promedio ${simLabel.toLowerCase()} y una tendencia ${trend}.`,
      disclaimer: "Estimaciones basadas en las fuentes consultadas.",
    };
  }

  const scoreOutOf10 = level === "bajo" ? 8 : level === "moderado" ? 6 : 3;

  const diagnosis: ResearchDiagnosis = {
    id: params.id,
    originalIdea: params.input.rawText,
    refinedQuestionPreview: params.refinedQuestionPreview,
    exploration: {
      level,
      label: narrative.label,
      explanation: narrative.explanation,
      scoreOutOf10,
    },
    indicators: {
      relatedStudiesCount,
      averageSimilarityLabel: simLabel,
      trend,
      differentiationLabel: diffLabel,
    },
    relatedConcepts: params.relatedConcepts,
    disclaimer: narrative.disclaimer,
    analyzedAt: new Date().toISOString(),
  };

  return { diagnosis, trendByYear };
}
