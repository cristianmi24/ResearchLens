import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// Neon cierra conexiones idle sin previo aviso; pg emite un evento 'error' en
// el pool cuando eso pasa. Sin este listener, ese error queda sin manejar y
// tumba todo el proceso de Node (no solo la query que estaba en curso).
pool?.on("error", (err) => {
  console.warn("[db] error en cliente idle del pool:", err.message);
});

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: unknown[]) {
  if (!pool) throw new Error("DATABASE_URL no está configurada");
  return pool.query<T>(text, params);
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_idea TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  diagnosis JSONB NOT NULL,
  saved_articles JSONB NOT NULL DEFAULT '[]',
  opportunities JSONB NOT NULL DEFAULT '[]',
  current_question TEXT,
  proposals JSONB NOT NULL DEFAULT '[]',
  history JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS research_sessions (
  id TEXT PRIMARY KEY,
  original_idea TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]',
  area TEXT,
  diagnosis JSONB NOT NULL,
  articles JSONB NOT NULL DEFAULT '[]',
  sources JSONB NOT NULL DEFAULT '[]',
  topics JSONB NOT NULL DEFAULT '[]',
  trends JSONB NOT NULL DEFAULT '[]',
  opportunities JSONB NOT NULL DEFAULT '[]',
  delimitation_options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES research_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

// `projects` y `research_sessions` ya existían en la base antes de agregar
// autenticación, así que `CREATE TABLE IF NOT EXISTS` no les añade columnas
// nuevas: hay que migrarlas explícitamente con ALTER TABLE. Las filas viejas
// (de antes de que existiera auth) quedan con user_id NULL, sin dueño.
const MIGRATIONS = `
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE research_sessions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);

-- Login social vía Clerk (Google/Microsoft/Facebook): esas cuentas no tienen
-- contraseña propia, y se identifican por el id de usuario de Clerk.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
`;

export async function initSchema() {
  if (!pool) {
    console.warn("[db] DATABASE_URL no configurada: proyectos/sesiones no se persistirán en Postgres.");
    return;
  }
  await pool.query(SCHEMA);
  await pool.query(MIGRATIONS);
  console.log("[db] Esquema Postgres (Neon) listo.");
}
