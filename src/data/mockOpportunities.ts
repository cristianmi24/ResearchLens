import type { DelimitationOption, Opportunity } from "@/types/topic";

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-001",
    badge: "poco_explorado",
    badgeLabel: "Poco explorado",
    dimension: "contexto",
    title: "Contexto geográfico",
    description:
      "Encontramos menor concentración de estudios en Latinoamérica. La mayoría de la literatura consultada proviene de instituciones de Estados Unidos, Europa y Asia.",
  },
  {
    id: "opp-002",
    badge: "parcialmente_explorado",
    badgeLabel: "Parcialmente explorado",
    dimension: "poblacion",
    title: "Población",
    description:
      "Existe investigación en estudiantes universitarios en general, pero se identificó menor evidencia enfocada específicamente en estudiantes de primer semestre.",
  },
  {
    id: "opp-003",
    badge: "diferenciacion_potencial",
    badgeLabel: "Diferenciación potencial",
    dimension: "variable",
    title: "Variable",
    description:
      "La mayoría de las investigaciones analizadas estudian rendimiento académico o motivación, mientras que tu idea plantea estudiar autorregulación del aprendizaje.",
  },
  {
    id: "opp-004",
    badge: "parcialmente_explorado",
    badgeLabel: "Parcialmente explorado",
    dimension: "metodologia",
    title: "Metodología",
    description:
      "Predominan los estudios cuasi-experimentales y de encuesta. Se identificaron pocos diseños experimentales controlados que aíslen el efecto específico de la IA generativa.",
  },
];

export const mockDelimitationOptions: DelimitationOption[] = [
  {
    id: "delim-001",
    optionLabel: "Opción 1 · Cambiar población",
    changeType: "poblacion",
    suggestion: "Estudiantes universitarios de primer semestre.",
  },
  {
    id: "delim-002",
    optionLabel: "Opción 2 · Cambiar variable",
    changeType: "variable",
    suggestion: "Autorregulación del aprendizaje en lugar de rendimiento general.",
  },
  {
    id: "delim-003",
    optionLabel: "Opción 3 · Cambiar contexto",
    changeType: "contexto",
    suggestion: "Instituciones de educación superior en Colombia.",
  },
];
