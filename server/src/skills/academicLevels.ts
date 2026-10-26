import type { AcademicLevel } from "../types.js";
import type { Skill } from "./types.js";

/**
 * Perfil de exigencia por nivel académico, revisado con criterio de asesor (junior + senior).
 *
 * Correcciones frente a la versión anterior:
 *  - Maestría ya no exige "comparación entre grupos o métodos mixtos": no es un requisito del nivel. Un estudio
 *    cualitativo de un solo caso bien justificado es válido. Lo que sí se exige es brecha argumentada, discusión
 *    crítica de la teoría y rigor metodológico justificado.
 *  - Se distingue maestría de investigación y de profundización (aplicada), como en el sistema colombiano.
 *  - Cada nivel declara tipo de pregunta, marco teórico, literatura, método, aporte y viabilidad, en vez de una
 *    sola frase. Las cifras de referencias y duración son ORIENTATIVAS: el modelo no debe tratarlas como reglas.
 */
interface LevelProfile {
  label: string;
  scope: string;
  questionTypes: string;
  theory: string;
  literature: string;
  methodology: string;
  contribution: string;
  viability: string;
  redFlags: string;
}

const PROFILES: Record<AcademicLevel, LevelProfile> = {
  pregrado: {
    label: "PREGRADO (trabajo de grado)",
    scope: "Problema delimitado y viable, con un aporte claro aunque sea local o aplicado.",
    questionTypes:
      "Exploratorias, descriptivas, correlacionales o de diseño/aplicación de una propuesta. Solo se aceptan afirmaciones causales si el diseño las sostiene (grupo control, pre/post con comparación).",
    theory: "Conceptos clave definidos con fuentes y uno o dos referentes teóricos usados con coherencia; antecedentes organizados.",
    literature: "Orientativo: 20 a 40 fuentes, en su mayoría de los últimos 5 a 10 años, con presencia de artículos de revista y no solo páginas web.",
    methodology:
      "Diseño sencillo y manejable; instrumentos validados o adaptados con prueba piloto; muestra accesible (por conveniencia es aceptable si se reconoce como limitación); consentimiento informado cuando hay personas.",
    contribution: "Diagnóstico, caracterización, propuesta, aplicación o réplica contextual bien ejecutada.",
    viability: "Orientativo: 1 a 2 semestres, sin infraestructura avanzada ni muestras de difícil acceso.",
    redFlags: "Problema excesivamente amplio, objetivos que no se pueden cumplir en el tiempo, conclusiones que generalizan más allá de la muestra.",
  },
  maestria: {
    label: "MAESTRÍA (investigación o profundización)",
    scope:
      "Brecha claramente argumentada a partir de la literatura. En maestría de investigación el aporte es de conocimiento; en maestría de profundización puede centrarse en resolver un problema del contexto profesional con fundamento.",
    questionTypes:
      "Correlacionales, comparativas, explicativas acotadas, evaluativas de una intervención o cualitativas interpretativas; el diseño elegido debe justificarse frente a alternativas. La comparación entre grupos o los métodos mixtos NO son obligatorios.",
    theory: "Discusión crítica de teorías (no solo definiciones): contrasta enfoques y toma posición; estado del arte que sintetiza, compara y detecta contradicciones.",
    literature: "Orientativo: 40 a 80 fuentes, combinando estudios seminales y recientes, internacionales y regionales, mayoritariamente revisadas por pares.",
    methodology:
      "Diseño justificado; validez y confiabilidad de instrumentos (o criterios de rigor cualitativo: credibilidad, transferibilidad, dependencia); muestreo justificado; plan de análisis explícito; consideraciones éticas.",
    contribution: "Contextual, metodológica o conceptual, superior a una replicación descriptiva sin aporte.",
    viability: "Orientativo: 2 a 4 semestres.",
    redFlags: "Marco teórico solo descriptivo, brecha afirmada sin sustento, método elegido sin justificar, discusión que no dialoga con la literatura.",
  },
  doctorado: {
    label: "DOCTORADO (tesis doctoral)",
    scope: "Contribución original y transferible más allá del contexto local, con una posición teórica explícita.",
    questionTypes:
      "Explicativas, de mecanismo, de construcción o refinamiento de teoría o modelos; diseños longitudinales, comparativos, multimétodo o experimentales robustos.",
    theory: "Dialoga con los debates actuales del campo, resuelve o reinterpreta contradicciones y propone o refina un modelo conceptual.",
    literature: "Revisión exhaustiva o sistemática con criterios explícitos de búsqueda y selección; orientativo: más de 100 fuentes.",
    methodology: "Triangulación, control de amenazas a la validez, replicabilidad, ética completa y análisis avanzado coherente con la pregunta.",
    contribution: "Aporte publicable en revistas indexadas; decir solo que \"no se ha estudiado en esta universidad\" NO es suficiente.",
    viability: "Orientativo: 3 a 5 años.",
    redFlags: "Originalidad solo contextual, ausencia de posición teórica, revisión de literatura no sistemática, conclusiones sin transferibilidad.",
  },
};

function profileOf(level: AcademicLevel | undefined): LevelProfile {
  return PROFILES[level ?? "pregrado"] ?? PROFILES.pregrado;
}

/** Versión compacta para los prompts del análisis de ideas (cabe en pocas líneas y cuesta pocos tokens). */
export function levelGuidance(level: AcademicLevel | undefined): string {
  const p = profileOf(level);
  return `${p.label}: ${p.scope} Preguntas esperadas: ${p.questionTypes} Aporte: ${p.contribution} Viabilidad: ${p.viability}`;
}

/** Perfil completo, para evaluar documentos con todos los criterios del nivel. */
export function levelRubric(level: AcademicLevel | undefined): string {
  const p = profileOf(level);
  return `${p.label}
- Alcance: ${p.scope}
- Tipo de pregunta: ${p.questionTypes}
- Marco teórico: ${p.theory}
- Literatura: ${p.literature}
- Metodología: ${p.methodology}
- Aporte esperado: ${p.contribution}
- Viabilidad: ${p.viability}
- Señales de alerta: ${p.redFlags}`;
}

export const academicLevelsSkill: Skill = {
  id: "academic-levels",
  name: "Perfiles de exigencia por nivel académico",
  description: "Qué se espera de un trabajo de pregrado, una tesis de maestría y una tesis doctoral, dimensión por dimensión.",
  version: "2.0.0",
  instructions: (["pregrado", "maestria", "doctorado"] as AcademicLevel[]).map(levelRubric).join("\n\n"),
};
