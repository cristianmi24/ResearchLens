/**
 * Tipos relacionados con la idea de investigación del usuario y su análisis.
 * Reflejan la forma esperada de las futuras respuestas de POST /api/research/analyze
 */

export type ResearchArea =
  | "educacion"
  | "salud"
  | "tecnologia"
  | "ciencias_sociales"
  | "ciencias_naturales"
  | "ingenieria"
  | "administracion"
  | "otro";

export interface ResearchIdeaInput {
  rawText: string;
  /** Qué quiere lograr el usuario con la investigación: se pide de forma concreta y es obligatorio. */
  objective: string;
  area?: ResearchArea;
  population?: string;
  context?: string;
  intervention?: string;
}

export type ExplorationLevel = "alto" | "moderado" | "bajo";

export type TrendDirection = "creciente" | "estable" | "decreciente";

export interface ExplorationEstimate {
  level: ExplorationLevel;
  label: string;
  explanation: string;
  scoreOutOf10: number;
}

export interface ResearchIndicators {
  relatedStudiesCount: number;
  averageSimilarityLabel: "Baja" | "Media" | "Media-Alta" | "Alta";
  trend: TrendDirection;
  differentiationLabel: "Baja" | "Moderada" | "Alta";
}

export interface PublicInterestPoint {
  date: string;
  interest: number;
}

/**
 * Cruce entre el interés de búsqueda público (Google Trends) y el volumen de
 * publicaciones académicas del mismo tema (OpenAlex). Ver
 * server/src/pipeline/publicInterest.ts para el cálculo.
 */
export interface PublicInterestAnalysis {
  keyword: string;
  timeline: PublicInterestPoint[];
  slope: number;
  r2: number;
  trend: TrendDirection;
  correlationWithAcademicTrend: number | null;
  method: string;
}

export interface ResearchDiagnosis {
  id: string;
  originalIdea: string;
  refinedQuestionPreview: string;
  exploration: ExplorationEstimate;
  indicators: ResearchIndicators;
  relatedConcepts: string[];
  disclaimer: string;
  analyzedAt: string;
  publicInterest?: PublicInterestAnalysis | null;
}

export interface AnalysisStep {
  key: string;
  label: string;
  status: "done" | "active" | "pending";
}

export interface SourceConsultation {
  name: string;
  consulted: boolean;
  resultsCount: number;
  consultedAt: string;
  /** Nota informativa opcional (ej. tiempo de espera por límite de tasa). */
  note?: string;
}

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

export interface SessionHistoryEntry {
  id: string;
  originalIdea: string;
  relatedStudiesCount: number;
  createdAt: string;
}

/**
 * Una búsqueda completa tal como quedó guardada en el backend (una fila de
 * `research_sessions`): diagnóstico + artículos + temas + tendencias +
 * oportunidades de ESA búsqueda puntual, para poder volver a verla desde el
 * historial sin que se mezcle con la búsqueda más reciente.
 */
export interface ResearchSession {
  id: string;
  originalIdea: string;
  keywords: string[];
  area: ResearchArea | null;
  diagnosis: ResearchDiagnosis;
  articles: import("./article").Article[];
  sources: SourceConsultation[];
  topics: import("./topic").Topic[];
  trends: { year: number; publications: number }[];
  opportunities: import("./topic").Opportunity[];
  delimitationOptions: import("./topic").DelimitationOption[];
  createdAt: string;
}

export interface DailyUsagePoint {
  date: string;
  count: number;
}

export interface RefineFormInput {
  population: string;
  context: string;
  intervention: string;
  outcomeVariable: string;
  geography: string;
  studyType: "experimental" | "correlacional" | "cualitativo" | "revision_sistematica" | "mixto";
}

export interface QualityRating {
  clarity: "verde" | "amarillo" | "rojo";
  delimitation: "verde" | "amarillo" | "rojo";
  availableLiterature: "verde" | "amarillo" | "rojo";
  differentiation: "verde" | "amarillo" | "rojo";
}

export interface ResearchQuestionProposal {
  id: string;
  label: string;
  question: string;
  ratings: QualityRating;
}
