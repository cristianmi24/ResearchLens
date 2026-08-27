import { query } from "./index.js";
import type { Project } from "../types.js";

function rowToProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    originalIdea: row.original_idea,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    lastAnalyzedAt: row.last_analyzed_at instanceof Date ? row.last_analyzed_at.toISOString() : row.last_analyzed_at,
    diagnosis: row.diagnosis,
    savedArticles: row.saved_articles,
    opportunities: row.opportunities,
    currentQuestion: row.current_question,
    proposals: row.proposals,
    history: row.history,
  };
}

export async function listProjects(userId: string): Promise<Project[]> {
  const result = await query(`SELECT * FROM projects WHERE user_id = $1 ORDER BY last_analyzed_at DESC`, [userId]);
  return result.rows.map(rowToProject);
}

/** Devuelve el proyecto solo si existe y pertenece a `userId` (evita filtrar si un id ajeno existe). */
export async function getProject(id: string, userId: string): Promise<Project | undefined> {
  const result = await query(`SELECT * FROM projects WHERE id = $1 AND user_id = $2`, [id, userId]);
  return result.rows[0] ? rowToProject(result.rows[0]) : undefined;
}

export async function upsertProject(project: Project, userId: string): Promise<Project> {
  await query(
    `INSERT INTO projects
      (id, user_id, title, original_idea, created_at, last_analyzed_at, diagnosis, saved_articles, opportunities, current_question, proposals, history)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      original_idea = EXCLUDED.original_idea,
      last_analyzed_at = EXCLUDED.last_analyzed_at,
      diagnosis = EXCLUDED.diagnosis,
      saved_articles = EXCLUDED.saved_articles,
      opportunities = EXCLUDED.opportunities,
      current_question = EXCLUDED.current_question,
      proposals = EXCLUDED.proposals,
      history = EXCLUDED.history
     WHERE projects.user_id = $2`,
    [
      project.id,
      userId,
      project.title,
      project.originalIdea,
      project.createdAt,
      project.lastAnalyzedAt,
      JSON.stringify(project.diagnosis),
      JSON.stringify(project.savedArticles),
      JSON.stringify(project.opportunities),
      project.currentQuestion,
      JSON.stringify(project.proposals),
      JSON.stringify(project.history),
    ],
  );
  return project;
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  await query(`DELETE FROM projects WHERE id = $1 AND user_id = $2`, [id, userId]);
}
