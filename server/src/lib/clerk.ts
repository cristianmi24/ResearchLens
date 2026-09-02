import { createClerkClient, verifyToken } from "@clerk/backend";
import { config } from "../config.js";

/**
 * Clerk solo resuelve el handshake OAuth con Google/Microsoft/Facebook. Este
 * módulo verifica el token de sesión de Clerk y expone el perfil (email,
 * nombre) para que routes/auth.ts pueda vincularlo a la tabla `users` de
 * Postgres y seguir emitiendo el JWT propio de siempre.
 */

function assertClerkConfigured() {
  if (!config.clerk.secretKey) throw new Error("CLERK_SECRET_KEY no configurado en .env");
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

  const payload = await verifyToken(sessionToken, { secretKey: config.clerk.secretKey });
  const clerkUserId = payload.sub;
  if (!clerkUserId) throw new Error("Token de Clerk sin subject (sub)");

  const user = await getClerkClient().users.getUser(clerkUserId);
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("La cuenta de Clerk no tiene un correo asociado");

  return {
    clerkUserId,
    email,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
  };
}
