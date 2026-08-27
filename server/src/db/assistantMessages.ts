import { query } from "./index.js";
import type { AssistantMessage } from "../types.js";

export async function saveMessage(sessionId: string | null, message: AssistantMessage): Promise<void> {
  await query(
    `INSERT INTO assistant_messages (id, session_id, role, text, citations, created_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [message.id, sessionId, message.role, message.text, JSON.stringify(message.citations ?? []), message.createdAt],
  );
}

export async function listMessages(sessionId: string): Promise<AssistantMessage[]> {
  const result = await query(
    `SELECT * FROM assistant_messages WHERE session_id = $1 ORDER BY created_at ASC`,
    [sessionId],
  );
  return result.rows.map((row: any) => ({
    id: row.id,
    role: row.role,
    text: row.text,
    citations: row.citations,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }));
}
