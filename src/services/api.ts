/**
 * Cliente HTTP base para el backend REST (Node/Express en server/).
 *
 * IMPORTANTE: el frontend nunca debe contener claves de API. Las llamadas a
 * Qwen, OpenAlex, Crossref, Semantic Scholar, arXiv y Google Trends se
 * realizan siempre desde el backend; este cliente solo habla con nuestro
 * propio servidor (VITE_API_BASE_URL).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const TOKEN_STORAGE_KEY = "researchlens_token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Error ${response.status} al llamar ${path}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // el cuerpo no era JSON: se conserva el mensaje genérico
    }

    if (response.status === 401) {
      setToken(null);
      window.dispatchEvent(new CustomEvent("researchlens:unauthorized"));
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Simula la latencia de red para que la UI de mock se sienta realista. */
export function withMockLatency<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
