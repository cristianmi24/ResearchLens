import { generateJSON } from "../lib/qwen.js";
import {
  SENIOR_RESEARCHER_SYSTEM_INSTRUCTION,
  asArray,
  languageName,
  levelGuidance,
  rocas,
} from "./prompts.js";
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

// Reexportado para no romper imports existentes; la definición vive en prompts.ts.
export { SENIOR_RESEARCHER_SYSTEM_INSTRUCTION };

const TOP_ARTICLES_WITH_ABSTRACT = 8;
const OTHER_ARTICLES_TITLES = 4;
const ABSTRACT_SNIPPET_CHARS = 220;

function formatArticleSample(articles: Article[]): string {
  const withAbstract = articles.slice(0, TOP_ARTICLES_WITH_ABSTRACT).map((a, i) => {
    const abstract = a.abstract ? ` | resumen: ${a.abstract.slice(0, ABSTRACT_SNIPPET_CHARS)}…` : "";
    return `${i + 1}. "${a.title}" (${a.year || "s/f"}) — conceptos: [${a.mainConcepts.join(", ")}] — similitud ${a.similarityPercent}%${abstract}`;
  });
  const titlesOnly = articles
    .slice(TOP_ARTICLES_WITH_ABSTRACT, TOP_ARTICLES_WITH_ABSTRACT + OTHER_ARTICLES_TITLES)
    .map((a, i) => `${TOP_ARTICLES_WITH_ABSTRACT + i + 1}. "${a.title}" (${a.year || "s/f"}) — conceptos: [${a.mainConcepts.join(", ")}]`);
  return [...withAbstract, ...titlesOnly].join("\n") || "(sin artículos recuperados)";
}

function formatPublicInterest(diagnosis: ResearchDiagnosis): string {
  const pi = diagnosis.publicInterest;
  if (!pi) return "no disponible (Google Trends no devolvió datos suficientes para este término)";
  const corr =
    pi.correlationWithAcademicTrend === null
      ? "sin años en común suficientes para correlacionar con la producción académica"
      : `correlación de Pearson con publicaciones académicas por año: ${pi.correlationWithAcademicTrend}`;
  return `tendencia ${pi.trend} para "${pi.keyword}" (pendiente ${pi.slope}, R² ${pi.r2}); ${corr}`;
}

/** Dónde se investiga el tema (OpenAlex): evidencia directa para un posible vacío contextual/geográfico. */
function formatGeoDistribution(diagnosis: ResearchDiagnosis): string {
  const geo = diagnosis.geoDistribution;
  if (!geo || geo.countries.length === 0) return "no disponible (OpenAlex no devolvió distribución por país)";
  const pct = (n: number) => `${((n / geo.total) * 100).toFixed(1)}%`;
  const top = geo.countries.slice(0, 8).map((c) => `${c.code} ${c.count} (${pct(c.count)})`).join(", ");
  const co = geo.countries.find((c) => c.code === "CO");
  const colombia = co
    ? `Colombia: ${co.count} estudios (${pct(co.count)})`
    : "Colombia: sin estudios con institución colombiana entre los resultados";
  return `${geo.total} estudios en total; con país informado, los más frecuentes: ${top}. ${colombia}. (Un estudio cuenta en cada país de sus instituciones; es conteo exacto sobre todos los resultados, no solo la muestra.)`;
}

