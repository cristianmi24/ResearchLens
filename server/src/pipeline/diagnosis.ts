import * as openAlex from "../lib/openalex.js";
import { generateJSON } from "../lib/qwen.js";
import { SENIOR_RESEARCHER_SYSTEM_INSTRUCTION, languageName, levelGuidance, rocas } from "./prompts.js";
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

  const lang = params.input.language ?? "es";
  const langName = languageName(lang);

  const narrativePrompt = rocas({
    role: `Eres el asesor que interpreta los indicadores cuantitativos del panorama de una idea para decidir hacia dónde conviene orientar el estudio.`,
    objective: `Redactar un diagnóstico breve, honesto y accionable que traduzca las cifras reales en una orientación concreta para el investigador, sin inventar ninguna cifra nueva.`,
    context: `Idea: "${params.input.rawText}"
Nivel académico: ${params.input.academicLevel ?? "pregrado"}. ${levelGuidance(params.input.academicLevel)}

Indicadores calculados (evidencia directa; no los modifiques):
- Estudios relacionados encontrados en fuentes académicas: ${relatedStudiesCount}
- Nivel de exploración calculado: ${level} (bajo=poco explorado/más espacio para aportar, alto=muy explorado). Se deriva del conteo de obras para los términos de búsqueda: menos de 150 = bajo, 150 a 800 = moderado, más de 800 = alto.
- Similitud promedio con la literatura recuperada: ${simLabel}
- Tendencia de publicaciones en los últimos años: ${trend}
- Diferenciación potencial estimada (se deriva de la similitud): ${diffLabel}

Idioma de salida: ${langName}.`,
    actions: `1. Interpreta las cifras tal cual: son la única evidencia directa disponible; no agregues números ni estudios.
2. Relaciona nivel de exploración, tendencia y similitud entre sí (ej.: muy explorado y creciente exige delimitar con precisión; poco explorado puede ser oportunidad o una búsqueda demasiado estrecha, y debes decir cuál de las dos hay que descartar).
3. Matiza: el conteo mide volumen de literatura para los términos buscados, no su calidad ni la saturación del problema específico del usuario; una similitud alta no implica que la idea ya esté resuelta. Presenta lo que infieras como inferencia, no como hecho.
4. Adapta la orientación al nivel académico indicado.
5. Cierra con la siguiente decisión concreta (delimitar población, contexto o método; ampliar o afinar la búsqueda; etc.).`,
    output: `Responde SOLO con este JSON (con todos los valores redactados en ${langName}):
{
  "label": string (2-4 palabras, ej. "${lang === "en" ? "Moderately explored" : lang === "pt" ? "Moderadamente explorado" : "Moderadamente explorado"}"),
  "explanation": string (máximo 3 frases en ${langName}: primero la evidencia con las cifras dadas, luego la inferencia con matiz y por último la siguiente decisión recomendada),
  "disclaimer": string (1 frase breve en ${langName} recordando que son estimaciones basadas en una muestra de las fuentes consultadas y que un vacío no es definitivo sin una búsqueda adicional)
}`,
  });

  let narrative: DiagnosisNarrative;
  try {
    narrative = await generateJSON<DiagnosisNarrative>(narrativePrompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION);
  } catch (err) {
    console.error("[diagnosis] Qwen narrativa falló, uso fallback:", (err as Error).message);
    if (lang === "en") {
      narrative = {
        label: level === "bajo" ? "Rarely explored" : level === "moderado" ? "Moderately explored" : "Heavily explored",
        explanation: `Found ${relatedStudiesCount} related studies with an average similarity rating of ${simLabel.toLowerCase()} and a ${trend} trend.`,
        disclaimer: "Estimates based on retrieved academic sources.",
      };
    } else if (lang === "pt") {
      narrative = {
        label: level === "bajo" ? "Pouco explorado" : level === "moderado" ? "Moderadamente explorado" : "Muito explorado",
        explanation: `Foram encontrados ${relatedStudiesCount} estudos relacionados com uma similaridade média ${simLabel.toLowerCase()} e uma tendência ${trend}.`,
        disclaimer: "Estimativas baseadas nas fontes consultadas.",
      };
    } else {
      narrative = {
        label: level === "bajo" ? "Poco explorado" : level === "moderado" ? "Moderadamente explorado" : "Muy explorado",
        explanation: `Se encontraron ${relatedStudiesCount} estudios relacionados con una similitud promedio ${simLabel.toLowerCase()} y una tendencia ${trend}.`,
        disclaimer: "Estimaciones basadas en las fuentes consultadas.",
      };
    }
  }

  const scoreOutOf10 = level === "bajo" ? 8 : level === "moderado" ? 6 : 3;

  const diagnosis: ResearchDiagnosis = {
    id: params.id,
    originalIdea: params.input.rawText,
    academicLevel: params.input.academicLevel ?? "pregrado",
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
