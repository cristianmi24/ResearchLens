import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Exige un JWT válido en `Authorization: Bearer <token>` y adjunta `req.userId`. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "No autenticado: falta el token" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }

  req.userId = payload.userId;
  next();
}
