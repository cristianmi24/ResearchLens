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

export async function buildOpportunities(
  input: ResearchIdeaInput,
  diagnosis: ResearchDiagnosis,
  topics: Topic[],
  articles: Article[],
): Promise<{ opportunities: Opportunity[]; delimitationOptions: DelimitationOption[] }> {
  const prompt = `Eres un asistente de investigación académica. Identifica oportunidades de investigación
delimitando la idea del usuario, basándote SOLO en los datos reales dados abajo (temas y artículos ya
recuperados de bases de datos científicas). No inventes estadísticas nuevas.

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
  }>(prompt);

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
  const prompt = `Eres un asistente de investigación académica. Propones preguntas de investigación bien
delimitadas a partir de los campos que llenó el usuario y del panorama real de literatura ya recuperado.

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

  const result = await generateJSON<Omit<ResearchQuestionProposal, "id">[]>(prompt);
  return result.map((p, i) => ({ ...p, id: `prop-${String.fromCharCode(97 + i)}` }));
}