export async function buildOpportunities(
  input: ResearchIdeaInput,
  diagnosis: ResearchDiagnosis,
  topics: Topic[],
  articles: Article[],
): Promise<{ opportunities: Opportunity[]; delimitationOptions: DelimitationOption[] }> {
  const lang = input.language ?? "es";
  const langName = languageName(lang);
  const optionExample =
    lang === "en" ? "Option 1 · Change population" : lang === "pt" ? "Opção 1 · Mudar população" : "Opción 1 · Cambiar población";

  const prompt = rocas({
    role: `Eres el asesor que detecta oportunidades de investigación a partir de la literatura ya recuperada: mapeas qué se ha estudiado (poblaciones, contextos, variables, métodos) y distingues un vacío sólido de una simple ausencia aparente de estudios.`,
    objective: `Identificar oportunidades de investigación defendibles para la idea del usuario y proponer formas concretas de delimitarla, usando SOLO los temas, artículos y cifras reales entregados. Si la evidencia no sustenta un vacío fuerte, decirlo en vez de forzarlo.`,
    context: `Idea del usuario:
- Texto: "${input.rawText}"
- Nivel académico: ${diagnosis.academicLevel}. ${levelGuidance(diagnosis.academicLevel)}
- Población: ${input.population ?? "no especificada (dimensión por definir)"}
- Contexto: ${input.context ?? "no especificado (dimensión por definir)"}
- Intervención/variable: ${input.intervention ?? "no especificada (dimensión por definir)"}
- Objetivo: ${input.objective ?? "no especificado"}

Indicadores calculados (cifras reales, no las modifiques):
- Estudios relacionados en OpenAlex: ${diagnosis.indicators.relatedStudiesCount} (nivel de exploración: ${diagnosis.exploration.level})
- Similitud promedio de la muestra con la idea: ${diagnosis.indicators.averageSimilarityLabel}
- Tendencia de publicaciones académicas: ${diagnosis.indicators.trend}
- Diferenciación potencial estimada: ${diagnosis.indicators.differentiationLabel}
- Interés público (Google Trends): ${formatPublicInterest(diagnosis)}
- Distribución geográfica de los estudios: ${formatGeoDistribution(diagnosis)}

Temas encontrados (nombre, estudios reales, concentración, tendencia):
${topics.map((t) => `- ${t.name}: ${t.studiesCount} estudios, concentración ${t.concentration}, tendencia ${t.trend}`).join("\n") || "(sin temas identificados)"}

Muestra de artículos recuperados (ordenados por similitud con la idea; es una MUESTRA parcial, no toda la literatura):
${formatArticleSample(articles)}

Idioma de salida de todos los textos: ${langName}.`,
    actions: `1. Delimita: separa lo que el usuario ya definió de lo que falta por definir (población, contexto, variable); no inventes lo que falta.
2. Mapea la muestra: identifica qué poblaciones, contextos, variables/constructos y métodos aparecen en los artículos y temas, cuáles dominan y cuáles casi no aparecen.
3. Busca oportunidades en estas dimensiones y asigna el valor "dimension" correspondiente:
   - vacío poblacional (poblaciones poco estudiadas) → "poblacion"
   - vacío contextual (país, región, nivel educativo, modalidad, tipo de institución; apóyate en la distribución geográfica real de los estudios, sin inferir calidad de ella) → "contexto"
   - vacío de variable/constructo: relación poco estudiada, teoría poco integrada, evidencia contradictoria o necesidad de actualización temporal → "variable"
   - vacío metodológico (predominio de un diseño; oportunidad de otro enfoque) → "metodologia"
4. Califica la fuerza de la evidencia de cada una y elige el "badge" coherente:
   - "poco_explorado": la muestra casi no toca esa dimensión (respaldado por temas de concentración baja o ausencia clara en los artículos).
   - "parcialmente_explorado": hay estudios, pero cubren solo una parte (evidencia escasa, contradictoria o limitada a otros contextos/poblaciones).
   - "diferenciacion_potencial": el tema está bien cubierto, pero existe un ángulo concreto que permitiría diferenciarse.
5. No fuerces nada: entrega entre 3 y 5 oportunidades distintas entre sí. Si la evidencia de alguna es débil, dilo en su descripción y plantéala como hipótesis que requiere una búsqueda adicional. No confundas "pocos estudios en la muestra" con "gap importante".
6. En cada "description" (2-3 frases) cubre en orden: (a) qué muestra la literatura recuperada, citando el tema o el título abreviado del artículo (evidencia directa); (b) por qué eso abre una oportunidad (inferencia, con matiz); (c) qué NO se puede afirmar todavía.
7. Delimitación: propón entre 2 y 3 opciones, cada una cambiando UNA dimensión (población, variable o contexto), concretas y accionables, ligadas a un tema o artículo recuperado, proporcionales al nivel académico, e indicando qué ganaría el estudio con ese cambio (1-2 frases).
8. Antes de responder verifica: cada afirmación es rastreable a los datos entregados, no inventaste estudios ni cifras y ninguna inferencia está presentada como hecho.`,
    output: `Responde SOLO con este JSON (títulos, descripciones y sugerencias en ${langName}):
{
  "opportunities": [
    {
      "badge": "poco_explorado" | "parcialmente_explorado" | "diferenciacion_potencial",
      "badgeLabel": string (versión legible del badge en ${langName}),
      "dimension": "contexto" | "poblacion" | "variable" | "metodologia",
      "title": string (2-4 palabras, en ${langName}),
      "description": string (2-3 frases en ${langName}: evidencia encontrada, por qué es oportunidad y qué no se puede afirmar aún)
    }
  ] (entre 3 y 5 elementos, cubriendo dimensiones distintas cuando la evidencia lo permita),
  "delimitationOptions": [
    {
      "optionLabel": string (ej. "${optionExample}"),
      "changeType": "poblacion" | "variable" | "contexto",
      "suggestion": string (1-2 frases concretas y accionables en ${langName}, con qué se gana al delimitar así)
    }
  ] (2 a 3 elementos)
}`,
  });

  const result = await generateJSON<{
    opportunities: Omit<Opportunity, "id">[];
    delimitationOptions: Omit<DelimitationOption, "id">[];
  }>(prompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION);

  return {
    opportunities: (result.opportunities ?? []).map((o, i) => ({ ...o, id: `opp-${i + 1}` })),
    delimitationOptions: (result.delimitationOptions ?? []).map((d, i) => ({ ...d, id: `delim-${i + 1}` })),
  };
}

