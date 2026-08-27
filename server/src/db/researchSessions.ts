import { query } from "./index.js";
import type { ResearchSession } from "../types.js";

export async function saveSession(session: ResearchSession, userId: string): Promise<void> {
  await query(
    `INSERT INTO research_sessions
      (id, user_id, original_idea, keywords, area, diagnosis, articles, sources, topics, trends, opportunities, delimitation_options, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
      original_idea = EXCLUDED.original_idea,
      keywords = EXCLUDED.keywords,
      area = EXCLUDED.area,
      diagnosis = EXCLUDED.diagnosis,
      articles = EXCLUDED.articles,
      sources = EXCLUDED.sources,
      topics = EXCLUDED.topics,
      trends = EXCLUDED.trends,
      opportunities = EXCLUDED.opportunities,
      delimitation_options = EXCLUDED.delimitation_options
     WHERE research_sessions.user_id = $2`,
    [
      session.id,
      userId,
      session.originalIdea,
      JSON.stringify(session.keywords),
      session.area,
      JSON.stringify(session.diagnosis),
      JSON.stringify(session.articles),
      JSON.stringify(session.sources),
      JSON.stringify(session.topics),
      JSON.stringify(session.trends),
      JSON.stringify(session.opportunities),
      JSON.stringify(session.delimitationOptions),
      session.createdAt,
    ],
  );
}

function rowToSession(row: any): ResearchSession {
  return {
    id: row.id,
    originalIdea: row.original_idea,
    keywords: row.keywords,
    area: row.area,
    diagnosis: row.diagnosis,
    articles: row.articles,
    sources: row.sources,
    topics: row.topics,
    trends: row.trends,
    opportunities: row.opportunities,
    delimitationOptions: row.delimitation_options,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function getSession(id: string, userId: string): Promise<ResearchSession | undefined> {
  const result = await query(`SELECT * FROM research_sessions WHERE id = $1 AND user_id = $2`, [id, userId]);
  return result.rows[0] ? rowToSession(result.rows[0]) : undefined;
}

export async function getLatestSession(userId: string): Promise<ResearchSession | undefined> {
  const result = await query(
    `SELECT * FROM research_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return result.rows[0] ? rowToSession(result.rows[0]) : undefined;
}

/** Análisis que el usuario ya corrió hoy (UTC), para aplicar el tope diario. */
export async function countSessionsToday(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM research_sessions
     WHERE user_id = $1 AND created_at >= date_trunc('day', now())`,
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export interface SessionSummary {
  id: string;
  originalIdea: string;
  relatedStudiesCount: number;
  createdAt: string;
}

/** Historial resumido (para la lista de "mis análisis"). */
export async function listSessionSummaries(userId: string, limit = 30): Promise<SessionSummary[]> {
  const result = await query(
    `SELECT id, original_idea, created_at, (diagnosis->'indicators'->>'relatedStudiesCount')::int AS related_studies_count
     FROM research_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return result.rows.map((row: any) => ({
    id: row.id,
    originalIdea: row.original_idea,
    relatedStudiesCount: row.related_studies_count ?? 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }));
}

export interface DailyUsagePoint {
  date: string;
  count: number;
}

/** Cantidad de análisis por día en los últimos `days` días (para la gráfica de actividad). */
export async function countSessionsByDay(userId: string, days = 14): Promise<DailyUsagePoint[]> {
  const result = await query(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
     FROM research_sessions
     WHERE user_id = $1 AND created_at >= now() - ($2 || ' days')::interval
     GROUP BY 1 ORDER BY 1 ASC`,
    [userId, days],
  );
  return result.rows.map((row: any) => ({ date: row.date, count: row.count }));
}
