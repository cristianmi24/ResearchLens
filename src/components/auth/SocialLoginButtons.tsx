import { useState } from "react";
import { useClerk, useSignIn } from "@clerk/clerk-react";

// En Clerk de producción cada proveedor necesita sus propias credenciales OAuth, y hoy solo Google está
// configurado. Para sumar otro (Microsoft, GitHub…): configúralo en Clerk → SSO connections, agrega aquí su
// estrategia (p. ej. "oauth_microsoft") y un botón en `providers`.
type OAuthStrategy = "oauth_google";

interface SocialProvider {
  strategy: OAuthStrategy;
  label: string;
  icon: React.ReactElement;
}

const providers: SocialProvider[] = [
  {
    strategy: "oauth_google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.3 24 12 24z" />
        <path fill="#FBBC05" d="M5.29 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.28a12 12 0 0 0 0 10.84z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.28 6.58l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
      </svg>
    ),
  },
];

/** Solo se monta cuando isClerkEnabled es true (ver App.tsx/Welcome.tsx), así que <ClerkProvider> ya existe. */
export function SocialLoginButtons() {
  const { signIn, isLoaded } = useSignIn();
  const clerk = useClerk();
  const [pendingStrategy, setPendingStrategy] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(strategy: OAuthStrategy) {
    if (!isLoaded) return;
    setError(null);
    setPendingStrategy(strategy);
    try {
      // Una sesión de Clerk puede quedar activa de un intento anterior sin pasar por nuestro logout ni
      // por sso-sync (ej. se cerró la pestaña a mitad del flujo, falló la sincronización con el servidor,
      // expiró el JWT propio sin que ninguna llamada a la API disparara un 401): Clerk rechaza cualquier
      // intento nuevo con "You're already signed in". En vez de cerrarla (signOut() navega a otra página y
      // cancelaba este clic), se aprovecha: ya hay una cuenta de Google validada, solo falta intercambiarla
      // por nuestra sesión en /sso-sync (que, si la sesión de Clerk está vencida, vuelve al inicio).
      if (clerk.session) {
        window.location.assign("/sso-sync");
        return;
      }
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/sso-sync`,
      });
    } catch (err) {
      console.error("[SocialLoginButtons] authenticateWithRedirect falló:", err);
      setError("No se pudo iniciar el login social. Intenta de nuevo.");
      setPendingStrategy(null);
    }
  }

  return (
    <div className="social-auth">
      <div className="social-auth-divider">
        <span>o continúa con</span>
      </div>
      <div className="social-auth-buttons">
        {providers.map((provider) => (
          <button
            key={provider.strategy}
            type="button"
            className={`social-auth-btn${pendingStrategy === provider.strategy ? " pending" : ""}`}
            disabled={!isLoaded || pendingStrategy !== null}
            onClick={() => handleClick(provider.strategy)}
          >
            {provider.icon}
            <span>Continuar con {provider.label}</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
