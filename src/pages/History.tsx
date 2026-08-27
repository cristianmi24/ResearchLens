import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { UsageChart } from "@/components/charts/UsageChart";
import { getHistory, getUsage } from "@/services/researchApi";
import { useResearch } from "@/hooks/useResearch";
import type { DailyUsagePoint, SessionHistoryEntry, UsageStatus } from "@/types/research";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
}

export function History() {
  const navigate = useNavigate();
  const { loadSession } = useResearch();
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [analyses, setAnalyses] = useState<SessionHistoryEntry[]>([]);
  const [activityByDay, setActivityByDay] = useState<DailyUsagePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getUsage(), getHistory()]).then(([usageData, historyData]) => {
      setUsage(usageData);
      setAnalyses(historyData.analyses);
      setActivityByDay(historyData.activityByDay);
      setIsLoading(false);
    });
  }, []);

  async function handleOpen(id: string) {
    if (openingId) return;
    setOpeningId(id);
    try {
      await loadSession(id);
      navigate("/results");
    } finally {
      setOpeningId(null);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Cargando tu historial…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Tu historial</h1>
        <p className="text-ink-secondary mt-2">Cada análisis que corres queda registrado solo en tu cuenta.</p>
      </div>

      {usage && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge size={18} className="text-brand-600" />
                Uso de hoy
              </CardTitle>
              <CardDescription>
                {usage.used} de {usage.limit} análisis usados. Se reinicia a las {formatDateTime(usage.resetsAt)}.
              </CardDescription>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-semibold text-ink-primary tabular-nums">{usage.remaining}</p>
              <p className="text-xs text-ink-muted">restantes hoy</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Análisis que corriste en los últimos 14 días.</CardDescription>
        </CardHeader>
        <CardContent>
          {activityByDay.length > 0 ? (
            <UsageChart data={activityByDay} />
          ) : (
            <p className="text-sm text-ink-muted">Todavía no has corrido ningún análisis.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análisis anteriores</CardTitle>
          <CardDescription>Las últimas ideas que analizaste, más recientes primero.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {analyses.length === 0 && <p className="text-sm text-ink-muted">Aún no hay análisis guardados.</p>}
          {analyses.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleOpen(entry.id)}
              disabled={openingId !== null}
              className="w-full flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 text-left hover:bg-surface-muted hover:border-brand-200 transition-colors focus-ring disabled:opacity-60"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink-primary line-clamp-2">{entry.originalIdea}</p>
                <p className="text-xs text-ink-muted mt-1">{formatDateTime(entry.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-medium text-ink-secondary tabular-nums">
                  {entry.relatedStudiesCount} estudios
                </span>
                {openingId === entry.id ? (
                  <span className="text-xs text-brand-600">Abriendo...</span>
                ) : (
                  <ArrowRight size={16} className="text-ink-muted" />
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-ink-muted text-center">
        ¿Quieres analizar una idea nueva? <Link to="/idea" className="text-brand-600 hover:underline">Empieza aquí</Link>.
      </p>
    </div>
  );
}
