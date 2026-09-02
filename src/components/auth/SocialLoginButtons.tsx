import { useState, type ReactElement } from "react";
import { useClerk, useSignIn } from "@clerk/clerk-react";

type OAuthStrategy = "oauth_google" | "oauth_microsoft" | "oauth_facebook" | "oauth_apple" | "oauth_github";

interface SocialProvider {
  strategy: OAuthStrategy;
  label: string;
  icon: ReactElement;
}

const providers: SocialProvider[] = [
  {
    strategy: "oauth_google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17">
        <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.3 24 12 24z" />
        <path fill="#FBBC05" d="M5.29 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.28a12 12 0 0 0 0 10.84z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.28 6.58l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
      </svg>
    ),
  },
  {
    strategy: "oauth_microsoft",
    label: "Microsoft",
    icon: (
      <svg viewBox="0 0 23 23" width="16" height="16">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
    ),
  },
  {
    strategy: "oauth_facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17">
        <path
          fill="#1877F2"
          d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"
        />
      </svg>
    ),
  },
  {
    strategy: "oauth_apple",
    label: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path
          fill="currentColor"
          d="M16.36 1.43c0 1.14-.42 2.2-1.14 3.02-.83.94-2.05 1.63-3.15 1.55-.14-1.1.44-2.26 1.15-3.02.85-.9 2.24-1.6 3.14-1.55zM20.4 17.2c-.36.85-.79 1.66-1.34 2.42-.75 1.05-1.53 2.1-2.75 2.12-1.2.02-1.59-.7-2.96-.7-1.37 0-1.8.68-2.94.72-1.19.04-2.09-1.14-2.85-2.18-1.55-2.13-2.75-6.02-1.15-8.65.79-1.31 2.2-2.14 3.73-2.16 1.14-.02 2.22.77 2.94.77.71 0 2.02-.95 3.4-.81.58.02 2.2.23 3.24 1.76-.08.05-1.94 1.13-1.92 3.37.02 2.68 2.36 3.57 2.39 3.58-.02.06-.37 1.28-1.79 2.56z"
        />
      </svg>
    ),
  },
  {
    strategy: "oauth_github",
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path
          fill="currentColor"
          d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.76 1.19 1.76 1.19 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A10.5 10.5 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"
        />
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
      // por sso-sync (ej. se cerró la pestaña a mitad del flujo, se refrescó la página, expiró el JWT
      // propio sin que ninguna llamada a la API disparara un 401): eso basta para que Clerk rechace
      // cualquier intento nuevo con "You're already signed in". Se cierra primero sin importar el motivo
      // — si ya estaba limpio, no hace nada.
      await clerk.signOut().catch(() => {});
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
            title={`Continuar con ${provider.label}`}
            aria-label={`Continuar con ${provider.label}`}
          >
            {provider.icon}
          </button>
        ))}
      </div>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
