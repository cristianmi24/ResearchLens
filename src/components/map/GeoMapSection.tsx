import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MapIcon } from "./MapIcon";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/i18n/LanguageContext";
import type { GeoResearchDistribution } from "@/types/research";

// El atlas trae d3 y los datos de los mapas: se descarga solo cuando hace falta.
const GeoAtlas = lazy(() => import("./MapaInteractivo"));

interface GeoMapSectionProps {
  /** Distribución geográfica del análisis. Sin ella no se muestra nada. */
  distribution: GeoResearchDistribution | null | undefined;
  /** Muestra el título y la descripción de la sección (las páginas con su propio título lo omiten). */
  showHeader?: boolean;
  /** Texto adicional bajo la descripción (por ejemplo, cómo usar el mapa al armar la propuesta). */
  hint?: string;
  height?: string | number;
}

/**
 * Sección "Dónde se investiga": el atlas dentro de las pantallas del flujo
 * (resultados de la búsqueda, propuesta de investigación, mapa). El globo 3D no
 * se monta hasta que la sección se acerca a la pantalla, para no recargar la
 * página con un render pesado que el usuario aún no ve.
 */
export function GeoMapSection({ distribution, showHeader = true, hint, height }: GeoMapSectionProps) {
  const { t } = useLanguage();
  const hostRef = useRef<HTMLDivElement>(null);
  // Sin IntersectionObserver (entornos muy antiguos) se monta de inmediato.
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = hostRef.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near, distribution]);

  if (!distribution) return null;

  return (
    <section className="space-y-3" ref={hostRef}>
      {showHeader && (
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-primary">
            <MapIcon size={26} />
            {t("map.sectionTitle", "Dónde se investiga este tema")}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {t(
              "map.sectionDesc",
              "Países, y departamentos de Colombia, con estudios sobre tu tema según la institución de sus autores (OpenAlex)."
            )}
          </p>
          {hint && <p className="mt-1 text-sm text-ink-secondary">{hint}</p>}
        </div>
      )}

      {near ? (
        <Suspense fallback={<MapPlaceholder text={t("map.geoLoading", "Cargando el mapa…")} />}>
          <GeoAtlas distribution={distribution} height={height} />
        </Suspense>
      ) : (
        <MapPlaceholder text={t("map.geoLoading", "Cargando el mapa…")} />
      )}

      <p className="text-xs leading-relaxed text-ink-muted">
        {t(
          "map.geoHowTo",
          "Cómo leerlo: el color indica cuántos estudios hay; un país o departamento oscuro no significa que no se investigue allí, solo que OpenAlex no registra estudios con instituciones ahí para estos términos. Úsalo como pista de un posible vacío contextual y confírmalo con una búsqueda más amplia."
        )}
      </p>
    </section>
  );
}

function MapPlaceholder({ text }: { text: string }) {
  return (
    <Card className="flex h-[420px] items-center justify-center text-sm text-ink-muted" aria-busy="true">
      {text}
    </Card>
  );
}
