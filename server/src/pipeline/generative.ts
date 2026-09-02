import { generateJSON } from "../lib/qwen.js";
import type {
  Article,
  DelimitationOption,
  Opportunity,
  RefineFormInput,
  ResearchDiagnosis,
  ResearchIdeaInput,
  ResearchQuestionProposal,
  Topic,
} from "../types.js";

/**
 * Persona aplicada como system instruction a todo prompt que decide "hacia dónde"
 * debe orientarse una investigación (oportunidades, delimitación, preguntas).
 * Un investigador senior prioriza rigor metodológico y viabilidad real sobre
 * originalidad superficial, y nunca rellena huecos de evidencia con inventos.
 */
export const SENIOR_RESEARCHER_SYSTEM_INSTRUCTION = `Actúas como un investigador senior con más de 15 años de
experiencia dirigiendo líneas de investigación académica, evaluando artículos como par (peer review) en revistas
indexadas y asesorando tesis de maestría y doctorado. Tu criterio prioriza siempre:
1) Rigor metodológico y viabilidad real del estudio, no solo originalidad superficial.
2) Anclar cada juicio ÚNICAMENTE en los datos reales entregados (artículos y temas ya recuperados de fuentes
   académicas). Está PROHIBIDO inventar estudios, cifras, autores o tendencias que no estén en el contexto dado.
3) Ser explícito cuando la evidencia disponible es insuficiente para orientar una decisión, en vez de rellenar el
   vacío con suposiciones.
4) Redactar en español, con lenguaje directo y accionable para quien va a ejecutar la investigación.`;

export async function buildOpportunities(
  input: ResearchIdeaInput,
  diagnosis: ResearchDiagnosis,
  topics: Topic[],
  articles: Article[],
): Promise<{ opportunities: Opportunity[]; delimitationOptions: DelimitationOption[] }> {
  const prompt = `Identifica oportunidades de investigación delimitando la idea del usuario, basándote SOLO en los
datos reales dados abajo (temas y artículos ya recuperados de bases de datos científicas). No inventes
estadísticas nuevas.

Idea del usuario:
- Texto: "${input.rawText}"
- Población: ${input.population ?? "no especificada"}
- Contexto: ${input.context ?? "no especificado"}
- Intervención/variable: ${input.intervention ?? "no especificada"}
- Objetivo: ${input.objective ?? "no especificado"}

Temas encontrados en la literatura (nombre, cantidad real de estudios, concentración):
${topics.map((t) => `- ${t.name}: ${t.studiesCount} estudios, concentración ${t.concentration}`).join("\n") || "(sin temas identificados)"}

Muestra de artículos recuperados (título — conceptos):
${articles.slice(0, 12).map((a) => `- ${a.title} — [${a.mainConcepts.join(", ")}]`).join("\n")}

Responde SOLO con este JSON:
{
  "opportunities": [
    {
      "badge": "poco_explorado" | "parcialmente_explorado" | "diferenciacion_potencial",
      "badgeLabel": string (versión legible del badge en español),
      "dimension": "contexto" | "poblacion" | "variable" | "metodologia",
      "title": string (2-4 palabras),
      "description": string (2-3 frases en español justificando la oportunidad con lo encontrado)
    }
  ] (entre 3 y 5 elementos, cubriendo dimensiones distintas cuando sea posible),
  "delimitationOptions": [
    {
      "optionLabel": string (ej. "Opción 1 · Cambiar población"),
      "changeType": "poblacion" | "variable" | "contexto",
      "suggestion": string (una frase concreta y accionable)
    }
  ] (2 a 3 elementos)
}`;

  const result = await generateJSON<{
    opportunities: Omit<Opportunity, "id">[];
    delimitationOptions: Omit<DelimitationOption, "id">[];
  }>(prompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION);

  return {
    opportunities: result.opportunities.map((o, i) => ({ ...o, id: `opp-${i + 1}` })),
    delimitationOptions: result.delimitationOptions.map((d, i) => ({ ...d, id: `delim-${i + 1}` })),
  };
}

export async function refineQuestion(
  formInput: RefineFormInput,
  diagnosis: ResearchDiagnosis,
  topics: Topic[],
): Promise<ResearchQuestionProposal[]> {
  const prompt = `Propón preguntas de investigación bien delimitadas a partir de los campos que llenó el usuario y
del panorama real de literatura ya recuperado.

Campos del usuario:
- Población: ${formInput.population}
- Contexto: ${formInput.context}
- Intervención/variable: ${formInput.intervention}
- Variable de resultado: ${formInput.outcomeVariable}
- Geografía: ${formInput.geography}
- Tipo de estudio: ${formInput.studyType}

Panorama de literatura (para calibrar qué tan disponible está la evidencia):
- Estudios relacionados totales: ${diagnosis.indicators.relatedStudiesCount}
- Similitud promedio con la idea original: ${diagnosis.indicators.averageSimilarityLabel}
- Temas con mayor concentración: ${topics.filter((t) => t.concentration === "alta").map((t) => t.name).join(", ") || "ninguno"}
- Temas poco explorados: ${topics.filter((t) => t.concentration === "baja").map((t) => t.name).join(", ") || "ninguno"}

Responde SOLO con este JSON, un array de 3 propuestas:
[
  {
    "label": "Propuesta A" | "Propuesta B" | "Propuesta C",
    "question": string (pregunta de investigación completa en español, delimitada con población/contexto/variable),
    "ratings": {
      "clarity": "verde"|"amarillo"|"rojo",
      "delimitation": "verde"|"amarillo"|"rojo",
      "availableLiterature": "verde"|"amarillo"|"rojo",
      "differentiation": "verde"|"amarillo"|"rojo"
    }
  }
]`;

  const result = await generateJSON<Omit<ResearchQuestionProposal, "id">[]>(prompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION);
  return result.map((p, i) => ({ ...p, id: `prop-${String.fromCharCode(97 + i)}` }));
}
