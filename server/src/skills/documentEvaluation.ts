import type { Skill } from "./types.js";

/** Tipo de documento que se evalúa. */
export type DocumentType = "tesis" | "articulo";

export interface EvaluationCriterion {
  id: string;
  name: string;
  /** Qué debe revisar el evaluador para calificar este criterio. */
  checks: string;
  /** Peso relativo en la nota global (suman 100 por tipo de documento). */
  weight: number;
}

// ── Tesis / trabajo de grado ────────────────────────────────────────────────────────────────────────────

export const THESIS_SECTIONS = [
  "Resumen y palabras clave",
  "Abstract (resumen en inglés)",
  "Introducción",
  "Planteamiento del problema y pregunta de investigación",
  "Justificación",
  "Objetivos (general y específicos)",
  "Marco teórico / referencial y antecedentes (estado del arte)",
  "Metodología",
  "Resultados",
  "Discusión",
  "Conclusiones",
  "Referencias",
];

export const THESIS_CRITERIA: EvaluationCriterion[] = [
  {
    id: "estructura",
    name: "Organización y estructura",
    weight: 10,
    checks:
      "Están las secciones esperadas en un orden lógico; las ausentes se justifican por el tipo de estudio (p. ej., una monografía puede no tener resultados empíricos). Proporción razonable entre capítulos.",
  },
  {
    id: "problema",
    name: "Problema, pregunta y justificación",
    weight: 15,
    checks:
      "El problema se describe con evidencia (cifras o estudios), se delimita (población, contexto, tiempo) y termina en una pregunta clara. La justificación dice por qué importa y para quién, sin repetir el problema.",
  },
  {
    id: "objetivos",
    name: "Objetivos",
    weight: 10,
    checks:
      "Un objetivo general que responde a la pregunta; específicos con verbos en infinitivo observables (identificar, analizar, comparar…; no 'conocer' ni 'entender'), que en conjunto alcanzan el general y que se pueden cumplir con el método.",
  },
  {
    id: "marco",
    name: "Marco teórico y estado del arte",
    weight: 15,
    checks:
      "Profundidad acorde al nivel: definiciones con fuentes, teorías contrastadas (maestría/doctorado), antecedentes que sintetizan y no solo resumen uno tras otro, y relación explícita con el problema.",
  },
  {
    id: "metodologia",
    name: "Metodología",
    weight: 20,
    checks:
      "Enfoque y diseño coherentes con la pregunta; población y muestra con criterio; instrumentos con validez/confiabilidad o criterios de rigor cualitativo; procedimiento replicable; plan de análisis; consideraciones éticas.",
  },
  {
    id: "resultados",
    name: "Resultados y discusión",
    weight: 15,
    checks:
      "Resultados organizados por objetivo; tablas y figuras numeradas y explicadas; la discusión contrasta los hallazgos con los antecedentes y reconoce limitaciones.",
  },
  {
    id: "conclusiones",
    name: "Conclusiones y coherencia interna",
    weight: 10,
    checks:
      "Las conclusiones responden a cada objetivo y a la pregunta, se apoyan en los resultados y no generalizan más allá de la muestra. Hilo coherente: problema → pregunta → objetivos → método → resultados → conclusiones.",
  },
  {
    id: "redaccion",
    name: "Redacción académica y normas APA 7",
    weight: 5,
    checks:
      "Registro académico, claridad, párrafos con idea central; citas en el texto autor-fecha y lista de referencias en APA 7 (usa los hallazgos automáticos de APA que se entregan como evidencia).",
  },
];

// ── Artículo de revista ─────────────────────────────────────────────────────────────────────────────────

export const ARTICLE_SECTIONS = [
  "Título",
  "Resumen / Abstract",
  "Palabras clave",
  "Introducción",
  "Método / Materiales y métodos",
  "Resultados",
  "Discusión",
  "Conclusiones",
  "Referencias",
];

export const ARTICLE_CRITERIA: EvaluationCriterion[] = [
  {
    id: "titulo-resumen",
    name: "Título, resumen y palabras clave",
    weight: 15,
    checks:
      "Título conciso e informativo. Resumen autocontenido que declara objetivo, método, resultados principales y conclusión (orientativo 150–300 palabras). Palabras clave pertinentes.",
  },
  {
    id: "introduccion",
    name: "Introducción",
    weight: 15,
    checks: "Contextualiza con literatura, identifica el vacío y cierra con el objetivo o la pregunta del estudio.",
  },
  {
    id: "metodo",
    name: "Método",
    weight: 20,
    checks:
      "Suficiente para replicar: diseño, participantes o corpus, instrumentos, procedimiento y análisis; ética cuando hay personas.",
  },
  {
    id: "resultados",
    name: "Resultados",
    weight: 15,
    checks: "Presentados sin interpretar, en orden lógico, con tablas y figuras pertinentes y coherentes con el método.",
  },
  {
    id: "discusion",
    name: "Discusión y conclusiones",
    weight: 20,
    checks:
      "Interpreta los resultados frente a la literatura citada, señala limitaciones y futuras líneas; las conclusiones no exceden lo que muestran los datos.",
  },
  {
    id: "referencias",
    name: "Referencias",
    weight: 15,
    checks:
      "Actualidad y pertinencia; consistencia interna del estilo elegido (cada revista define el suyo, así que NO se exige APA); verificabilidad según la comprobación automática de referencias.",
  },
];

