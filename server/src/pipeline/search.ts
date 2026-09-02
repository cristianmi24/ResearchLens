import * as openAlex from "../lib/openalex.js";
import * as semanticScholar from "../lib/semanticScholar.js";
import * as crossref from "../lib/crossref.js";
import * as arxiv from "../lib/arxiv.js";
import { generateJSON } from "../lib/qwen.js";
import { SENIOR_RESEARCHER_SYSTEM_INSTRUCTION } from "./generative.js";
import type { Article, ResearchArea, ResearchIdeaInput, SourceConsultation } from "../types.js";

const AREAS: ResearchArea[] = [
  "educacion",
  "salud",
  "tecnologia",
  "ciencias_sociales",
  "ciencias_naturales",
  "ingenieria",
  "administracion",
  "otro",
];

export interface IdeaProfile {
  keywords: string[];
  area: ResearchArea;
  relatedConcepts: string[];
  refinedQuestionPreview: string;
}

/** Usa Qwen para convertir la idea en libre texto en términos de búsqueda bibliográfica. */
export async function extractIdeaProfile(input: ResearchIdeaInput): Promise<IdeaProfile> {
  const prompt = `A partir de la siguiente idea de investigación, extrae información útil para buscarla en bases
de datos científicas (OpenAlex, Semantic Scholar, Crossref, arXiv), eligiendo los términos que mejor orienten la
búsqueda hacia literatura realmente pertinente.

Idea original: "${input.rawText}"
Área declarada por el usuario: ${input.area ?? "no especificada"}
Población: ${input.population ?? "no especificada"}
Contexto: ${input.context ?? "no especificado"}
Intervención/variable: ${input.intervention ?? "no especificada"}
Objetivo: ${input.objective ?? "no especificado"}

Responde SOLO con un JSON con esta forma exacta:
{
  "keywords": string[] (3 a 6 términos de búsqueda cortos en inglés, los más efectivos para recuperar literatura relevante),
  "area": uno de ${JSON.stringify(AREAS)},
  "relatedConcepts": string[] (4 a 8 conceptos relacionados, en español, cortos, para mostrar como etiquetas),
  "refinedQuestionPreview": string (una posible pregunta de investigación en español, una sola oración, terminada en "?")
}`;

  const result = await generateJSON<IdeaProfile>(prompt, SENIOR_RESEARCHER_SYSTEM_INSTRUCTION);
  const area = AREAS.includes(result.area) ? result.area : (input.area ?? "otro");
  return {
    keywords: result.keywords?.length ? result.keywords : [input.rawText.slice(0, 60)],
    area,
    relatedConcepts: result.relatedConcepts ?? [],
    refinedQuestionPreview: result.refinedQuestionPreview ?? input.rawText,
  };
}

function normalizeKey(article: Article): string {
  if (article.doi) return `doi:${article.doi.toLowerCase().trim()}`;
  return `title:${article.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`;
}

export interface LiteratureSearchResult {
  articles: Article[];
  sources: SourceConsultation[];
  /** nombre de tema → id de OpenAlex, para poder filtrar conteos reales por tema en vez de por texto libre. */
  topicIds: Map<string, string>;
}

/** Consulta las 4 fuentes en paralelo, tolera fallos individuales y deduplica por DOI/título. */
export async function searchLiterature(keywords: string[]): Promise<LiteratureSearchResult> {
  const query = keywords.join(" ");
  const now = new Date().toISOString();

  const [openAlexResult, s2Result, crossrefResult, arxivResult] = await Promise.allSettled([
    openAlex.searchWorks(query, 20),
    semanticScholar.searchPapers(query, 15),
    crossref.searchWorks(query, 10),
    arxiv.searchEntries(query, 10),
  ]);

  const sources: SourceConsultation[] = [];
  const collected: Article[] = [];
  let topicIds = new Map<string, string>();

  if (openAlexResult.status === "fulfilled") {
    sources.push({ name: "OpenAlex", consulted: true, resultsCount: openAlexResult.value.articles.length, consultedAt: now });
    collected.push(...openAlexResult.value.articles);
    topicIds = openAlexResult.value.topicIds;
  } else {
    console.error("[search] OpenAlex falló:", openAlexResult.reason);
    sources.push({ name: "OpenAlex", consulted: false, resultsCount: 0, consultedAt: now });
  }

  if (s2Result.status === "fulfilled") {
    const { articles, waitedMs, gaveUp } = s2Result.value;
    // Semantic Scholar limita a 1 solicitud/segundo acumulada entre todos sus
    // endpoints; en vez de forzarlo y fallar, se espera lo necesario. Si esa
    // espera fue notoria (o se agotaron los reintentos), se explica al
    // usuario en vez de dejarlo como un simple "consulted:false" sin contexto.
    const note =
      waitedMs >= 1500
        ? gaveUp
          ? `Semantic Scholar limita a 1 solicitud/segundo; se esperó ~${Math.round(waitedMs / 1000)}s y aun así no respondió a tiempo, así que se continuó sin sus resultados.`
          : `Se esperaron ~${Math.round(waitedMs / 1000)}s para respetar el límite de 1 solicitud/segundo de Semantic Scholar.`
        : undefined;
    sources.push({ name: "Semantic Scholar", consulted: !gaveUp, resultsCount: articles.length, consultedAt: now, note });
    collected.push(...articles);
  } else {
    console.error("[search] Semantic Scholar falló:", s2Result.reason);
    sources.push({ name: "Semantic Scholar", consulted: false, resultsCount: 0, consultedAt: now });
  }

  if (arxivResult.status === "fulfilled") {
    const { articles, waitedMs, gaveUp } = arxivResult.value;
    // Misma lógica que Semantic Scholar: arXiv pide no pasar de 1
    // solicitud/3s, así que ante un 429 se espera con backoff en vez de
    // rendirse de inmediato. Se avisa cuándo esa espera fue notoria.
    const note =
      waitedMs >= 3000
        ? gaveUp
          ? `arXiv limita la frecuencia de solicitudes; se esperó ~${Math.round(waitedMs / 1000)}s y aun así no respondió a tiempo, así que se continuó sin sus resultados.`
          : `Se esperaron ~${Math.round(waitedMs / 1000)}s para respetar el límite de solicitudes de arXiv.`
        : undefined;
    sources.push({ name: "arXiv", consulted: !gaveUp, resultsCount: articles.length, consultedAt: now, note });
    collected.push(...articles);
  } else {
    console.error("[search] arXiv falló:", arxivResult.reason);
    sources.push({ name: "arXiv", consulted: false, resultsCount: 0, consultedAt: now });
  }

  if (crossrefResult.status === "fulfilled") {
    sources.push({ name: "Crossref", consulted: true, resultsCount: crossrefResult.value.length, consultedAt: now });
    collected.push(...crossrefResult.value);
  } else {
    console.error("[search] Crossref falló:", crossrefResult.reason);
    sources.push({ name: "Crossref", consulted: false, resultsCount: 0, consultedAt: now });
  }

  const seen = new Map<string, Article>();
  for (const article of collected) {
    if (!article.title || article.title === "(sin título)") continue;
    const key = normalizeKey(article);
    const existing = seen.get(key);
    // Prioriza la versión de OpenAlex porque trae `mainConcepts` reales.
    if (!existing || (existing.source !== "OpenAlex" && article.source === "OpenAlex")) {
      seen.set(key, article);
    }
  }

  return { articles: Array.from(seen.values()), sources, topicIds };
}
