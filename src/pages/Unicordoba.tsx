import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Library, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  searchMultiSource,
  searchUnicordoba,
  sourcesFor,
  type MultiSourceResult,
  type PanelDocument,
  type PanelSourceId,
  type UnicordobaSearchResult,
} from "@/services/unicordobaApi";
import { SourcePicker } from "@/components/unicordoba/SourcePicker";
import { DocumentCard, DocumentModal, SourceSummary } from "@/components/unicordoba/DocumentViews";
import { useLanguage } from "@/i18n/LanguageContext";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const PER_SOURCE_OPTIONS = [5, 10, 15, 25];
const YEARS_OPTIONS = [1, 3, 5, 10, 20];

const selectClass =
  "mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

// Temas de ejemplo: un clic los escribe en el buscador, para quien no sabe por dónde empezar.
const EXAMPLE_QUERIES = ["inteligencia artificial en educación", "dengue", "agricultura sostenible", "salud mental en universitarios"];

interface Submitted {
  sources: PanelSourceId[];
  q: string;
  years: number;
  size: number;
  page: number;
}

const INITIAL: Submitted = { sources: ["unicordoba"], q: "", years: 5, size: 20, page: 0 };

/**
 * Panel de búsqueda: el repositorio de Unicórdoba (paginado) y, a elección del usuario, IEEE Xplore,
 * Springer Nature y Scopus, que por su cuota limitada solo se consultan desde aquí.
 */
