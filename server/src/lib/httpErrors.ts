// En producción no se devuelven al cliente los mensajes internos (errores de base de datos, de APIs
// externas, rutas o detalles de configuración): quedan en los logs y el usuario ve un texto genérico.
// En desarrollo se devuelve el mensaje real para depurar más rápido.
const GENERIC_MESSAGE = "No se pudo completar la solicitud. Intenta de nuevo en unos minutos.";

export function publicErrorMessage(err: unknown): string {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    return err instanceof Error ? err.message : String(err);
  }
  return GENERIC_MESSAGE;
}
