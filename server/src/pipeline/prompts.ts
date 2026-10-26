import { researchAdvisorSkill } from "../skills/researchAdvisor.js";
import { levelGuidance } from "../skills/academicLevels.js";

/**
 * Piezas compartidas por todos los prompts del pipeline, organizados con la
 * estructura ROCAS (Rol · Objetivo · Contexto · Acciones · Salida).
 *
 * Reparto de responsabilidades:
 *  - La *system instruction* (SENIOR_RESEARCHER_SYSTEM_INSTRUCTION) fija la
 *    persona y las reglas innegociables de evidencia, iguales para todas las
 *    tareas.
 *  - Cada prompt de usuario se arma con `rocas()`: su propio rol de tarea,
 *    objetivo, datos reales de contexto, acciones paso a paso y el JSON de
 *    salida. Los esquemas JSON de salida NO cambian: el frontend y la base de
 *    datos dependen de esas formas exactas.
 */

export type OutputLanguage = "es" | "en" | "pt";

export function languageName(lang: OutputLanguage | undefined): string {
  return lang === "en" ? "English" : lang === "pt" ? "Portuguese" : "Spanish";
}

// La persona y los perfiles por nivel viven ahora como skills versionadas (server/src/skills/); aquí solo
// se reexportan para no cambiar las importaciones del resto del pipeline.
export const SENIOR_RESEARCHER_SYSTEM_INSTRUCTION = researchAdvisorSkill.instructions;
export { levelGuidance };

export interface RocasSections {
  /** R — rol específico de esta tarea (se suma a la persona de la system instruction). */
  role: string;
  /** O — qué debe lograr esta tarea. */
  objective: string;
  /** C — datos reales de entrada: idea, nivel, cifras, artículos, temas. */
  context: string;
  /** A — pasos concretos que debe seguir, en orden. */
  actions: string;
  /** S — formato exacto de salida (JSON). */
  output: string;
}

/** Arma el prompt de usuario con las cinco secciones ROCAS. */
export function rocas(s: RocasSections): string {
  return `## R — ROL
${s.role}

## O — OBJETIVO
${s.objective}

## C — CONTEXTO
${s.context}

## A — ACCIONES
${s.actions}

## S — SALIDA
${s.output}`;
}

/**
 * Con `response_format: json_object` el modelo a veces envuelve un array en un
 * objeto ({"results": [...]}). Devuelve el array en cualquiera de los dos casos
 * y [] si no hay ninguno, en vez de reventar con "map is not a function".
 */
export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const firstArray = Object.values(value as Record<string, unknown>).find(Array.isArray);
    if (firstArray) return firstArray as T[];
  }
  return [];
}
