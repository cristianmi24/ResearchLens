import { ExternalLink, X } from "lucide-react";
import type { Article } from "@/types/article";
import { Badge, Chip } from "@/components/ui/Badge";
import { ResearchComparison } from "@/components/research/ResearchComparison";
import { similarityToLabel } from "@/utils/similarity";

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
}

export function ArticleDetail({ article, onClose }: ArticleDetailProps) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Cerrar detalle"
        onClick={onClose}
        className="absolute inset-0 bg-ink-primary/40 animate-fade-in"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl animate-slide-up overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <span className="text-xs font-medium text-ink-muted">Detalle de investigación</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-ink-secondary hover:bg-surface-muted focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-ink-primary leading-snug">{article.title}</h2>
            <p className="text-sm text-ink-secondary mt-2">{article.authors.join(", ")}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge tone="brand">{article.source}</Badge>
              <Badge tone="neutral">{article.year}</Badge>
              <Badge tone={similarityToLabel(article.similarityPercent) === "Alta" ? "good" : "warning"}>
                Similitud {similarityToLabel(article.similarityPercent).toLowerCase()} · {article.similarityPercent}%
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-primary mb-2">Abstract</h3>
            <p className="text-sm text-ink-secondary leading-relaxed">{article.abstract}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-primary mb-2">Conceptos principales</h3>
            <div className="flex flex-wrap gap-2">
              {article.mainConcepts.map((concept) => (
                <Chip key={concept}>{concept}</Chip>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-primary mb-1">¿En qué se parece? ¿En qué se diferencia?</h3>
            <p className="text-xs text-ink-muted mb-3">
              Comparación entre los elementos de tu idea y los de esta investigación.
            </p>
            <ResearchComparison fields={article.comparison} />
          </div>

          <a
            href={`https://doi.org/${article.doi}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 focus-ring rounded"
          >
            DOI: {article.doi}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
