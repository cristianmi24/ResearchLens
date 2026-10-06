/**
 * Tipos compartidos con el frontend (src/types/*.ts). Se duplican aquí a
 * propósito: el backend es un paquete npm independiente y no comparte
 * tsconfig con la app de Vite. Si cambian los tipos del frontend, replicar
 * el cambio aquí.
 */

export type ArticleSource = "OpenAlex" | "Crossref" | "Semantic Scholar" | "arXiv" | "DOAJ";

export type ComparisonMatch = "coincide" | "parcial" | "diferente";

export interface ComparisonField {
  label: string;
  ideaValue: string;
  articleValue: string;
  match: ComparisonMatch;
}

export interface Article {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: ArticleSource;
  doi: string;
  abstract: string;
  mainConcepts: string[];
  /** Países (ISO alfa-2) de las instituciones de los autores. Solo lo informa OpenAlex. */
  countries?: string[];
  similarityPercent: number;
  similarityReason: string;
  comparison: ComparisonField[];
}

export type ResearchArea =
  | "educacion"
  | "salud"
  | "tecnologia"
  | "ciencias_sociales"
  | "ciencias_naturales"
  | "ingenieria"
  | "administracion"
  | "otro";

export type AcademicLevel = "pregrado" | "maestria" | "doctorado";

export interface ResearchIdeaInput {
  rawText: string;
  academicLevel?: AcademicLevel;
  area?: ResearchArea;
  population?: string;
  context?: string;
  intervention?: string;
  objective?: string;
  language?: "es" | "en" | "pt";
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
 * publicaciones académicas del mismo tema (OpenAlex). `slope`/`r2` salen de
 * una regresión lineal sobre la serie de interés; `correlationWithAcademicTrend`
 * es un coeficiente de Pearson (-1 a 1) entre ambas series por año. Ver
 * `pipeline/publicInterest.ts`.
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

export interface GeoCountryCount {
  /** ISO alfa-2. */
  code: string;
  /** Estudios de la búsqueda con al menos una institución del país (conteo exacto en OpenAlex). */
  count: number;
}

export interface GeoInstitution {
  /** Id corto de OpenAlex (ej. "I324290372"). */
  id: string;
  name: string;
  /** Estudios de la muestra nacional en los que participa. */
  count: number;
  city: string | null;
  region: string | null;
  lat: number;
  lon: number;
}

/**
 * Dónde se investiga el tema, según la ubicación de las instituciones de los
 * autores en OpenAlex. `countries` es un conteo exacto sobre todos los estudios
 * de la búsqueda; `colombia` detalla la vista nacional a partir de los estudios
 * más relevantes con institución colombiana. Ver `pipeline/geoResearch.ts`.
 */
export interface GeoResearchDistribution {
  query: string;
  /** Estudios en OpenAlex que coinciden con la búsqueda. */
  total: number;
  countries: GeoCountryCount[];
  colombia: {
    /** Estudios de la búsqueda con al menos una institución colombiana. */
    total: number;
    /** Cuántos de ellos se analizaron (los más relevantes). */
    sampleSize: number;
    institutions: GeoInstitution[];
    /** Instituciones colombianas sin coordenadas en OpenAlex (no se pueden ubicar). */
    unlocated: number;
    /** Por cada estudio analizado, ids de sus instituciones colombianas ubicadas. */
    works: string[][];
  } | null;
}

export interface ResearchDiagnosis {
  id: string;
  originalIdea: string;
  academicLevel: AcademicLevel;
  refinedQuestionPreview: string;
  exploration: ExplorationEstimate;
  indicators: ResearchIndicators;
  relatedConcepts: string[];
  disclaimer: string;
  analyzedAt: string;
  /** `null` si Google Trends no dio suficientes datos para este término; opcional por compatibilidad con sesiones guardadas antes de este campo. */
  publicInterest?: PublicInterestAnalysis | null;
  /** `null` si OpenAlex no devolvió distribución geográfica; opcional por compatibilidad con sesiones anteriores. */
  geoDistribution?: GeoResearchDistribution | null;
}

export interface SourceConsultation {
  name: string;
  consulted: boolean;
  resultsCount: number;
  consultedAt: string;
  /** Nota informativa opcional (ej. tiempo de espera por límite de tasa). */
  note?: string;
}

export interface RefineFormInput {
  population: string;
  context: string;
  intervention: string;
  outcomeVariable: string;
  geography: string;
  studyType: "experimental" | "correlacional" | "cualitativo" | "revision_sistematica" | "mixto" | "no_definido";
  language?: "es" | "en" | "pt";
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

export type ConcentrationLevel = "alta" | "media" | "baja";

export interface TopicYearCount {
  year: number;
  publications: number;
}

export interface Topic {
  id: string;
  name: string;
  studiesCount: number;
  concentration: ConcentrationLevel;
  trend: TrendDirection;
  topAuthors: string[];
  topYears: number[];
  relatedArticleIds: string[];
  timeline: TopicYearCount[];
  x: number;
  y: number;
}

export type OpportunityBadge = "poco_explorado" | "parcialmente_explorado" | "diferenciacion_potencial";

export interface Opportunity {
  id: string;
  badge: OpportunityBadge;
  badgeLabel: string;
  dimension: "contexto" | "poblacion" | "variable" | "metodologia";
  title: string;
  description: string;
}

export interface DelimitationOption {
  id: string;
  optionLabel: string;
  changeType: "poblacion" | "variable" | "contexto";
  suggestion: string;
}

export interface AssistantCitation {
  articleId: string;
  title: string;
  doi: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: AssistantCitation[];
  createdAt: string;
}

export interface ProjectHistoryEntry {
  id: string;
  label: string;
  date: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  originalIdea: string;
  createdAt: string;
  lastAnalyzedAt: string;
  diagnosis: ResearchDiagnosis;
  savedArticles: Article[];
  opportunities: Opportunity[];
  currentQuestion: string | null;
  proposals: ResearchQuestionProposal[];
  history: ProjectHistoryEntry[];
}

/** Estado interno de una sesión de búsqueda, persistido en research_sessions. */
export interface ResearchSession {
  id: string;
  originalIdea: string;
  keywords: string[];
  area: ResearchArea | null;
  diagnosis: ResearchDiagnosis;
  articles: Article[];
  sources: SourceConsultation[];
  topics: Topic[];
  trends: TopicYearCount[];
  opportunities: Opportunity[];
  delimitationOptions: DelimitationOption[];
  createdAt: string;
}

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  /** Inicio del próximo día (UTC), cuando se reinicia el contador. */
  resetsAt: string;
}

export interface SessionHistoryEntry {
  id: string;
  originalIdea: string;
  relatedStudiesCount: number;
  createdAt: string;
}