function criteriaBlock(criteria: EvaluationCriterion[]): string {
  return criteria.map((c) => `- "${c.id}" — ${c.name} (peso ${c.weight}): ${c.checks}`).join("\n");
}

export const thesisEvaluationSkill: Skill = {
  id: "thesis-evaluation",
  name: "Evaluador de tesis y trabajos de grado",
  description:
    "Evalúa un trabajo de grado, tesis de maestría o tesis doctoral con criterios ajustados al nivel: estructura, coherencia interna, rigor metodológico y normas APA 7.",
  version: "1.1.0",
  instructions: `Actúas como jurado evaluador de trabajos de grado y tesis. Combinas dos miradas:
- la del investigador JUNIOR, que verifica con una lista de chequeo que esté todo lo formal (secciones, objetivos bien
  redactados, citas, referencias), y
- la del investigador SENIOR, que juzga el fondo: si el problema está bien argumentado, si el método responde la pregunta,
  si la discusión dialoga con la literatura y si el aporte corresponde al nivel.

Secciones esperadas en una tesis (pueden variar con el tipo de estudio):
${THESIS_SECTIONS.map((s) => `- ${s}`).join("\n")}

Criterios de evaluación (califica cada uno de 0 a 4):
${criteriaBlock(THESIS_CRITERIA)}

Escala: 4 = cumple plenamente para el nivel; 3 = cumple con ajustes menores; 2 = cumple parcialmente, requiere ajustes
importantes; 1 = muy débil; 0 = ausente.

Normas: las tesis se evalúan con APA 7.ª edición. Se te entregan hallazgos automáticos sobre citas y referencias (formato,
citas sin referencia, referencias no citadas, DOI). Úsalos como evidencia; no inventes errores de formato que no puedas
ver en el texto (el texto extraído pierde sangrías, cursivas y numeración de páginas: no las juzgues).

Reglas:
1) Ajusta la exigencia al perfil del nivel que se te entrega.
2) Cita evidencia concreta del documento en cada criterio (una frase corta o la sección donde está el problema).
3) Cada recomendación debe ser accionable: qué cambiar y dónde.
4) Solo ves fragmentos de cada sección: si algo no aparece en los fragmentos, dilo como "no se evidencia en lo revisado",
   no como "no existe".
5) No atribuyas a APA lo que no es de APA: la redacción de objetivos, la estructura de capítulos o el diseño metodológico
   son criterios metodológicos o institucionales; APA 7 regula citas, referencias, tablas, figuras y estilo.`,
};

export const articleEvaluationSkill: Skill = {
  id: "article-evaluation",
  name: "Evaluador de artículos científicos",
  description:
    "Revisa un artículo de revista como par evaluador: estructura IMRyD, calidad del resumen, coherencia y verificabilidad de las referencias. No exige un estilo de citación porque cada revista define el suyo.",
  version: "1.0.0",
  instructions: `Actúas como par evaluador (peer reviewer) de una revista científica indexada.

Estructura esperada (IMRyD y elementos de cabecera):
${ARTICLE_SECTIONS.map((s) => `- ${s}`).join("\n")}

Criterios de evaluación (califica cada uno de 0 a 4):
${criteriaBlock(ARTICLE_CRITERIA)}

Escala: 4 = listo para publicar en ese aspecto; 3 = cambios menores; 2 = cambios mayores; 1 = muy débil; 0 = ausente.

Reglas:
1) NO apliques APA ni otra norma de citación: cada revista tiene la suya. Evalúa solo que las referencias sean
   consistentes entre sí, actuales, pertinentes y verificables (se te entrega la comprobación automática).
2) Cita evidencia concreta del artículo en cada criterio.
3) Las recomendaciones deben ser las que daría un revisor: concretas y priorizadas.
4) Solo ves fragmentos de cada sección: si algo no aparece, dilo como "no se evidencia en lo revisado".`,
};

export function criteriaFor(type: DocumentType): EvaluationCriterion[] {
  return type === "tesis" ? THESIS_CRITERIA : ARTICLE_CRITERIA;
}
