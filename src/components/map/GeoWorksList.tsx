import { useEffect, useState } from "react";
import { getGeoWorks } from "@/services/researchApi";
import type { GeoWork } from "@/types/research";
import type { AtlasStringKey } from "./atlasStrings";

type T = (key: AtlasStringKey, vars?: Record<string, string | number>) => string;

interface Loaded {
  total: number;
  works: GeoWork[];
}

// Evita pedir de nuevo los mismos estudios al volver a seleccionar un país o departamento.
const cache = new Map<string, Loaded>();

interface GeoWorksListProps {
  /** Términos de búsqueda del análisis (`distribution.query`). */
  query: string;
  /** País (ISO alfa-2) o conjunto de instituciones (ids cortos de OpenAlex). */
  country?: string;
  institutions?: string[];
  title: string;
  t: T;
}

/**
 * Los estudios más relevantes de un país o departamento, solo con el título; cada
 * título es un enlace que abre el estudio en una pestaña nueva. Se piden en vivo a
 * OpenAlex (no dependen de la muestra del análisis), así siempre hay varios.
 */
export function GeoWorksList({ query, country, institutions, title, t }: GeoWorksListProps) {
  const key = JSON.stringify([query, country ?? null, institutions ?? null]);
  const [fetched, setFetched] = useState<({ key: string } & Partial<Loaded> & { failed?: boolean }) | null>(null);

  useEffect(() => {
    if (cache.has(key)) return;
    let cancelled = false;
    getGeoWorks({ query, country, institutions, limit: 8 })
      .then((result) => {
        if (!Array.isArray(result?.works)) throw new Error("respuesta inválida");
        cache.set(key, result);
        if (!cancelled) setFetched({ key, ...result });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [key, query, country, institutions]);

  const loaded: Loaded | undefined = cache.get(key) ?? (fetched?.key === key && fetched.works ? { total: fetched.total ?? 0, works: fetched.works } : undefined);
  const failed = !loaded && fetched?.key === key && fetched.failed;

  return (
    <div className="research-box">
      <span className="eyebrow">{title}</span>
      {failed ? (
        <p className="research-empty">{t("worksError")}</p>
      ) : !loaded ? (
        <p className="research-empty" aria-busy="true">
          {t("worksLoading")}
        </p>
      ) : loaded.works.length === 0 ? (
        <p className="research-empty">{t("worksEmpty")}</p>
      ) : (
        <>
          <ul className="research-list">
            {loaded.works.map((work) => (
              <li key={work.id}>
                <a href={work.url} target="_blank" rel="noreferrer noopener">
                  {work.title}
                </a>
              </li>
            ))}
          </ul>
          {loaded.total > loaded.works.length && (
            <p className="research-empty">{t("worksMore", { n: loaded.works.length, total: loaded.total.toLocaleString() })}</p>
          )}
        </>
      )}
    </div>
  );
}
