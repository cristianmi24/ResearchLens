import { useEffect, useState } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { PageLoader } from "@/components/ui/PageLoader";

const STUCK_TIMEOUT_MS = 8000;

/**
 * Completa el handshake OAuth de Clerk; solo se monta si isClerkEnabled (ver App.tsx).
 *
 * Un usuario que entra por primera vez con una cuenta social no tiene todavía sesión
 * de sign-in: Clerk transfiere internamente ese intento a un sign-up, y esa
 * transferencia NO hereda el `redirectUrlComplete` que se pasó al iniciar el flujo
 * (ver SocialLoginButtons.tsx) — cae al fallback por defecto de Clerk, que es "/".
 * Por eso hay que fijar explícitamente a dónde va tanto el caso de sign-in como el
 * de sign-up, o el usuario nuevo termina de vuelta en la landing sin haber entrado.
 */
export function SsoCallback() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    // Si el usuario cancela a mitad del proveedor (cierra la ventana, le da "atrás",
    // niega el permiso), Clerk puede no completar el redirect de vuelta y esta pantalla
    // se quedaría cargando para siempre sin ninguna salida.
    const timer = setTimeout(() => setStuck(true), STUCK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PageLoader label="Verificando con el proveedor…" />
      <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/sso-sync" signUpFallbackRedirectUrl="/sso-sync" />
      {stuck && (
        <div className="fixed inset-x-0 bottom-8 flex justify-center">
          <a href="/" className="text-sm font-medium text-brand-600 hover:underline bg-surface-card px-4 py-2 rounded-lg shadow-[var(--shadow-card)]">
            ¿Tarda demasiado? Volver al inicio
          </a>
        </div>
      )}
    </>
  );
}
