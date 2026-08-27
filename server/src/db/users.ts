import { query } from "./index.js";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
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
