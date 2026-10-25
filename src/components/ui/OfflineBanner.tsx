import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Aviso flotante y no bloqueante cuando se pierde la conexión: el usuario puede seguir leyendo lo que
 * ya cargó. Al volver la red muestra unos segundos "Conexión restablecida" y desaparece.
 */
export function OfflineBanner() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const goOffline = () => {
      clearTimeout(timer);
      setShowBackOnline(false);
      setIsOnline(false);
    };
    const goOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      timer = setTimeout(() => setShowBackOnline(false), 3500);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed bottom-4 left-1/2 z-[300] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
        isOnline ? "bg-status-good-bg text-status-good-text" : "bg-ink-primary text-white",
      ].join(" ")}
    >
      {isOnline ? <Wifi size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />}
      <span>
        {isOnline
          ? t("offline.back", "Conexión restablecida.")
          : t("offline.message", "Sin conexión. Puedes seguir leyendo lo que ya cargó; las búsquedas nuevas esperarán a que vuelva la red.")}
      </span>
    </div>
  );
}
