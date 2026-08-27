import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import { mockArticles } from "@/data/mockArticles";
import { mockSources } from "@/data/mockAnalysis";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { SourceBadge } from "@/components/cards/SourceBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Article } from "@/types/article";

export function Articles() {
  const { articles: contextArticles, sources: contextSources } = useResearch();
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articles = contextArticles.length > 0 ? contextArticles : mockArticles;
  const sources = contextSources.length > 0 ? contextSources : mockSources;

  useEffect(() => {
    setSelectedArticle(null);
  }, [query]);

  const filtered = articles.filter((a) =>
    `${a.title} ${a.authors.join(" ")} ${a.mainConcepts.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Explorar literatura</h1>
        <p className="text-ink-secondary mt-2 leading-relaxed">
          Investigaciones científicas recuperadas de múltiples fuentes académicas para tu idea.
        </p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor o concepto..."
          className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 text-sm focus-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((article) => (
          <ArticleCard key={article.id} article={article} onOpen={setSelectedArticle} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-ink-muted sm:col-span-2 py-8 text-center">
            No se encontraron investigaciones que coincidan con tu búsqueda.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fuentes consultadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sources.map((source) => (
            <SourceBadge key={source.name} source={source} />
          ))}
        </CardContent>
      </Card>

      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
