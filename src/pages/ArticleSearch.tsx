import { useState } from "react";
import { ArrowDownUp, Search, X } from "lucide-react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { searchArticles } from "@/services/researchApi";
import type { Article } from "@/types/article";
import { useLanguage } from "@/i18n/LanguageContext";

type SourceFilter = "all" | Article["source"];
type SortOrder = "relevance" | "newest" | "oldest";

export function ArticleSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("relevance");
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setError("");
    try {
      setArticles(await searchArticles({ query, category, year }));
    } catch (err) {
      setArticles([]);
      setError(err instanceof Error ? err.message : t("search.error", "No fue posible consultar las fuentes académicas."));
    } finally {
      setIsSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setCategory("");
    setYear("");
    setSource("all");
    setSortOrder("relevance");
    setArticles([]);
    setError("");
  }

  const visibleArticles = articles
    .filter((article) => source === "all" || article.source === source)
    .sort((first, second) => {
      if (sortOrder === "newest") return second.year - first.year;
      if (sortOrder === "oldest") return first.year - second.year;
      return second.similarityPercent - first.similarityPercent;
    });

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">{t("search.badge", "Búsqueda independiente")}</p>
        <h1 className="text-2xl font-semibold text-ink-primary mt-1">{t("search.title", "Nueva búsqueda de artículos")}</h1>
        <p className="text-ink-secondary mt-2">
          {t("search.subtitle", "Consulta publicaciones en Semantic Scholar, OpenAlex y Crossref sin alterar tu análisis actual. Esta búsqueda no se guarda.")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={18} className="text-brand-600" />
            {t("search.formTitle", "Buscar artículos")}
          </CardTitle>
          <CardDescription>
            {t("search.formDesc", "Combina palabras clave con filtros para revisar evidencia más pertinente.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-ink-primary">
                {t("search.queryLabel", "Tema o palabras clave")}
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search.queryPlaceholder", "Ej. aprendizaje automático")}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="text-sm font-medium text-ink-primary">
                {t("search.categoryLabel", "Categoría")}
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t("search.categoryPlaceholder", "Ej. educación")}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium text-ink-primary">
                {t("search.yearLabel", "Año")}
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">{t("search.yearAll", "Todos")}</option>
                  {Array.from({ length: 15 }, (_, index) => new Date().getFullYear() - index).map((itemYear) => (
                    <option key={itemYear} value={itemYear}>{itemYear}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-ink-primary">
                {t("search.sourceLabel", "Fuente")}
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as SourceFilter)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="all">{t("search.sourceAll", "Todas las fuentes")}</option>
                  <option value="Semantic Scholar">Semantic Scholar</option>
                  <option value="OpenAlex">OpenAlex</option>
                  <option value="Crossref">Crossref</option>
                </select>
              </label>

              <label className="text-sm font-medium text-ink-primary">
                {t("search.sortLabel", "Ordenar por")}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="relevance">{t("search.sortRelevance", "Relevancia")}</option>
                  <option value="newest">{t("search.sortNewest", "Más recientes")}</option>
                  <option value="oldest">{t("search.sortOldest", "Más antiguos")}</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSearching || !query.trim()}>
                <Search size={17} />
                {isSearching ? t("search.searching", "Buscando...") : t("search.submitBtn", "Buscar artículos")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearSearch}
                disabled={!query && !category && !year && source === "all"}
              >
                <X size={17} />
                {t("search.clearBtn", "Limpiar")}
              </Button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-status-critical-text" role="alert">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {articles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-secondary">
            {visibleArticles.length} {t("search.articlesShown", "artículos mostrados")}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <ArrowDownUp size={14} />
            {sortOrder === "relevance"
              ? t("search.sortedByRelevance", "Ordenados por relevancia")
              : sortOrder === "newest"
              ? t("search.sortedNewest", "Más recientes primero")
              : t("search.sortedOldest", "Más antiguos primero")}
          </span>
        </div>
      )}

      {visibleArticles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleArticles.map((article) => (
            <ArticleCard
              key={`${article.source}-${article.id}`}
              article={article}
              onOpen={setSelectedArticle}
            />
          ))}
        </div>
      )}

      {!isSearching && query && !error && visibleArticles.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-muted">
          {t("search.noResults", "No encontramos artículos con esos filtros.")}
        </p>
      )}

      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}