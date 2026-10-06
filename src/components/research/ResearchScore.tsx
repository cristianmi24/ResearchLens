import { BookMarked, GitCompareArrows, TrendingUp, Sparkles } from "lucide-react";
import type { ResearchIndicators } from "@/types/research";
import { formatNumber } from "@/utils/formatting";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/i18n/LanguageContext";

interface ResearchScoreProps {
  indicators: ResearchIndicators;
}

export function ResearchScore({ indicators }: ResearchScoreProps) {
  const { t } = useLanguage();

  const trendLabels: Record<ResearchIndicators["trend"], string> = {
    creciente: t("score.trendGrowing", "📈 En crecimiento"),
    estable: t("score.trendStable", "➡️ Estable"),
    decreciente: t("score.trendDeclining", "📉 En disminución"),
  };

  const items = [
    {
      icon: BookMarked,
      label: t("score.relatedLiterature", "Literatura relacionada"),
      value: `${formatNumber(indicators.relatedStudiesCount)} ${t("score.studies", "estudios")}`,
    },
    {
      icon: GitCompareArrows,
      label: t("score.averageSimilarity", "Similitud promedio"),
      value: indicators.averageSimilarityLabel,
    },
    {
      icon: TrendingUp,
      label: t("score.trend", "Tendencia"),
      value: trendLabels[indicators.trend],
    },
    {
      icon: Sparkles,
      label: t("score.differentiation", "Posible diferenciación"),
      value: indicators.differentiationLabel,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <item.icon size={18} className="text-brand-600 mb-2" />
          <p className="text-xs text-ink-secondary">{item.label}</p>
          <p className="text-lg font-semibold text-ink-primary mt-0.5">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
