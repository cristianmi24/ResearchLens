import { Router } from "express";
import { randomUUID } from "node:crypto";
import {
  createUser,
  createUserFromClerk,
  findUserByClerkId,
  findUserByEmail,
  findUserById,
  linkClerkId,
} from "../db/users.js";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { resolveClerkProfile } from "../lib/clerk.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function publicUser(user: { id: string; email: string; firstName: string; lastName: string; createdAt: string }) {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, createdAt: user.createdAt };
}

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    };

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Correo inválido" });
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
    }
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: "Nombre y apellido son requeridos" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(randomUUID(), email, passwordHash, firstName, lastName);
    const token = signToken(user.id);

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[POST /auth/register]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[POST /auth/login]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

authRouter.post("/clerk-sync", async (req, res) => {
  try {
    const { clerkToken } = req.body as { clerkToken?: string };
    if (!clerkToken) {
      return res.status(400).json({ error: "clerkToken es requerido" });
    }

    const profile = await resolveClerkProfile(clerkToken);

    let user = await findUserByClerkId(profile.clerkUserId);
    if (!user) {
      // Ya existe una cuenta con ese correo (creada con contraseña propia): se vincula,
      // no se duplica la cuenta.
      const existingByEmail = await findUserByEmail(profile.email);
      user = existingByEmail
        ? await linkClerkId(existingByEmail.id, profile.clerkUserId)
        : await createUserFromClerk(
            randomUUID(),
            profile.email,
            profile.clerkUserId,
            profile.firstName || "Usuario",
            profile.lastName || "",
          );
    }

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[POST /auth/clerk-sync]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.userId!);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[GET /auth/me]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});
