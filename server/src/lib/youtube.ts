import { config } from "../config.js";

export interface YoutubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  url: string;
}

// Palabras demasiado comunes en español/inglés para aportar señal de relevancia.
const STOPWORDS = new Set([
  "de", "la", "el", "en", "y", "a", "los", "las", "un", "una", "unos", "unas", "que", "con", "para",
  "del", "al", "por", "su", "sus", "es", "son", "como", "más", "mas", "o", "u", "e", "se", "lo", "le",
  "les", "sin", "sobre", "entre", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas",
  "the", "and", "of", "in", "to", "an", "for", "on", "is", "are", "with", "how", "what", "why",
]);

/** Quita tildes/diacríticos y deja solo palabras alfanuméricas de más de 2 letras, sin stopwords. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Relevancia léxica local (sin tokens de IA): qué fracción de las palabras
 * clave de la búsqueda aparece en el título/canal del video. YouTube ordena
 * por "relevancia" propia, que no está acotada al tema exacto de investigación
 * y suele traer contenido sin relación real; este filtro corta eso gratis.
 */
function relevanceScore(queryTokens: string[], video: { title: string; channelTitle: string }): number {
  if (queryTokens.length === 0) return 1;
  const videoTokens = tokenize(`${video.title} ${video.channelTitle}`);
  const matched = queryTokens.filter((qt) => videoTokens.some((vt) => vt.includes(qt) || qt.includes(vt)));
  return matched.length / queryTokens.length;
}

const MIN_RELEVANCE = 0.2;

interface YoutubeSearchResponse {
  items: {
    id: { videoId?: string };
    snippet: { title: string; channelTitle: string; publishedAt: string; thumbnails: { medium?: { url?: string } } };
  }[];
}

function isYoutubeSearchResponse(value: unknown): value is YoutubeSearchResponse {
  if (!value || typeof value !== "object" || !Array.isArray((value as { items?: unknown }).items)) return false;
  return (value as YoutubeSearchResponse).items.every(
    (item) =>
      Boolean(item && item.id && item.snippet) &&
      typeof item.snippet.title === "string" &&
      typeof item.snippet.channelTitle === "string" &&
      typeof item.snippet.publishedAt === "string",
  );
}

export async function searchVideos(searchQuery: string, maxResults = 8): Promise<YoutubeVideo[]> {
  if (!config.youtube.apiKey) return [];

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    order: "relevance",
    // Se piden más de los que se van a mostrar porque el filtro de relevancia
    // local descarta algunos; así el resultado final no queda corto.
    maxResults: String(maxResults * 2),
    q: searchQuery,
    key: config.youtube.apiKey,
  });

  let data: YoutubeSearchResponse;
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[youtube] search failed", res.status, await res.text());
      return [];
    }
    const payload: unknown = await res.json();
    if (!isYoutubeSearchResponse(payload)) {
      console.warn("[youtube] la respuesta de la API no tiene el formato esperado");
      return [];
    }
    data = payload;
  } catch (err) {
    console.warn("[youtube] no se pudo contactar la API:", (err as Error).message);
    return [];
  }

  const videos = data.items
    .flatMap((item) => {
      const videoId = item.id.videoId;
      if (!videoId) return [];
      return [{
        videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium?.url ?? "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
      }];
    });

  const queryTokens = tokenize(searchQuery);
  return videos
    .map((video) => ({ video, score: relevanceScore(queryTokens, video) }))
    .filter(({ score }) => score >= MIN_RELEVANCE)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ video }) => video);
}
