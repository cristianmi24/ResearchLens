import { LineChart as LineChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PublicInterestChart } from "@/components/charts/PublicInterestChart";
import type { PublicInterestAnalysis } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";

interface PublicInterestCardProps {
  data: PublicInterestAnalysis;
}

export function PublicInterestCard({ data }: PublicInterestCardProps) {
  const { t } = useLanguage();

  const trendLabels: Record<PublicInterestAnalysis["trend"], string> = {
    creciente: t("score.trendGrowing", "📈 En crecimiento"),
    estable: t("score.trendStable", "➡️ Estable"),
    decreciente: t("score.trendDeclining", "📉 En disminución"),
  };

  function getCorrelationLabel(r: number | null): string {
    if (r === null) return t("publicInterest.noData", "Sin suficientes años en común para calcularla");
    const magnitude = Math.abs(r);
    const strength =
      magnitude >= 0.7
        ? t("publicInterest.strong", "fuerte")
        : magnitude >= 0.4
        ? t("publicInterest.moderate", "moderada")
        : t("publicInterest.weak", "débil");
    const direction =
      r >= 0 ? t("publicInterest.positive", "positiva") : t("publicInterest.negative", "negativa");
    return `${strength} & ${direction} (r = ${r.toFixed(2)})`;
  }

  const desc = t(
    "publicInterest.desc",
    `Búsquedas de "${data.keyword}" en los últimos 24 meses, calculado con regresión lineal sobre la serie de interés.`
  ).replace("{keyword}", data.keyword);

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon size={18} className="text-brand-600 shrink-0" />
            {t("publicInterest.title", "Interés público (Google Trends)")}
          </CardTitle>
          <CardDescription>{desc}</CardDescription>
        </div>
        <span className="shrink-0 text-sm font-medium text-ink-secondary">{trendLabels[data.trend]}</span>
      </CardHeader>
      <CardContent>
        <PublicInterestChart data={data.timeline} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-ink-secondary">
              {t("publicInterest.correlation", "Correlación con publicaciones académicas")}
            </p>
            <p className="text-ink-primary font-medium mt-0.5">
              {getCorrelationLabel(data.correlationWithAcademicTrend)}
            </p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-ink-secondary">
              {t("publicInterest.fit", "Ajuste de la tendencia (R²)")}
            </p>
            <p className="text-ink-primary font-medium mt-0.5">{(data.r2 * 100).toFixed(0)}%</p>
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-3">{data.method}</p>
      </CardContent>
    </Card>
  );
}
