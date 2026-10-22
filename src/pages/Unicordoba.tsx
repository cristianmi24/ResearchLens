import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, GraduationCap, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { searchUnicordoba, type UnicordobaItem, type UnicordobaSearchResult } from "@/services/unicordobaApi";
import { useLanguage } from "@/i18n/LanguageContext";

const REPOSITORY_URL = "https://repositorio.unicordoba.edu.co";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const YEARS_OPTIONS = [1, 3, 5, 10, 20];

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function repositorySearchLink(title: string): string {
  return `${REPOSITORY_URL}/search?query=${encodeURIComponent(`"${title}"`)}`;
}

export function Unicordoba() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [years, setYears] = useState(5);
  const [size, setSize] = useState(20);
  const [submitted, setSubmitted] = useState({ q: "", years: 5, size: 20, page: 0 });
  const [result, setResult] = useState<UnicordobaSearchResult | null>(null);
  const [selected, setSelected] = useState<UnicordobaItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsSearching(true);
    setError("");
    searchUnicordoba(submitted)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setResult(null);
        setError(err instanceof Error ? err.message : t("unicor.error", "No fue posible consultar el repositorio."));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submitted, t]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted({ q: query.trim(), years, size, page: 0 });
  }

  function clearSearch() {
    setQuery("");
    setYears(5);
    setSize(20);
    setSubmitted({ q: "", years: 5, size: 20, page: 0 });
  }

  function goToPage(page: number) {
    setSubmitted((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalPages = result?.totalPaginas ?? 0;
  const currentPage = submitted.page;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">{t("unicor.badge", "Repositorio institucional")}</p>
        <h1 className="text-2xl font-semibold text-ink-primary mt-1">
          {t("unicor.title", "Repositorio Universidad de Córdoba")}
        </h1>
        <p className="text-ink-secondary mt-2">
          {t(
            "unicor.subtitle",
            "Consulta tesis, trabajos de grado y producción académica publicada en el repositorio de la Unicórdoba."
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-600" />
            {t("unicor.formTitle", "Pedir al repositorio")}
          </CardTitle>
          <CardDescription>
            {t("unicor.formDesc", "Escribe un tema o déjalo vacío para ver lo más reciente del periodo seleccionado.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block text-sm font-medium text-ink-primary">
              {t("unicor.queryLabel", "Tema, autor o palabras clave")}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("unicor.queryPlaceholder", "Ej. dengue, ganadería, educación rural")}
                maxLength={200}
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink-primary">
                {t("unicor.yearsLabel", "Periodo")}
                <select value={years} onChange={(e) => setYears(Number(e.target.value))} className={inputClass}>
                  {YEARS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 1
                        ? t("unicor.lastYear", "Último año")
                        : `${t("unicor.lastYears", "Últimos")} ${option} ${t("unicor.yearsUnit", "años")}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ink-primary">
                {t("unicor.sizeLabel", "Resultados por página")}
                <select value={size} onChange={(e) => setSize(Number(e.target.value))} className={inputClass}>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSearching}>
                <Search size={17} />
                {isSearching ? t("unicor.searching", "Consultando...") : t("unicor.submitBtn", "Buscar en el repositorio")}
              </Button>
              <Button type="button" variant="ghost" onClick={clearSearch} disabled={isSearching}>
                <X size={17} />
                {t("unicor.clearBtn", "Limpiar")}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-status-critical-text" role="alert">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {result && !error && (
        <p className="text-sm text-ink-secondary" aria-live="polite">
          <span className="font-semibold text-ink-primary">{result.totalElementos.toLocaleString()}</span>{" "}
          {t("unicor.resultsFound", "documentos encontrados desde")} {result.desdeAnio}
          {submitted.q && (
            <>
              {" "}{t("unicor.for", "para")} <span className="font-medium text-ink-primary">“{submitted.q}”</span>
            </>
          )}
        </p>
      )}

      {isSearching && !result && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-44 rounded-xl border border-border bg-surface-muted animate-pulse" />
          ))}
        </div>
      )}

      {result && result.resultados.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 transition-opacity ${isSearching ? "opacity-50" : ""}`}>
          {result.resultados.map((item, index) => (
            <Card
              key={`${currentPage}-${index}-${item.titulo}`}
              className="flex flex-col p-5 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Badge tone="brand">{item.anio || "s.f."}</Badge>
                <Badge>Unicórdoba</Badge>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink-primary leading-snug line-clamp-3">{item.titulo}</h3>
              {item.autor.length > 0 && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-secondary">
                  <User size={13} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{item.autor.join("; ")}</span>
                </p>
              )}
              {item.abstract && (
                <p className="mt-3 text-sm text-ink-secondary line-clamp-4">{item.abstract}</p>
              )}
              <div className="mt-auto pt-4">
                <Button size="sm" variant="outline" onClick={() => setSelected(item)}>
                  <BookOpen size={15} />
                  {t("unicor.viewMore", "Ver resumen completo")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {result && !isSearching && !error && result.resultados.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-muted">
          {t("unicor.noResults", "No encontramos documentos con esos criterios. Prueba otras palabras o amplía el periodo.")}
        </p>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label={t("unicor.pagination", "Paginación")}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={isSearching || currentPage === 0}
          >
            <ChevronLeft size={16} />
            {t("unicor.prev", "Anterior")}
          </Button>
          <span className="text-sm text-ink-secondary">
            {t("unicor.page", "Página")} {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={isSearching || currentPage >= totalPages - 1}
          >
            {t("unicor.next", "Siguiente")}
            <ChevronRight size={16} />
          </Button>
        </nav>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={t("unicor.close", "Cerrar")}
            className="absolute inset-0 bg-ink-primary/40 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={t("unicor.close", "Cerrar")}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-secondary hover:bg-surface-muted focus-ring"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 pr-10">
              <Badge tone="brand">{selected.anio || "s.f."}</Badge>
              <Badge>Unicórdoba</Badge>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-ink-primary leading-snug">{selected.titulo}</h2>
            {selected.autor.length > 0 && (
              <p className="mt-2 text-sm text-ink-secondary">{selected.autor.join("; ")}</p>
            )}
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t("unicor.abstract", "Resumen")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-primary whitespace-pre-line">
              {selected.abstract || t("unicor.noAbstract", "Este documento no tiene resumen disponible.")}
            </p>
            <a
              href={repositorySearchLink(selected.titulo)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <ExternalLink size={15} />
              {t("unicor.openRepo", "Abrir en el repositorio Unicórdoba")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
