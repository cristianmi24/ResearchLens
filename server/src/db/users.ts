import { query } from "./index.js";

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  clerkUserId: string | null;
  createdAt: string;
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    clerkUserId: row.clerk_user_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function createUser(
  id: string,
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
): Promise<User> {
  const result = await query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, email.toLowerCase().trim(), passwordHash, firstName.trim(), lastName.trim()],
  );
  return rowToUser(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
  return result.rows[0] ? rowToUser(result.rows[0]) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] ? rowToUser(result.rows[0]) : undefined;
}

export async function findUserByClerkId(clerkUserId: string): Promise<User | undefined> {
  const result = await query(`SELECT * FROM users WHERE clerk_user_id = $1`, [clerkUserId]);
  return result.rows[0] ? rowToUser(result.rows[0]) : undefined;
}

/** Vincula un clerk_user_id a una cuenta ya existente (encontrada por email), sin tocar su contraseña. */
export async function linkClerkId(userId: string, clerkUserId: string): Promise<User> {
  const result = await query(`UPDATE users SET clerk_user_id = $2 WHERE id = $1 RETURNING *`, [userId, clerkUserId]);
  return rowToUser(result.rows[0]);
}

/** Crea una cuenta a partir de un login social de Clerk: no tiene contraseña propia. */
export async function createUserFromClerk(
  id: string,
  email: string,
  clerkUserId: string,
  firstName: string,
  lastName: string,
): Promise<User> {
  const result = await query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, clerk_user_id)
     VALUES ($1, $2, NULL, $3, $4, $5) RETURNING *`,
    [id, email.toLowerCase().trim(), firstName.trim(), lastName.trim(), clerkUserId],
  );
  return rowToUser(result.rows[0]);
}
