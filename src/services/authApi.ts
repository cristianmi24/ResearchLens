import { apiFetch } from "./api";
import type { AuthResponse, AuthUser } from "@/types/auth";

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me(): Promise<AuthUser> {
  const { user } = await apiFetch<{ user: AuthUser }>("/auth/me");
  return user;
}

/** Intercambia un token de sesión de Clerk (Google/Microsoft/Facebook) por nuestro JWT propio. */
export async function clerkSync(clerkToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/clerk-sync", {
    method: "POST",
    body: JSON.stringify({ clerkToken }),
  });
}
