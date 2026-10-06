import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Gauge, Search, MessageSquareText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { UsageChart } from "@/components/charts/UsageChart";
import { getHistory, getUsage } from "@/services/researchApi";
import { useResearch } from "@/hooks/useResearch";
import { useLanguage } from "@/i18n/LanguageContext";
import type { DailyUsagePoint, SessionHistoryEntry, UsageStatus } from "@/types/research";

export function History() {
  const navigate = useNavigate();
  const { loadSession } = useResearch();
  const { language, t } = useLanguage();
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [analyses, setAnalyses] = useState<SessionHistoryEntry[]>([]);
  const [activityByDay, setActivityByDay] = useState<DailyUsagePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(language, { dateStyle: "medium", timeStyle: "short" });
  }

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
    return <p className="text-sm text-ink-muted">{t("history.loading", "Cargando tu historial…")}</p>;
  }

  const visibleAnalyses = analyses.filter((entry) => {
    const matchesSearch = entry.originalIdea.toLowerCase().includes(search.toLowerCase());
    const age = Date.now() - new Date(entry.createdAt).getTime();
    const matchesPeriod = period === "all" || age <= Number(period) * 24 * 60 * 60 * 1000;
    return matchesSearch && matchesPeriod;
  });

  const usageDesc = usage
    ? t("history.usageDesc", `${usage.used} de ${usage.limit} análisis usados. Se reinicia a las {time}.`)
        .replace("{used}", String(usage.used))
        .replace("{limit}", String(usage.limit))
        .replace("{time}", formatDateTime(usage.resetsAt))
    : "";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">{t("history.title", "Tu historial")}</h1>
        <p className="text-ink-secondary mt-2">
          {t("history.subtitle", "Cada análisis que corres queda registrado solo en tu cuenta.")}
        </p>
      </div>

      {usage && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge size={18} className="text-brand-600" />
                {t("history.usageToday", "Uso de hoy")}
              </CardTitle>
              <CardDescription>{usageDesc}</CardDescription>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-semibold text-ink-primary tabular-nums">{usage.remaining}</p>
              <p className="text-xs text-ink-muted">{t("history.remainingToday", "restantes hoy")}</p>
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
          <CardTitle>{t("history.recentActivity", "Actividad reciente")}</CardTitle>
          <CardDescription>
            {t("history.recentActivityDesc", "Análisis que corriste en los últimos 14 días.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityByDay.length > 0 ? (
            <UsageChart data={activityByDay} />
          ) : (
            <p className="text-sm text-ink-muted">
              {t("history.noActivity", "Todavía no has corrido ningún análisis.")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText size={18} className="text-brand-600" />
                {t("history.previousConversations", "Conversaciones anteriores")}
              </CardTitle>
              <CardDescription>
                {t("history.previousConversationsDesc", "Retoma una investigación justo donde la dejaste.")}
              </CardDescription>
            </div>
            <span className="text-xs text-ink-muted">
              {visibleAnalyses.length} / {analyses.length}
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3 top-3 text-ink-muted" />
              <span className="sr-only">{t("history.searchPlaceholder", "Buscar una conversación...")}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("history.searchPlaceholder", "Buscar una conversación...")}
                className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Filtrar por periodo"
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-ink-secondary outline-none focus:border-brand-500"
            >
              <option value="all">{t("history.periodAll", "Todo el historial")}</option>
              <option value="7">{t("history.period7", "Últimos 7 días")}</option>
              <option value="30">{t("history.period30", "Últimos 30 días")}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleAnalyses.length === 0 && (
            <p className="text-sm text-ink-muted">
              {t("history.noMatches", "No hay conversaciones que coincidan con tu búsqueda.")}
            </p>
          )}
          {visibleAnalyses.map((entry) => (
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
                  {entry.relatedStudiesCount} {t("history.studies", "estudios")}
                </span>
                {openingId === entry.id ? (
                  <span className="text-xs text-brand-600">{t("history.opening", "Abriendo...")}</span>
                ) : (
                  <ArrowRight size={16} className="text-ink-muted" />
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-ink-muted text-center">
        {t("history.newIdeaPrompt", "¿Quieres analizar una idea nueva?")}{" "}
        <Link to="/idea" className="text-brand-600 hover:underline">
          {t("history.startHere", "Empieza aquí")}
        </Link>
        .
      </p>
    </div>
  );
}
