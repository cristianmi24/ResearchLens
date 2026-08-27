import type { Article } from "@/types/article";

export const mockArticles: Article[] = [
  {
    id: "art-001",
    title: "Generative AI in Programming Education: A Systematic Review",
    authors: ["J. Smith", "A. Rodriguez", "K. Lee"],
    year: 2025,
    source: "Semantic Scholar",
    doi: "10.1145/3597503.2025.0142",
    abstract:
      "This systematic review examines 84 studies published between 2022 and 2025 that explore the use of generative AI tools (ChatGPT, Copilot, Codex) to support novice programmers. Findings suggest consistent gains in code comprehension and debugging speed, with mixed evidence on long-term retention of programming concepts.",
    mainConcepts: ["IA generativa", "Programación", "Educación superior", "Revisión sistemática"],
    similarityPercent: 87,
    similarityReason: "Coincide contigo en IA + programación + educación superior.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes universitarios", match: "coincide" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Estados Unidos", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "ChatGPT / Copilot", match: "parcial" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Comprensión de código", match: "parcial" },
    ],
  },
  {
    id: "art-002",
    title: "ChatGPT as a Tutor: Motivation and Engagement in Intro CS Courses",
    authors: ["M. Fernández", "R. Osei"],
    year: 2024,
    source: "OpenAlex",
    doi: "10.5555/openalex.2024.88231",
    abstract:
      "A quasi-experimental study with 210 first-year computer science students investigating whether conversational AI tutoring increases motivation and self-reported engagement compared to traditional office-hour support. Results show significant motivation gains but no significant change in final grades.",
    mainConcepts: ["ChatGPT", "Motivación", "Tutoría", "Educación superior"],
    similarityPercent: 74,
    similarityReason: "Comparte la variable IA conversacional y el contexto universitario, pero mide motivación en lugar de rendimiento.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes de primer año", match: "parcial" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Ghana / Estados Unidos", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "ChatGPT", match: "coincide" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Motivación", match: "diferente" },
    ],
  },
  {
    id: "art-003",
    title: "Automated Feedback Generation for Programming Assignments Using Large Language Models",
    authors: ["Y. Chen", "P. Gupta", "L. Novak"],
    year: 2025,
    source: "arXiv",
    doi: "10.48550/arXiv.2501.09284",
    abstract:
      "We propose a pipeline that uses LLMs to generate personalized, formative feedback on student code submissions in real time. Evaluated across three universities, the system reduced instructor grading time by 42% while maintaining feedback quality comparable to human tutors.",
    mainConcepts: ["Feedback automático", "LLM", "Programación", "Evaluación"],
    similarityPercent: 81,
    similarityReason: "Coincide en el uso de modelos de lenguaje aplicados a la enseñanza de programación.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes universitarios", match: "coincide" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Multi-país (EE.UU., India, Polonia)", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "LLM para feedback automático", match: "parcial" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Tiempo de calificación / calidad de feedback", match: "diferente" },
    ],
  },
  {
    id: "art-004",
    title: "Adaptive Learning Paths in CS1: A Learning Analytics Approach",
    authors: ["S. Kowalski", "T. Nguyen"],
    year: 2023,
    source: "Crossref",
    doi: "10.1016/j.compedu.2023.104711",
    abstract:
      "This paper presents a learning analytics system that dynamically adjusts exercise difficulty in introductory programming courses based on real-time performance data. The study, conducted with 340 students, found improved completion rates but did not isolate the effect of generative AI specifically.",
    mainConcepts: ["Learning Analytics", "Aprendizaje adaptativo", "Programación"],
    similarityPercent: 63,
    similarityReason: "Comparte el enfoque de personalización del aprendizaje en programación, sin enfocarse en IA generativa.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes universitarios", match: "coincide" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Polonia", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "Analítica de aprendizaje adaptativa (reglas)", match: "diferente" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Tasa de finalización de ejercicios", match: "parcial" },
    ],
  },
  {
    id: "art-005",
    title: "Self-Regulated Learning and AI Co-Pilots: Evidence from Latin American Universities",
    authors: ["C. Duarte", "V. Herrera"],
    year: 2025,
    source: "DOAJ",
    doi: "10.5281/zenodo.10592837",
    abstract:
      "Exploratory mixed-methods study with 96 undergraduate students across two Colombian universities examining how AI coding assistants influence self-regulated learning strategies. Preliminary findings suggest AI reliance can reduce planning behaviors unless scaffolded with reflection prompts.",
    mainConcepts: ["Autorregulación", "IA generativa", "Educación superior", "Latinoamérica"],
    similarityPercent: 69,
    similarityReason: "Coincide en contexto colombiano e IA generativa, pero mide autorregulación en vez de rendimiento.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes de pregrado", match: "coincide" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Colombia", match: "coincide" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "Asistentes de código con IA", match: "coincide" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Autorregulación del aprendizaje", match: "diferente" },
    ],
  },
  {
    id: "art-006",
    title: "Intelligent Tutoring Systems for Programming: A Decade in Review (2015-2025)",
    authors: ["A. Petrov", "H. Yamamoto", "D. Silva"],
    year: 2025,
    source: "Semantic Scholar",
    doi: "10.1145/3627812.2025.0091",
    abstract:
      "A bibliometric and narrative review of intelligent tutoring systems (ITS) applied to programming education, tracing the shift from rule-based tutors to LLM-backed tutors. Identifies a growing but geographically concentrated body of research, with limited representation from Latin America and Africa.",
    mainConcepts: ["Tutor inteligente", "Programación", "Bibliometría", "IA generativa"],
    similarityPercent: 58,
    similarityReason: "Contextualiza el campo de tutores inteligentes en programación, con menor foco en tu variable específica.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "No aplica (revisión bibliométrica)", match: "diferente" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Global (predominio EE.UU./Asia)", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "Tutores inteligentes (ITS)", match: "parcial" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "No aplica", match: "diferente" },
    ],
  },
  {
    id: "art-007",
    title: "First-Semester Students and AI Anxiety in Programming Courses",
    authors: ["N. Osei", "B. Klein"],
    year: 2024,
    source: "OpenAlex",
    doi: "10.5555/openalex.2024.77120",
    abstract:
      "Survey-based study (n=158) examining anxiety and trust levels among first-semester students when using AI coding tools for the first time. Found that students with lower prior programming exposure reported significantly higher AI-related anxiety, moderated by instructor framing.",
    mainConcepts: ["Ansiedad tecnológica", "Programación", "Primer semestre", "IA generativa"],
    similarityPercent: 55,
    similarityReason: "Coincide en población de primer semestre e IA generativa, pero mide ansiedad, no rendimiento.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes de primer semestre", match: "parcial" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Alemania", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "Herramientas de código con IA", match: "coincide" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Ansiedad y confianza tecnológica", match: "diferente" },
    ],
  },
  {
    id: "art-008",
    title: "Personalized Code Review Feedback via Fine-Tuned LLMs",
    authors: ["R. Costa", "E. Blackwood"],
    year: 2023,
    source: "arXiv",
    doi: "10.48550/arXiv.2309.04521",
    abstract:
      "Presents a fine-tuned LLM pipeline for generating personalized code review comments aligned to individual student skill levels, evaluated in a single-institution pilot with 45 students. Early results are promising but underpowered for generalization.",
    mainConcepts: ["Feedback automático", "Personalización", "LLM", "Programación"],
    similarityPercent: 49,
    similarityReason: "Comparte la técnica de LLM aplicada al código, pero con muestra pequeña y enfoque distinto al tuyo.",
    comparison: [
      { label: "Población", ideaValue: "Estudiantes universitarios", articleValue: "Estudiantes universitarios (n=45)", match: "coincide" },
      { label: "Contexto", ideaValue: "Colombia", articleValue: "Portugal", match: "diferente" },
      { label: "Intervención", ideaValue: "IA generativa", articleValue: "LLM afinado para revisión de código", match: "parcial" },
      { label: "Resultado", ideaValue: "Rendimiento académico", articleValue: "Calidad percibida del feedback", match: "diferente" },
    ],
  },
];

export function getArticleById(id: string): Article | undefined {
  return mockArticles.find((a) => a.id === id);
}
