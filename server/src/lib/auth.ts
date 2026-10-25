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

// Hash de relleno: cuando el correo no existe se compara igual contra él, para que la respuesta tarde
// lo mismo y no revele por tiempo qué correos están registrados.
const DUMMY_HASH = bcrypt.hashSync("zetia-dummy-password", SALT_ROUNDS);

export async function burnPasswordCheck(password: string): Promise<void> {
  await bcrypt.compare(password, DUMMY_HASH);
}

// Se fija el algoritmo para que un token firmado con otro (p. ej. "none") nunca se acepte.
const JWT_ALGORITHM = "HS256";

export interface JwtPayload {
  userId: string;
}

function assertSecret() {
  if (!config.auth.jwtSecret) throw new Error("JWT_SECRET no configurado en .env");
}

export function signToken(userId: string): string {
  assertSecret();
  return jwt.sign({ userId } satisfies JwtPayload, config.auth.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: config.auth.jwtExpiresIn,
  } as jwt.SignOptions);
}

/** Devuelve el payload si el token es válido, o null si es inválido/expiró. */
export function verifyToken(token: string): JwtPayload | null {
  assertSecret();
  try {
    const payload = jwt.verify(token, config.auth.jwtSecret, { algorithms: [JWT_ALGORITHM] });
    if (typeof payload !== "object" || typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
