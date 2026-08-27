import { BookMarked, GitCompareArrows, TrendingUp, Sparkles } from "lucide-react";
import type { ResearchIndicators } from "@/types/research";
import { formatNumber } from "@/utils/formatting";
import { Card } from "@/components/ui/Card";

interface ResearchScoreProps {
  indicators: ResearchIndicators;
}

const trendLabel: Record<ResearchIndicators["trend"], string> = {
  creciente: "📈 En crecimiento",
  estable: "➡️ Estable",
  decreciente: "📉 En disminución",
};

export function ResearchScore({ indicators }: ResearchScoreProps) {
  const items = [
    {
      icon: BookMarked,
      label: "Literatura relacionada",
      value: `${formatNumber(indicators.relatedStudiesCount)} estudios`,
    },
    {
      icon: GitCompareArrows,
      label: "Similitud promedio",
      value: indicators.averageSimilarityLabel,
    },
    {
      icon: TrendingUp,
      label: "Tendencia",
      value: trendLabel[indicators.trend],
    },
    {
      icon: Sparkles,
      label: "Posible diferenciación",
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
