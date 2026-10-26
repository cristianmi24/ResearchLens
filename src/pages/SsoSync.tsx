import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkSession } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import * as authApi from "@/services/authApi";
import { ApiError } from "@/services/api";
import { PageLoader } from "@/components/ui/PageLoader";
import { CONTACT_EMAIL } from "@/lib/contact";

/**
 * Puente entre la sesión de Clerk (ya resuelta tras el redirect de OAuth) y
 * nuestro backend: intercambia el token de Clerk por el JWT propio y lo
 * aplica a AuthProvider, para que el resto de la app siga viendo la sesión
 * de siempre. Solo se monta si isClerkEnabled (ver App.tsx).
 */
export function SsoSync() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkSession();
  const { setSession } = useAuth();
  const [error, setError] = useState<{ message: string; code: string } | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!isLoaded || attempted.current) return;
    attempted.current = true;

    if (!isSignedIn) {
      navigate("/", { replace: true });
      return;
    }

    (async () => {
      try {
        const clerkToken = await getToken();
        if (!clerkToken) throw new Error("No se pudo obtener el token de sesión.");
        const { token, user } = await authApi.clerkSync(clerkToken);
        setSession(token, user);
        navigate("/inicio", { replace: true });
      } catch (err) {
        // Si la sincronización con el backend falla, Clerk queda "logueado" pero Zetia nunca
        // llegó a crear la sesión: sin cerrar Clerk aquí, cualquier botón social posterior fallaría de
        // inmediato con "You're already signed in", dejando al usuario sin forma de reintentar.
        await signOut().catch(() => {});
        console.error("[SsoSync] falló el inicio de sesión con Google:", err);
        if (err instanceof ApiError) {
          // El servidor manda un código por cada motivo; sin él (p. ej. un 5xx sin cuerpo) se usa el estado HTTP.
          const detail = [err.code ?? `http_${err.status}`, err.reason].filter(Boolean).join(" · ");
          setError({ message: err.message, code: detail });
        } else {
          // Sin respuesta del servidor (red caída, API mal configurada, bloqueo del navegador…).
          setError({ message: "No se pudo completar el inicio de sesión con Google.", code: "sin_respuesta_del_servidor" });
        }
      }
    })();
  }, [isLoaded, isSignedIn, getToken, signOut, setSession, navigate]);

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-surface text-center px-4">
        <p className="text-sm font-medium text-status-critical-text" role="alert">
          {error.message}
        </p>
        <p className="max-w-sm text-xs text-ink-secondary">
          Si el problema continúa, escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-600 hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          y cuéntanos este código:
        </p>
        <code className="rounded-lg bg-surface-muted px-3 py-1.5 font-mono text-xs text-ink-primary select-all">{error.code}</code>
        <a href="/" className="mt-2 text-sm font-medium text-brand-600 hover:underline">
          Volver al inicio
        </a>
      </div>
    );
  }

  return <PageLoader label="Completando inicio de sesión…" />;
}
