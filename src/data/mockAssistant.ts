import type { AssistantMessage } from "@/types/assistant";

export const mockAssistantWelcome: AssistantMessage = {
  id: "msg-welcome",
  role: "assistant",
  text: "Hola, soy tu asistente de investigación. Puedo responder preguntas sobre la literatura que encontramos para tu idea, siempre citando las fuentes consultadas. ¿Qué te gustaría saber?",
  createdAt: new Date().toISOString(),
};

export const assistantSuggestedQuestions: string[] = [
  "¿Por qué mi tema aparece como moderadamente explorado?",
  "¿Qué diferencia hay entre estos dos artículos?",
  "¿Cómo puedo hacer mi tema más específico?",
  "¿Qué población está menos estudiada?",
  "¿Qué variables aparecen con mayor frecuencia?",
];

/**
 * Respuestas simuladas ancladas a datos existentes (mockArticles / mockTopics),
 * tal como lo haría el backend real citando solo fuentes recuperadas.
 */
export const mockAssistantResponses: Record<string, Omit<AssistantMessage, "id" | "role" | "createdAt">> = {
  "¿por qué mi tema aparece como moderadamente explorado?": {
    text: "Se encontraron 1,284 estudios relacionados con IA y programación educativa, lo cual indica una base amplia de literatura. Sin embargo, la combinación específica de tu población (universitarios), tu intervención (IA generativa) y tu contexto (Colombia) tiene menor concentración de estudios, por eso el nivel se clasifica como moderado y no alto.",
    citations: [
      { articleId: "art-001", title: "Generative AI in Programming Education: A Systematic Review", doi: "10.1145/3597503.2025.0142" },
      { articleId: "art-005", title: "Self-Regulated Learning and AI Co-Pilots: Evidence from Latin American Universities", doi: "10.5281/zenodo.10592837" },
    ],
  },
  "¿qué población está menos estudiada?": {
    text: "Según las fuentes consultadas, los estudiantes universitarios de primer semestre están menos representados que la población universitaria en general. Solo se identificó evidencia parcial en este segmento.",
    citations: [
      { articleId: "art-007", title: "First-Semester Students and AI Anxiety in Programming Courses", doi: "10.5555/openalex.2024.77120" },
    ],
  },
  "¿qué variables aparecen con mayor frecuencia?": {
    text: "Rendimiento académico, motivación y calidad del feedback son las variables de resultado más frecuentes en la literatura consultada. La autorregulación del aprendizaje aparece con mucha menor frecuencia, lo que podría representar una oportunidad de diferenciación.",
    citations: [
      { articleId: "art-002", title: "ChatGPT as a Tutor: Motivation and Engagement in Intro CS Courses", doi: "10.5555/openalex.2024.88231" },
      { articleId: "art-003", title: "Automated Feedback Generation for Programming Assignments Using Large Language Models", doi: "10.48550/arXiv.2501.09284" },
    ],
  },
  "¿cómo puedo hacer mi tema más específico?": {
    text: "Con base en los patrones encontrados en la literatura, podrías delimitar tu idea cambiando la población a estudiantes de primer semestre, cambiando la variable de resultado a autorregulación del aprendizaje, o acotando el contexto geográfico a instituciones colombianas. Puedes explorar estas opciones en la sección Oportunidades.",
  },
};

export const mockAssistantFallback: Omit<AssistantMessage, "id" | "role" | "createdAt"> = {
  text: "No encontré información suficiente en las fuentes ya recuperadas para responder con precisión. Te sugiero reformular la pregunta o ejecutar una nueva búsqueda desde la sección Explorar literatura.",
};
