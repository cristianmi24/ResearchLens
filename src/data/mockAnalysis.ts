import type { AnalysisStep, ResearchDiagnosis, ResearchQuestionProposal, SourceConsultation } from "@/types/research";

export const mockDiagnosis: ResearchDiagnosis = {
  id: "diag-001",
  academicLevel: "pregrado",
  originalIdea:
    "Quiero investigar cómo la inteligencia artificial puede ayudar a los estudiantes a aprender programación.",
  refinedQuestionPreview:
    "¿Cómo puede la inteligencia artificial mejorar el aprendizaje de programación?",
  exploration: {
    level: "moderado",
    label: "Moderadamente explorado",
    explanation:
      "Existe una cantidad considerable de investigaciones sobre IA y educación. Sin embargo, la combinación exacta de población, contexto y variables de tu propuesta presenta menor concentración de estudios.",
    scoreOutOf10: 6,
  },
  indicators: {
    relatedStudiesCount: 1284,
    averageSimilarityLabel: "Media-Alta",
    trend: "creciente",
    differentiationLabel: "Moderada",
  },
  relatedConcepts: [
    "IA generativa",
    "Educación superior",
    "Programación",
    "Feedback automático",
    "Aprendizaje adaptativo",
    "Learning Analytics",
  ],
  disclaimer: "Estimaciones basadas en las fuentes consultadas.",
  analyzedAt: new Date().toISOString(),
};

export const mockAnalysisSteps: AnalysisStep[] = [
  { key: "understand", label: "Comprendiendo la idea", status: "done" },
  { key: "concepts", label: "Identificando conceptos", status: "done" },
  { key: "search", label: "Buscando literatura", status: "active" },
  { key: "similarity", label: "Analizando similitud", status: "pending" },
  { key: "opportunities", label: "Identificando oportunidades", status: "pending" },
];

export const mockSources: SourceConsultation[] = [
  { name: "OpenAlex", consulted: true, resultsCount: 512, consultedAt: new Date().toISOString() },
  { name: "Crossref", consulted: true, resultsCount: 388, consultedAt: new Date().toISOString() },
  { name: "Semantic Scholar", consulted: true, resultsCount: 244, consultedAt: new Date().toISOString() },
  { name: "arXiv", consulted: true, resultsCount: 96, consultedAt: new Date().toISOString() },
  { name: "DOAJ / Open Access", consulted: true, resultsCount: 44, consultedAt: new Date().toISOString() },
];

export const mockProposals: ResearchQuestionProposal[] = [
  {
    id: "prop-a",
    label: "Propuesta A",
    question:
      "¿Cómo influye la retroalimentación generada mediante IA generativa en el desempeño de estudiantes universitarios durante cursos introductorios de programación?",
    ratings: { clarity: "verde", delimitation: "verde", availableLiterature: "verde", differentiation: "amarillo" },
  },
  {
    id: "prop-b",
    label: "Propuesta B",
    question:
      "¿Qué efecto tiene el uso de asistentes de código basados en IA generativa sobre la autorregulación del aprendizaje en estudiantes de primer semestre de programación en Colombia?",
    ratings: { clarity: "verde", delimitation: "verde", availableLiterature: "amarillo", differentiation: "verde" },
  },
  {
    id: "prop-c",
    label: "Propuesta C",
    question:
      "¿En qué medida la incorporación de herramientas de IA generativa en cursos de programación influye en la motivación y el rendimiento de estudiantes universitarios en instituciones colombianas?",
    ratings: { clarity: "verde", delimitation: "amarillo", availableLiterature: "verde", differentiation: "amarillo" },
  },
];
