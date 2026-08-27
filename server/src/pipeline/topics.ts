import * as openAlex from "../lib/openalex.js";
import type { Article, ConcentrationLevel, Topic, TrendDirection } from "../types.js";

const MAX_TOPICS = 6;

// Umbrales calibrados para volúmenes reales de OpenAlex a nivel de concepto
// (que suelen ir de cientos a millones), no para el tamaño de la muestra local.
function concentrationFromCount(count: number): ConcentrationLevel {
  if (count >= 50_000) return "alta";
  if (count >= 5_000) return "media";
  return "baja";
}

function trendFromYearly(byYear: { year: number; count: number }[]): TrendDirection {
  if (byYear.length < 2) return "estable";
  const sorted = [...byYear].sort((a, b) => a.year - b.year);
  const recent = sorted.slice(-2).reduce((sum, y) => sum + y.count, 0);
  const previous = sorted.slice(-4, -2).reduce((sum, y) => sum + y.count, 0);
  if (previous === 0) return recent > 0 ? "creciente" : "estable";
  const change = (recent - previous) / previous;
  if (change > 0.15) return "creciente";
  if (change < -0.15) return "decreciente";
  return "estable";
}

/** Layout determinista tipo espiral áurea, para que el mapa no amontone los nodos. */
function layoutPosition(index: number, total: number): { x: number; y: number } {
  const goldenAngle = 137.508;
  const angle = (index * goldenAngle * Math.PI) / 180;
  const radius = 15 + (index / Math.max(1, total - 1)) * 32;
  const x = Math.round(50 + radius * Math.cos(angle));
  const y = Math.round(50 + radius * Math.sin(angle));
  return { x: Math.min(92, Math.max(8, x)), y: Math.min(92, Math.max(8, y)) };
}

/**
 * Deriva "temas" a partir de los `mainConcepts` reales de OpenAlex (campo
 * `works.topics`) presentes en los artículos recuperados. Para cada tema
 * frecuente se consulta el volumen real de publicaciones en OpenAlex,
 * filtrando por el ID del tema cuando se conoce (más preciso que buscar el
 * nombre como texto libre, que infla los conteos).
 */
export async function deriveTopics(articles: Article[], topicIds: Map<string, string>): Promise<Topic[]> {
  const conceptToArticles = new Map<string, Article[]>();
  for (const article of articles) {
    for (const concept of article.mainConcepts) {
      const list = conceptToArticles.get(concept) ?? [];
      list.push(article);
      conceptToArticles.set(concept, list);
    }
  }

  const topConcepts = Array.from(conceptToArticles.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_TOPICS);

  const enriched = await Promise.all(
    topConcepts.map(async ([concept, relatedArticles]) => {
      const topicId = topicIds.get(concept);
      const [studiesCount, byYear] = await Promise.all([
        topicId ? openAlex.countWorksByTopic(topicId) : openAlex.countWorks(concept),
        topicId ? openAlex.worksByYearForTopic(topicId) : openAlex.worksByYear(concept),
      ]);

      const authorCounts = new Map<string, number>();
      for (const article of relatedArticles) {
        for (const author of article.authors) {
          authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
        }
      }
      const topAuthors = Array.from(authorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      const timeline = byYear.length > 0
        ? byYear.slice(-6).map((y) => ({ year: y.year, publications: y.count }))
        : [];

      const topYears = [...timeline]
        .sort((a, b) => b.publications - a.publications)
        .slice(0, 2)
        .map((t) => t.year)
        .sort();

      return {
        concept,
        studiesCount,
        concentration: concentrationFromCount(studiesCount),
        trend: trendFromYearly(byYear),
        topAuthors,
        topYears,
        relatedArticleIds: relatedArticles.map((a) => a.id),
        timeline,
      };
    }),
  );

  return enriched.map((topic, index): Topic => {
    const { x, y } = layoutPosition(index, enriched.length);
    return {
      id: `topic-${topic.concept.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: topic.concept,
      studiesCount: topic.studiesCount,
      concentration: topic.concentration,
      trend: topic.trend,
      topAuthors: topic.topAuthors,
      topYears: topic.topYears,
      relatedArticleIds: topic.relatedArticleIds,
      timeline: topic.timeline,
      x,
      y,
    };
  });
}
