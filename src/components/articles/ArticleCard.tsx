import { ChevronRight } from "lucide-react";
import type { Article } from "@/types/article";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SimilarityBadge } from "./SimilarityBadge";
import { useLanguage } from "@/i18n/LanguageContext";

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
}

export function ArticleCard({ article, onOpen }: ArticleCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="p-5 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink-primary leading-snug">{article.title}</h3>
          <p className="text-sm text-ink-secondary mt-1">
            {article.authors.join(", ")} · {article.year}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">{article.source}</p>
        </div>
        <SimilarityBadge percent={article.similarityPercent} />
      </div>

      <div className="mt-4 rounded-lg bg-surface-muted px-3 py-2.5">
        <p className="text-xs font-medium text-ink-secondary mb-0.5">
          {t("article.whySimilar", "¿Por qué se parece?")}
        </p>
        <p className="text-sm text-ink-primary">{article.similarityReason}</p>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => onOpen(article)}>
          {t("article.viewResearch", "Ver investigación")}
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}
