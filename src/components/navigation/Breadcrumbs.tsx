import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

// Ruta → [clave de traducción, texto por defecto, ruta padre]. Las pantallas del flujo de análisis
// cuelgan de "Mi idea" para que el usuario vea en qué paso del recorrido está.
const crumbs: Record<string, [TranslationKey | string, string, string?]> = {
  "/inicio": ["nav.home", "Inicio"],
  "/idea": ["nav.idea", "Mi idea", "/inicio"],
  "/analysis": ["breadcrumb.analysis", "Diagnóstico", "/idea"],
  "/results": ["breadcrumb.results", "Resultados", "/analysis"],
  "/map": ["breadcrumb.map", "Mapa de investigación", "/results"],
  "/opportunities": ["breadcrumb.opportunities", "Oportunidades", "/results"],
  "/refine": ["breadcrumb.refine", "Refinar pregunta", "/opportunities"],
  "/article-search": ["nav.search", "Buscar literatura", "/inicio"],
  "/unicordoba": ["nav.search", "Buscar literatura", "/inicio"],
  "/projects": ["nav.projects", "Mis proyectos", "/inicio"],
  "/history": ["nav.history", "Mi historial", "/inicio"],
  "/settings": ["nav.settings", "Configuración", "/inicio"],
};

function trail(pathname: string): string[] {
  // /projects/:id se muestra como hijo de "Mis proyectos".
  const base = pathname.startsWith("/projects/") ? "/projects" : pathname;
  const chain: string[] = [];
  let current: string | undefined = base;
  while (current && crumbs[current] && !chain.includes(current)) {
    chain.unshift(current);
    current = crumbs[current][2];
  }
  if (base !== pathname) chain.push(pathname);
  return chain;
}

/** Migas de pan: muestran dónde está el usuario y permiten volver a cualquier nivel anterior con un clic. */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const chain = trail(pathname);
  if (chain.length <= 1) return null;

  return (
    <nav aria-label={t("breadcrumb.label", "Ruta de navegación")} className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-secondary">
        {chain.map((path, i) => {
          const isLast = i === chain.length - 1;
          const label = crumbs[path] ? t(crumbs[path][0], crumbs[path][1]) : t("breadcrumb.detail", "Detalle");
          return (
            <li key={path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} aria-hidden="true" className="text-ink-muted" />}
              {isLast ? (
                <span aria-current="page" className="font-semibold text-ink-primary">
                  {label}
                </span>
              ) : (
                <Link to={path} className="focus-ring inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-brand-600 hover:underline">
                  {i === 0 && <Home size={14} aria-hidden="true" />}
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
