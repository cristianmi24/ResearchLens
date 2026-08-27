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
  trend: "creciente" | "estable" | "decreciente";
  topAuthors: string[];
  topYears: number[];
  relatedArticleIds: string[];
  timeline: TopicYearCount[];
  /** posición relativa 0-100 para el layout del mapa (mock, no fuerza real) */
  x: number;
  y: number;
}

export type OpportunityBadge =
  | "poco_explorado"
  | "parcialmente_explorado"
  | "diferenciacion_potencial";

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
