/**
 * Clerk solo resuelve el login social (Google/Microsoft/Facebook); el resto de
 * la sesión sigue siendo el JWT propio contra Postgres (ver services/authApi.ts).
 * Sin esta clave, el frontend simplemente oculta los botones de login social
 * en vez de romper: `isClerkEnabled` gatea tanto el <ClerkProvider> en main.tsx
 * como las rutas /sso-callback y /sso-sync en App.tsx.
 */
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
export const isClerkEnabled = Boolean(CLERK_PUBLISHABLE_KEY);

// clerk-js expone esta instancia global en cuanto carga. Se usa (en vez de un hook de React) para poder
// cerrar la sesión de Clerk desde código que no está garantizado a vivir dentro de un <ClerkProvider>
// (ver logout() en hooks/useAuth.tsx) — si Clerk no está habilitado, window.Clerk simplemente no existe.
declare global {
  interface Window {
    Clerk?: {
      signOut: () => Promise<void>;
    };
  }
}
