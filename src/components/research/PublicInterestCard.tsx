import { LineChart as LineChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PublicInterestChart } from "@/components/charts/PublicInterestChart";
import type { PublicInterestAnalysis } from "@/types/research";

interface PublicInterestCardProps {
  data: PublicInterestAnalysis;
}

const trendLabel: Record<PublicInterestAnalysis["trend"], string> = {
  creciente: "📈 En crecimiento",
  estable: "➡️ Estable",
  decreciente: "📉 En disminución",
};

function correlationLabel(r: number | null): string {
  if (r === null) return "Sin suficientes años en común para calcularla";
  const magnitude = Math.abs(r);
  const strength = magnitude >= 0.7 ? "fuerte" : magnitude >= 0.4 ? "moderada" : "débil";
  const direction = r >= 0 ? "positiva" : "negativa";
  return `${strength} y ${direction} (r = ${r.toFixed(2)})`;
}

export function PublicInterestCard({ data }: PublicInterestCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon size={18} className="text-brand-600 shrink-0" />
            Interés público (Google Trends)
          </CardTitle>
          <CardDescription>
            Búsquedas de "{data.keyword}" en los últimos 24 meses, calculado con regresión lineal sobre la serie
            de interés.
          </CardDescription>
        </div>
        <span className="shrink-0 text-sm font-medium text-ink-secondary">{trendLabel[data.trend]}</span>
      </CardHeader>
      <CardContent>
        <PublicInterestChart data={data.timeline} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-ink-secondary">Correlación con publicaciones académicas</p>
            <p className="text-ink-primary font-medium mt-0.5">
              {correlationLabel(data.correlationWithAcademicTrend)}
            </p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-ink-secondary">Ajuste de la tendencia (R²)</p>
            <p className="text-ink-primary font-medium mt-0.5">{(data.r2 * 100).toFixed(0)}%</p>
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-3">{data.method}</p>
      </CardContent>
    </Card>
  );
}
