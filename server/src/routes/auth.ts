import { Router } from "express";
import { randomUUID } from "node:crypto";
import {
  createUser,
  createUserFromClerk,
  findUserByClerkId,
  findUserByEmail,
  findUserById,
  linkClerkId,
  updateUserName,
} from "../db/users.js";
import { burnPasswordCheck, hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { ClerkSyncError, resolveClerkProfile, type ClerkSyncErrorCode } from "../lib/clerk.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { publicErrorMessage } from "../lib/httpErrors.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// Topes de longitud: evitan cuerpos enormes y que bcrypt procese contraseñas gigantes (DoS).
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 60;

const isString = (value: unknown): value is string => typeof value === "string";

// Respuesta al usuario por cada motivo de fallo del login con Google: mensaje amable + código para soporte.
const CLERK_SYNC_RESPONSES: Record<ClerkSyncErrorCode, { status: number; message: string }> = {
  clerk_secret_missing: { status: 503, message: "El inicio de sesión con Google no está disponible por ahora." },
  clerk_token_invalid: { status: 403, message: "No pudimos validar tu sesión de Google. Intenta de nuevo." },
  clerk_user_lookup_failed: { status: 502, message: "No pudimos leer tu perfil de Google. Intenta de nuevo." },
  clerk_no_email: { status: 422, message: "Tu cuenta de Google no compartió un correo electrónico." },
};

function publicUser(user: { id: string; email: string; firstName: string; lastName: string; createdAt: string }) {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, createdAt: user.createdAt };
}

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = (req.body ?? {}) as Record<string, unknown>;

    if (!isString(email) || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: "Correo inválido" });
    }
    if (!isString(password) || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres` });
    }
    if (!isString(firstName) || !isString(lastName) || !firstName.trim() || !lastName.trim()) {
      return res.status(400).json({ error: "Nombre y apellido son requeridos" });
    }
    if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Nombre y apellido admiten hasta ${MAX_NAME_LENGTH} caracteres` });
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
    res.status(502).json({ error: publicErrorMessage(err) });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as Record<string, unknown>;
    if (!isString(email) || !isString(password) || !email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }
    if (email.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash) {
      await burnPasswordCheck(password);
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[POST /auth/login]", err);
    res.status(502).json({ error: publicErrorMessage(err) });
  }
});

authRouter.post("/clerk-sync", async (req, res) => {
  try {
    const { clerkToken } = (req.body ?? {}) as Record<string, unknown>;
    if (!isString(clerkToken) || !clerkToken) {
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
    if (err instanceof ClerkSyncError) {
      const { status, message } = CLERK_SYNC_RESPONSES[err.code];
      // 403 y no 401: un 401 haría que el frontend cierre la sesión local, y aquí todavía no hay ninguna.
      return res.status(status).json({ error: message, code: err.code, ...(err.reason ? { reason: err.reason } : {}) });
    }
    res.status(502).json({ error: publicErrorMessage(err), code: "sync_failed" });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.userId!);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[GET /auth/me]", err);
    res.status(502).json({ error: publicErrorMessage(err) });
  }
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName } = (req.body ?? {}) as Record<string, unknown>;
    if (!isString(firstName) || !isString(lastName) || !firstName.trim() || !lastName.trim()) {
      return res.status(400).json({ error: "Nombre y apellido son requeridos" });
    }
    if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Nombre y apellido admiten hasta ${MAX_NAME_LENGTH} caracteres` });
    }

    const user = await updateUserName(req.userId!, firstName, lastName);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[PATCH /auth/me]", err);
    res.status(502).json({ error: publicErrorMessage(err) });
  }
});
