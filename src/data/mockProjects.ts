import type { Project } from "@/types/project";
import { mockDiagnosis } from "./mockAnalysis";
import { mockArticles } from "./mockArticles";
import { mockOpportunities } from "./mockOpportunities";
import { mockProposals } from "./mockAnalysis";

export const mockProjects: Project[] = [
  {
    id: "proj-001",
    title: "IA generativa y aprendizaje de programación",
    originalIdea: mockDiagnosis.originalIdea,
    createdAt: "2026-08-10T14:20:00.000Z",
    lastAnalyzedAt: "2026-08-25T09:00:00.000Z",
    diagnosis: mockDiagnosis,
    savedArticles: [mockArticles[0], mockArticles[2], mockArticles[4]],
    opportunities: mockOpportunities,
    currentQuestion: mockProposals[1].question,
    proposals: mockProposals,
    history: [
      { id: "h1", label: "Idea inicial", date: "2026-08-10T14:20:00.000Z", description: "Se registró la idea en lenguaje natural." },
      { id: "h2", label: "Primera búsqueda", date: "2026-08-10T14:23:00.000Z", description: "Se consultaron 5 fuentes científicas y se encontraron 1,284 estudios relacionados." },
      { id: "h3", label: "Nueva delimitación", date: "2026-08-18T11:05:00.000Z", description: "Se exploró la opción de cambiar la variable a autorregulación del aprendizaje." },
      { id: "h4", label: "Pregunta refinada", date: "2026-08-25T09:00:00.000Z", description: "Se seleccionó la Propuesta B como pregunta de investigación actual." },
    ],
  },
  {
    id: "proj-002",
    title: "Learning analytics para detección temprana de deserción",
    originalIdea:
      "Quiero ver si los datos de uso de la plataforma virtual pueden predecir qué estudiantes van a abandonar la materia.",
    createdAt: "2026-07-02T10:00:00.000Z",
    lastAnalyzedAt: "2026-07-15T16:40:00.000Z",
    diagnosis: {
      ...mockDiagnosis,
      id: "diag-002",
      originalIdea:
        "Quiero ver si los datos de uso de la plataforma virtual pueden predecir qué estudiantes van a abandonar la materia.",
      refinedQuestionPreview:
        "¿Pueden los datos de interacción en un LMS predecir el riesgo de deserción estudiantil?",
      exploration: {
        level: "alto",
        label: "Muy explorado",
        explanation:
          "El uso de learning analytics para predecir deserción es un campo consolidado, con numerosos modelos ya validados en distintos contextos.",
        scoreOutOf10: 8,
      },
      indicators: {
        relatedStudiesCount: 2103,
        averageSimilarityLabel: "Alta",
        trend: "estable",
        differentiationLabel: "Baja",
      },
    },
    savedArticles: [mockArticles[3]],
    opportunities: [mockOpportunities[0]],
    currentQuestion: null,
    proposals: [],
    history: [
      { id: "h1", label: "Idea inicial", date: "2026-07-02T10:00:00.000Z", description: "Se registró la idea en lenguaje natural." },
      { id: "h2", label: "Primera búsqueda", date: "2026-07-15T16:40:00.000Z", description: "Se consultaron 5 fuentes científicas y se encontraron 2,103 estudios relacionados." },
    ],
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}