export function Unicordoba() {
  const { t } = useLanguage();
  const [sources, setSources] = useState<PanelSourceId[]>(INITIAL.sources);
  const [query, setQuery] = useState("");
  const [years, setYears] = useState(INITIAL.years);
  const [size, setSize] = useState(INITIAL.size);
  const [submitted, setSubmitted] = useState<Submitted>(INITIAL);
  const [uniResult, setUniResult] = useState<UnicordobaSearchResult | null>(null);
  const [multiResult, setMultiResult] = useState<MultiSourceResult | null>(null);
  const [selected, setSelected] = useState<PanelDocument | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const isRepository = submitted.sources.length === 1 && submitted.sources[0] === "unicordoba";

  useEffect(() => {
    let cancelled = false;
    setIsSearching(true);
    setError("");
    const request = isRepository
      ? searchUnicordoba(submitted).then((data) => {
          if (!cancelled) {
            setUniResult(data);
            setMultiResult(null);
          }
        })
      : searchMultiSource({ q: submitted.q, sources: sourcesFor(submitted.sources), size: submitted.size, years: submitted.years }).then(
          (data) => {
            if (!cancelled) {
              setMultiResult(data);
              setUniResult(null);
            }
          }
        );
    request
      .catch((err) => {
        if (cancelled) return;
        setUniResult(null);
        setMultiResult(null);
        setError(err instanceof Error ? err.message : t("unicor.error", "No fue posible consultar el repositorio."));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submitted, isRepository, t]);

  function changeSource(next: PanelSourceId[]) {
    setSources(next);
    setError("");
    // Las bases externas devuelven pocos resultados por fuente: se ajusta el tamaño a sus opciones.
    const onlyRepository = next.length === 1 && next[0] === "unicordoba";
    if (!onlyRepository && !PER_SOURCE_OPTIONS.includes(size)) setSize(10);
    if (onlyRepository && !PAGE_SIZE_OPTIONS.includes(size)) setSize(20);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!(sources.length === 1 && sources[0] === "unicordoba") && q.length < 2) {
      setError(t("unicor.queryRequired", "Escribe un tema para buscar en las bases académicas."));
      return;
    }
    setSubmitted({ sources, q, years, size, page: 0 });
  }

  function clearSearch() {
    setQuery("");
    setSources(INITIAL.sources);
    setYears(INITIAL.years);
    setSize(INITIAL.size);
    setSubmitted(INITIAL);
  }

  function goToPage(page: number) {
    setSubmitted((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const documents: PanelDocument[] = uniResult
    ? uniResult.resultados.map((item, i) => ({
        id: `${submitted.page}-${i}-${item.titulo}`,
        title: item.titulo,
        authors: item.autor,
        year: item.anio,
        abstract: item.abstract,
        doi: "",
        source: "Unicórdoba",
      }))
    : multiResult?.articles ?? [];
  const hasResult = Boolean(uniResult || multiResult);
  const totalPages = uniResult?.totalPaginas ?? 0;
  const currentPage = submitted.page;
  const sizeOptions = isRepository ? PAGE_SIZE_OPTIONS : PER_SOURCE_OPTIONS;

  function searchExample(example: string) {
    // Un ejemplo busca en las tres fuentes abiertas, que no gastan cuota.
    const open: PanelSourceId[] = ["semantic", "openalex", "crossref"];
    setQuery(example);
    setSources(open);
    setSize(10);
    setError("");
    setSubmitted({ sources: open, q: example, years, size: 10, page: 0 });
  }

  const sizeLabel = isRepository ? t("unicor.sizeLabel", "Resultados por página") : t("unicor.perSourceLabel", "Resultados por fuente");

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pastel-sky via-pastel-lavender to-pastel-aqua p-6 sm:p-8">
        <span className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/40" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-pastel-mint/70 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-brand-600 shadow-sm sm:flex">
            <Library size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              {t("unicor.badge", "Repositorio institucional y bases especializadas")}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-ink-primary">{t("unicor.title", "Buscar literatura")}</h1>
            <p className="mt-2 max-w-2xl text-ink-secondary">
              {t("unicor.subtitle", "Consulta el repositorio de la Universidad de Córdoba y las principales bases académicas desde un solo lugar.")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative mt-6" noValidate>
          <div className="flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t("unicor.queryLabel", "Tema, autor o palabras clave")}</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError("");
                }}
                placeholder={t("unicor.queryPlaceholder", "Ej. dengue, ganadería, educación rural")}
                maxLength={200}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "panel-error" : undefined}
                className="h-12 w-full rounded-2xl bg-transparent pl-11 pr-10 text-base text-ink-primary outline-none placeholder:text-ink-muted focus:bg-pastel-lavender/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("history.clearSearch", "Borrar búsqueda")}
                  title={t("history.clearSearch", "Borrar búsqueda")}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink-primary focus-ring"
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <Button type="submit" size="lg" disabled={isSearching} className="sm:min-w-36">
              <Search size={17} />
              {isSearching ? t("unicor.searching", "Consultando...") : t("unicor.submitBtn", "Buscar")}
            </Button>
          </div>
          {error && (
            <p id="panel-error" className="mt-3 rounded-2xl bg-white/90 px-4 py-2.5 text-sm font-semibold text-status-critical-text" role="alert">
              {error}
            </p>
          )}
        </form>

        {/* Sugerencias de tema: un clic busca en las fuentes abiertas (sin gastar cuota). Se ocultan al buscar algo propio. */}
        {!submitted.q && (
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{t("unicor.emptyTitle", "Prueba con")}</span>
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => searchExample(example)}
                disabled={isSearching}
                className="min-h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-white focus-ring disabled:opacity-60"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-white/90 p-5 shadow-[var(--shadow-card)]">
        <SourcePicker value={sources} onChange={changeSource} disabled={isSearching} />

        <div className="mt-4 border-t border-border/70 pt-3">
          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            aria-expanded={showOptions}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-ink-secondary hover:text-brand-700 focus-ring"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            {t("unicor.moreOptions", "Periodo y cantidad de resultados")}
            <span className="rounded-full bg-pastel-lavender px-2 py-0.5 text-[11px] text-pastel-lavender-ink">
              {years === 1 ? t("unicor.lastYear", "Último año") : `${years} ${t("unicor.yearsUnit", "años")}`} · {size}
            </span>
          </button>
          {showOptions && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink-primary">
                {t("unicor.yearsLabel", "Periodo")}
                <select value={years} onChange={(e) => setYears(Number(e.target.value))} className={selectClass}>
                  {YEARS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 1 ? t("unicor.lastYear", "Último año") : `${t("unicor.lastYears", "Últimos")} ${option} ${t("unicor.yearsUnit", "años")}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-ink-primary">
                {sizeLabel}
                <select value={size} onChange={(e) => setSize(Number(e.target.value))} className={selectClass}>
                  {sizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      {(uniResult || multiResult) && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {uniResult && (
              <p className="text-sm text-ink-secondary" aria-live="polite">
                <span className="font-serif text-xl font-bold text-ink-primary">{uniResult.totalElementos.toLocaleString()}</span>{" "}
                {t("unicor.resultsFound", "documentos encontrados desde")} {uniResult.desdeAnio}
                {submitted.q && (
                  <>
                    {" "}
                    {t("unicor.for", "para")} <span className="font-semibold text-ink-primary">«{submitted.q}»</span>
                  </>
                )}
              </p>
            )}
            {multiResult && <SourceSummary result={multiResult} query={submitted.q} />}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearSearch} disabled={isSearching}>
            <X size={15} />
            {t("unicor.clearBtn", "Limpiar")}
          </Button>
        </div>
      )}

      {isSearching && !hasResult && (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-gradient-to-br from-pastel-lavender/60 to-pastel-sky/50" />
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 transition-opacity ${isSearching ? "opacity-50" : ""}`}>
          {documents.map((doc) => (
            <DocumentCard key={`${doc.source}-${doc.id}`} doc={doc} onOpen={() => setSelected(doc)} />
          ))}
        </div>
      )}

      {hasResult && !isSearching && !error && documents.length === 0 && (
        <div className="rounded-3xl border border-border bg-white px-6 py-10 text-center">
          <p className="text-sm text-ink-secondary">
            {t("unicor.noResults", "No encontramos documentos con esos criterios. Prueba otras palabras o amplía el periodo.")}
          </p>
        </div>
      )}

      {isRepository && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label={t("unicor.pagination", "Paginación")}>
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={isSearching || currentPage === 0}>
            <ChevronLeft size={16} />
            {t("unicor.prev", "Anterior")}
          </Button>
          <span className="rounded-full bg-pastel-lavender px-3 py-1 text-sm font-semibold text-pastel-lavender-ink">
            {t("unicor.page", "Página")} {currentPage + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={isSearching || currentPage >= totalPages - 1}>
            {t("unicor.next", "Siguiente")}
            <ChevronRight size={16} />
          </Button>
        </nav>
      )}

      {selected && <DocumentModal doc={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
