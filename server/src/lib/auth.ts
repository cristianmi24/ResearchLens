import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload {
  userId: string;
}

function assertSecret() {
  if (!config.auth.jwtSecret) throw new Error("JWT_SECRET no configurado en .env");
}

export function signToken(userId: string): string {
  assertSecret();
  return jwt.sign({ userId } satisfies JwtPayload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  } as jwt.SignOptions);
}

/** Devuelve el payload si el token es válido, o null si es inválido/expiró. */
export function verifyToken(token: string): JwtPayload | null {
  assertSecret();
  try {
    return jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}
