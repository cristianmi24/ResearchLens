import type { Topic } from "@/types/topic";

function timeline(base: number, growth: number): { year: number; publications: number }[] {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  return years.map((year, i) => ({
    year,
    publications: Math.round(base * Math.pow(growth, i)),
  }));
}

export const mockTopics: Topic[] = [
  {
    id: "topic-ia-generativa",
    name: "IA generativa",
    studiesCount: 612,
    concentration: "alta",
    trend: "creciente",
    topAuthors: ["J. Smith", "Y. Chen", "A. Petrov"],
    topYears: [2024, 2025],
    relatedArticleIds: ["art-001", "art-003", "art-006"],
    timeline: timeline(28, 1.55),
    x: 50,
    y: 42,
  },
  {
    id: "topic-tutor-inteligente",
    name: "Tutor inteligente",
    studiesCount: 298,
    concentration: "media",
    trend: "creciente",
    topAuthors: ["A. Petrov", "H. Yamamoto", "D. Silva"],
    topYears: [2023, 2024],
    relatedArticleIds: ["art-002", "art-006"],
    timeline: timeline(22, 1.32),
    x: 28,
    y: 25,
  },
  {
    id: "topic-programacion",
    name: "Programación",
    studiesCount: 1284,
    concentration: "alta",
    trend: "creciente",
    topAuthors: ["J. Smith", "S. Kowalski", "R. Costa"],
    topYears: [2024, 2025],
    relatedArticleIds: ["art-001", "art-002", "art-003", "art-004", "art-007", "art-008"],
    timeline: timeline(64, 1.4),
    x: 50,
    y: 62,
  },
  {
    id: "topic-feedback-automatico",
    name: "Feedback automático",
    studiesCount: 187,
    concentration: "media",
    trend: "creciente",
    topAuthors: ["Y. Chen", "P. Gupta", "R. Costa"],
    topYears: [2024, 2025],
    relatedArticleIds: ["art-003", "art-008"],
    timeline: timeline(12, 1.5),
    x: 72,
    y: 30,
  },
  {
    id: "topic-evaluacion",
    name: "Evaluación",
    studiesCount: 421,
    concentration: "alta",
    trend: "estable",
    topAuthors: ["S. Kowalski", "T. Nguyen", "P. Gupta"],
    topYears: [2021, 2022, 2023],
    relatedArticleIds: ["art-003", "art-004"],
    timeline: timeline(58, 1.05),
    x: 72,
    y: 68,
  },
  {
    id: "topic-personalizacion",
    name: "Personalización",
    studiesCount: 94,
    concentration: "baja",
    trend: "creciente",
    topAuthors: ["R. Costa", "E. Blackwood"],
    topYears: [2025],
    relatedArticleIds: ["art-008"],
    timeline: timeline(6, 1.48),
    x: 22,
    y: 72,
  },
  {
    id: "topic-learning-analytics",
    name: "Learning Analytics",
    studiesCount: 356,
    concentration: "media",
    trend: "estable",
    topAuthors: ["S. Kowalski", "T. Nguyen"],
    topYears: [2022, 2023],
    relatedArticleIds: ["art-004"],
    timeline: timeline(48, 1.1),
    x: 32,
    y: 50,
  },
  {
    id: "topic-autorregulacion",
    name: "Autorregulación",
    studiesCount: 61,
    concentration: "baja",
    trend: "creciente",
    topAuthors: ["C. Duarte", "V. Herrera"],
    topYears: [2025],
    relatedArticleIds: ["art-005"],
    timeline: timeline(4, 1.6),
    x: 78,
    y: 48,
  },
];

export function getTopicById(id: string): Topic | undefined {
  return mockTopics.find((t) => t.id === id);
}

/** Serie combinada usada en el gráfico de tendencia de la pantalla de resultados */
export const overallTrendTimeline = timeline(96, 1.32);
