import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
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

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

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

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">{t("unicor.badge", "Repositorio institucional y bases especializadas")}</p>
        <h1 className="text-2xl font-semibold text-ink-primary mt-1">{t("unicor.title", "Panel de búsqueda")}</h1>
        <p className="text-ink-secondary mt-2">
          {t(
            "unicor.subtitle",
            "Busca en el repositorio de la Universidad de Córdoba o elige IEEE Xplore, Springer Nature, Scopus o todas a la vez."
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-600" />
            {t("unicor.formTitle", "¿Qué quieres buscar?")}
          </CardTitle>
          <CardDescription>
            {isRepository
              ? t("unicor.formDesc", "Escribe un tema o déjalo vacío para ver lo más reciente del periodo seleccionado.")
              : t("unicor.formDescExternal", "Escribe un tema: las bases externas necesitan palabras clave para buscar.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4" noValidate>
            <SourcePicker value={sources} onChange={changeSource} disabled={isSearching} />

            <label className="block text-sm font-medium text-ink-primary">
              {t("unicor.queryLabel", "Tema, autor o palabras clave")}
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
                {isRepository ? t("unicor.sizeLabel", "Resultados por página") : t("unicor.perSourceLabel", "Resultados por fuente")}
                <select value={size} onChange={(e) => setSize(Number(e.target.value))} className={inputClass}>
                  {sizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSearching}>
                <Search size={17} />
                {isSearching ? t("unicor.searching", "Consultando...") : t("unicor.submitBtn", "Buscar")}
              </Button>
              <Button type="button" variant="ghost" onClick={clearSearch} disabled={isSearching}>
                <X size={17} />
                {t("unicor.clearBtn", "Limpiar")}
              </Button>
            </div>

            {error && (
              <p id="panel-error" className="text-sm text-status-critical-text" role="alert">
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {uniResult && !error && (
        <p className="text-sm text-ink-secondary" aria-live="polite">
          <span className="font-semibold text-ink-primary">{uniResult.totalElementos.toLocaleString()}</span>{" "}
          {t("unicor.resultsFound", "documentos encontrados desde")} {uniResult.desdeAnio}
          {submitted.q && (
            <>
              {" "}
              {t("unicor.for", "para")} <span className="font-medium text-ink-primary">“{submitted.q}”</span>
            </>
          )}
        </p>
      )}

      {multiResult && !error && <SourceSummary result={multiResult} query={submitted.q} />}

      {isSearching && !hasResult && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-44 rounded-xl border border-border bg-surface-muted animate-pulse" />
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
        <p className="py-10 text-center text-sm text-ink-muted">
          {t("unicor.noResults", "No encontramos documentos con esos criterios. Prueba otras palabras o amplía el periodo.")}
        </p>
      )}

      {isRepository && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label={t("unicor.pagination", "Paginación")}>
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={isSearching || currentPage === 0}>
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

      {selected && <DocumentModal doc={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
