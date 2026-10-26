import { apiFetch } from "./api";
import type { AcademicLevel } from "@/types/research";

/** Evaluación de tesis y artículos (server/src/routes/evaluate.ts → evaluation/evaluate.ts). */

export type DocumentType = "tesis" | "articulo";

export type ReferenceStatus = "verificada" | "encontrada" | "no-coincide" | "doi-invalido" | "no-encontrada";

export interface ReferenceCheck {
  raw: string;
  status: ReferenceStatus;
  doi?: string;
  matchedTitle?: string;
  matchedYear?: number;
  source?: "Crossref" | "OpenAlex";
  note?: string;
}

export interface ApaIssue {
  type: string;
  message: string;
  examples: string[];
}

export interface CriterionResult {
  id: string;
  name: string;
  weight: number;
  score: number;
  evidence: string;
  recommendation: string;
}

export interface EvaluationReport {
  docType: DocumentType;
  level: AcademicLevel | null;
  skill: { id: string; version: string };
  overallScore: number;
  verdict: string;
  summary: string;
  levelFit: string | null;
  criteria: CriterionResult[];
  strengths: string[];
  priorities: string[];
  sections: { id: string; name: string; found: boolean; words: number }[];
  stats: { words: number; references: number; citations: number };
  apa: ApaIssue[] | null;
  references: { total: number; checked: ReferenceCheck[] };
  evaluatedAt: string;
}

export function evaluateDocument(params: {
  docType: DocumentType;
  level: AcademicLevel;
  text: string;
  language: string;
}): Promise<EvaluationReport> {
  return apiFetch<EvaluationReport>("/evaluate", { method: "POST", body: JSON.stringify(params) });
}