export async function refineQuestion(
  formInput: RefineFormInput,
  diagnosis: ResearchDiagnosis,
  topics: Topic[],
): Promise<ResearchQuestionProposal[]> {
  const lang = formInput.language ?? "es";
  const langName = languageName(lang);
  const label = (letter: "A" | "B" | "C") =>
    `${lang === "en" ? "Proposal" : lang === "pt" ? "Proposta" : "Propuesta"} ${letter}`;
  const undefinedField = "(sin definir por el usuario)";
  const field = (value: string | undefined) => (value?.trim() ? value.trim() : undefinedField);

  const prompt = rocas({
    role: `Eres el asesor que transforma una idea general en preguntas de investigación defendibles: cada pregunta debe poder rastrearse hasta la evidencia disponible y ser coherente con el diseño metodológico.`,
    objective: `Proponer 3 preguntas de investigación bien delimitadas, a partir de los campos que llenó el usuario y del panorama real de literatura recuperado, proporcionales al nivel académico y calificadas con honestidad.`,
    context: `Campos del usuario:
- Idea original: "${diagnosis.originalIdea}"
- Nivel académico: ${diagnosis.academicLevel}. ${levelGuidance(diagnosis.academicLevel)}
- Población: ${field(formInput.population)}
- Contexto: ${field(formInput.context)}
- Intervención/variable: ${field(formInput.intervention)}
- Variable de resultado: ${field(formInput.outcomeVariable)}
- Geografía: ${field(formInput.geography)}
- Tipo de estudio: ${formInput.studyType === "no_definido" ? "aún no definido; sugiere opciones sin imponer una" : formInput.studyType}

Panorama de literatura (cifras reales; sirven para calibrar qué tan disponible está la evidencia):
- Estudios relacionados totales: ${diagnosis.indicators.relatedStudiesCount}
- Nivel de exploración: ${diagnosis.exploration.level}; tendencia: ${diagnosis.indicators.trend}
- Similitud promedio con la idea original: ${diagnosis.indicators.averageSimilarityLabel}
- Temas con mayor concentración: ${topics.filter((t) => t.concentration === "alta").map((t) => t.name).join(", ") || "ninguno"}
- Temas poco explorados: ${topics.filter((t) => t.concentration === "baja").map((t) => t.name).join(", ") || "ninguno"}
- Distribución geográfica de los estudios: ${formatGeoDistribution(diagnosis)}

Idioma de salida de las preguntas: ${langName}.`,
    actions: `1. Parte SOLO de los campos del usuario. Si alguno está sin definir, no lo inventes como dato: formula la pregunta con lo definido y refleja la carencia bajando la calificación de "delimitation".
2. Entrega 3 propuestas con rutas DISTINTAS entre sí (cada una modifica población, contexto, variable o enfoque), sin inventar rutas artificiales: ${label("A")} = la más viable y conservadora para el nivel; ${label("B")} = intermedia, con una diferenciación clara; ${label("C")} = la más ambiciosa u original que el nivel pueda sostener.
3. Cada pregunta: una sola oración interrogativa, delimitada con población + contexto + variable o relación, y respondible con el tipo de estudio indicado (si no está definido, formúlala de modo que admita el diseño más coherente sin imponerlo).
4. Califica cada propuesta con honestidad usando el panorama real:
   - clarity: verde = foco único e inequívoco; amarillo = ambigüedad menor; rojo = mezcla varios focos o términos vagos.
   - delimitation: verde = población, contexto y variable explícitos; amarillo = falta uno; rojo = faltan dos o más.
   - availableLiterature: verde = el panorama sugiere base suficiente de estudios para sustentarla; amarillo = escasa o dispersa; rojo = la muestra recuperada casi no la respalda.
   - differentiation: verde = la combinación está poco cubierta en el panorama; amarillo = parcialmente cubierta; rojo = muy parecida a lo que ya domina. Si la propuesta fija un país o región, tenlo en cuenta con la distribución geográfica real (un contexto con pocos estudios apoya la diferenciación, pero no es evidencia de que el vacío sea definitivo).
   Si todas las propuestas salen con las mismas calificaciones, la calibración es deficiente: revísala.
5. Antes de responder verifica: las preguntas se derivan de los campos y la evidencia entregados, no de suposiciones, y no mencionas estudios, autores ni cifras que no estén en el contexto.`,
    output: `Responde SOLO con este JSON, un array de exactamente 3 propuestas (preguntas redactadas en ${langName}):
[
  {
    "label": "${label("A")}" | "${label("B")}" | "${label("C")}",
    "question": string (pregunta de investigación completa en ${langName}, delimitada con población/contexto/variable),
    "ratings": {
      "clarity": "verde"|"amarillo"|"rojo",
      "delimitation": "verde"|"amarillo"|"rojo",
      "availableLiterature": "verde"|"amarillo"|"rojo",
      "differentiation": "verde"|"amarillo"|"rojo"
    }
  }
]`,
  });

  const result = asArray<Omit<ResearchQuestionProposal, "id">>(
    await generateJSON<unknown>(prompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION),
  );
  return result.map((p, i) => ({ ...p, id: `prop-${String.fromCharCode(97 + i)}` }));
}
