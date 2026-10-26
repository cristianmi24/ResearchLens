import { createClerkClient, verifyToken } from "@clerk/backend";
import { config } from "../config.js";

/**
 * Clerk solo resuelve el handshake OAuth con Google/Microsoft/Facebook. Este
 * módulo verifica el token de sesión de Clerk y expone el perfil (email,
 * nombre) para que routes/auth.ts pueda vincularlo a la tabla `users` de
 * Postgres y seguir emitiendo el JWT propio de siempre.
 */

/**
 * Motivos por los que el login con Google puede fallar en el servidor. Cada uno lleva un código estable que
 * la pantalla de acceso muestra al usuario: permite saber la causa real sin exponer detalles internos
 * (en producción el resto de errores se oculta tras un mensaje genérico, ver lib/httpErrors.ts).
 */
export type ClerkSyncErrorCode =
  | "clerk_secret_missing"
  | "clerk_token_invalid"
  | "clerk_user_lookup_failed"
  | "clerk_no_email";

export class ClerkSyncError extends Error {
  code: ClerkSyncErrorCode;
  /** Detalle no sensible que ayuda a diagnosticar (p. ej. el motivo de rechazo del token que informa Clerk). */
  reason?: string;

  constructor(code: ClerkSyncErrorCode, message: string, reason?: string) {
    super(message);
    this.name = "ClerkSyncError";
    this.code = code;
    this.reason = reason;
  }
}

function assertClerkConfigured() {
  if (!config.clerk.secretKey) {
    throw new ClerkSyncError("clerk_secret_missing", "CLERK_SECRET_KEY no configurado en el servidor");
  }
}

let clerkClient: ReturnType<typeof createClerkClient> | null = null;
function getClerkClient() {
  assertClerkConfigured();
  if (!clerkClient) clerkClient = createClerkClient({ secretKey: config.clerk.secretKey });
  return clerkClient;
}

export interface ClerkProfile {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** Verifica el token de sesión de Clerk (enviado por el frontend) y trae el perfil del usuario. */
export async function resolveClerkProfile(sessionToken: string): Promise<ClerkProfile> {
  assertClerkConfigured();

  let clerkUserId: string | undefined;
  try {
    const payload = await verifyToken(sessionToken, { secretKey: config.clerk.secretKey });
    clerkUserId = payload.sub;
  } catch (err) {
    // El caso típico en producción: la clave pública (pk_live) es de una instancia y CLERK_SECRET_KEY de otra
    // (p. ej. sk_test), así que la firma del token no coincide. `reason` lo dice sin revelar ninguna clave.
    const reason = (err as { reason?: string }).reason;
    console.error("[clerk] verifyToken falló:", reason ?? "", (err as Error).message);
    throw new ClerkSyncError("clerk_token_invalid", "Clerk rechazó el token de sesión", reason);
  }
  if (!clerkUserId) throw new ClerkSyncError("clerk_token_invalid", "Token de Clerk sin subject (sub)", "no-subject");

  let user: Awaited<ReturnType<ReturnType<typeof getClerkClient>["users"]["getUser"]>>;
  try {
    user = await getClerkClient().users.getUser(clerkUserId);
  } catch (err) {
    const status = (err as { status?: number }).status;
    console.error("[clerk] getUser falló:", status ?? "", (err as Error).message);
    throw new ClerkSyncError("clerk_user_lookup_failed", "No se pudo leer el usuario en Clerk", status ? `http-${status}` : undefined);
  }
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
  if (!email) throw new ClerkSyncError("clerk_no_email", "La cuenta de Clerk no tiene un correo asociado");

  return {
    clerkUserId,
    email,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
  };
}
