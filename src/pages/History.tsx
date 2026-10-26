import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, BarChart3, CalendarDays, Gauge, GraduationCap, Lightbulb, Search, Sigma, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { UsageChart } from "@/components/charts/UsageChart";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import {
  GROUP_ORDER,
  computeStats,
  dateGroupOf,
  filterAndSort,
  type DateGroupId,
  type LevelFilter,
  type SortMode,
} from "@/components/history/historyUtils";
import { getHistory, getUsage } from "@/services/researchApi";
import { useResearch } from "@/hooks/useResearch";
import { useLanguage } from "@/i18n/LanguageContext";
import type { DailyUsagePoint, SessionHistoryEntry, UsageStatus } from "@/types/research";

const selectClass =
  "h-11 rounded-xl border border-border bg-white px-3 text-sm text-ink-secondary outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

const GROUP_LABEL: Record<DateGroupId, [string, string]> = {
  today: ["history.group.today", "Hoy"],
  yesterday: ["history.group.yesterday", "Ayer"],
  week: ["history.group.week", "Esta semana"],
  month: ["history.group.month", "Este mes"],
  older: ["history.group.older", "Anteriores"],
};

function StatTile({ icon: Icon, label, value, className }: { icon: typeof Sigma; label: string; value: string; className: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-3xl p-4 ${className}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-serif text-2xl font-bold leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs font-semibold opacity-80">{label}</p>
      </div>
    </div>
  );
}

export function History() {
  const navigate = useNavigate();
  const { loadSession } = useResearch();
  const { language, t } = useLanguage();
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [analyses, setAnalyses] = useState<SessionHistoryEntry[]>([]);
  const [activityByDay, setActivityByDay] = useState<DailyUsagePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [sort, setSort] = useState<SortMode>("recent");
  const [attempt, setAttempt] = useState(0);

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(language, { dateStyle: "medium", timeStyle: "short" });
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUsage(), getHistory()])
      .then(([usageData, historyData]) => {
        if (cancelled) return;
        setUsage(usageData);
        setAnalyses(historyData.analyses);
        setActivityByDay(historyData.activityByDay);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  async function handleOpen(id: string) {
    if (openingId) return;
    setOpeningId(id);
    setOpenError("");
    try {
      await loadSession(id);
      navigate("/results");
    } catch {
      setOpenError(t("history.openError", "No se pudo abrir ese análisis. Intenta de nuevo."));
    } finally {
      setOpeningId(null);
    }
  }

  const stats = useMemo(() => computeStats(analyses), [analyses]);
  const visible = useMemo(() => filterAndSort(analyses, { search, level, sort }), [analyses, search, level, sort]);
  // Con orden por fecha se agrupa en "Hoy / Ayer / …"; con orden por estudios la lista va plana.
  const groups = useMemo(() => {
    if (sort === "studies") return [{ id: null as DateGroupId | null, items: visible }];
    const byGroup = new Map<DateGroupId, SessionHistoryEntry[]>();
    for (const entry of visible) {
      const id = dateGroupOf(entry.createdAt);
      byGroup.set(id, [...(byGroup.get(id) ?? []), entry]);
    }
    const ordered = GROUP_ORDER.filter((id) => byGroup.has(id));
    return (sort === "oldest" ? [...ordered].reverse() : ordered).map((id) => ({ id: id as DateGroupId | null, items: byGroup.get(id)! }));
  }, [visible, sort]);

  const hasFilters = search.trim() !== "" || level !== "all";
  const levelLabel = stats.topLevel ? t(`history.level.${stats.topLevel}`, { pregrado: "Pregrado", maestria: "Maestría", doctorado: "Doctorado" }[stats.topLevel]) : "—";
  const usagePercent = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const usageDesc = usage
    ? t("history.usageDesc", `${usage.used} de ${usage.limit} análisis usados. Se reinicia a las {time}.`)
        .replace("{used}", String(usage.used))
        .replace("{limit}", String(usage.limit))
        .replace("{time}", formatDateTime(usage.resetsAt))
    : "";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4" aria-busy="true" aria-label={t("history.loading", "Cargando tu historial…")}>
        <div className="h-24 animate-pulse rounded-3xl bg-pastel-lavender/60" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-surface-muted" />
          ))}
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-peach text-pastel-peach-ink">
          <AlertTriangle size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-ink-primary">{t("history.errorTitle", "No pudimos cargar tu historial")}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t("history.errorDesc", "Revisa tu conexión e inténtalo de nuevo. Tus análisis siguen guardados.")}</p>
        <Button
          className="mt-5"
          onClick={() => {
            setLoadError(false);
            setIsLoading(true);
            setAttempt((n) => n + 1);
          }}
        >
          {t("history.retry", "Reintentar")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pastel-sky via-pastel-lavender to-pastel-aqua p-6 sm:p-8">
        <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40" aria-hidden="true" />
        <h1 className="relative text-3xl font-bold text-ink-primary">{t("history.title", "Tu historial")}</h1>
        <p className="relative mt-2 max-w-xl text-ink-secondary">{t("history.subtitle", "Cada análisis que corres queda registrado solo en tu cuenta.")}</p>
      </div>

      {analyses.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Sigma} label={t("history.stat.total", "Análisis en total")} value={stats.total.toLocaleString(language)} className="bg-pastel-lavender text-pastel-lavender-ink" />
          <StatTile icon={CalendarDays} label={t("history.stat.week", "Esta semana")} value={stats.thisWeek.toLocaleString(language)} className="bg-pastel-sky text-pastel-sky-ink" />
          <StatTile icon={BarChart3} label={t("history.stat.average", "Estudios por análisis")} value={stats.averageStudies.toLocaleString(language)} className="bg-pastel-aqua text-pastel-aqua-ink" />
          <StatTile icon={GraduationCap} label={t("history.stat.level", "Nivel más usado")} value={levelLabel} className="bg-pastel-mint text-pastel-mint-ink" />
        </div>
      )}

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
            <div className="shrink-0 text-right">
              <p className="font-serif text-3xl font-bold tabular-nums text-brand-700">{usage.remaining}</p>
              <p className="text-xs text-ink-muted">{t("history.remainingToday", "restantes hoy")}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="h-3 overflow-hidden rounded-full bg-pastel-lavender"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={usage.limit}
              aria-valuenow={usage.used}
              aria-label={t("history.usageToday", "Uso de hoy")}
            >
              <div
                className={`h-full rounded-full transition-all ${usagePercent >= 90 ? "bg-gradient-to-r from-[#f2c94c] to-[#f29a6b]" : "bg-gradient-to-r from-brand-400 to-brand-600"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("history.recentActivity", "Actividad reciente")}</CardTitle>
          <CardDescription>{t("history.recentActivityDesc", "Análisis que corriste en los últimos 14 días.")}</CardDescription>
        </CardHeader>
        <CardContent>
          {activityByDay.length > 0 ? (
            <UsageChart data={activityByDay} />
          ) : (
            <p className="text-sm text-ink-muted">{t("history.noActivity", "Todavía no has corrido ningún análisis.")}</p>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="history-list-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="history-list-title" className="text-xl font-semibold text-ink-primary">
              {t("history.previousConversations", "Conversaciones anteriores")}
            </h2>
            <p className="text-sm text-ink-secondary">{t("history.previousConversationsDesc", "Retoma una investigación justo donde la dejaste.")}</p>
          </div>
          {analyses.length > 0 && (
            <span className="rounded-full bg-pastel-lavender px-3 py-1 text-xs font-semibold text-pastel-lavender-ink" aria-live="polite">
              {visible.length} / {analyses.length}
            </span>
          )}
        </div>

        {analyses.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-ink-muted" aria-hidden="true" />
              <span className="sr-only">{t("history.searchPlaceholder", "Buscar una conversación...")}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("history.searchPlaceholder", "Buscar una conversación...")}
                className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-10 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t("history.clearSearch", "Borrar búsqueda")}
                  title={t("history.clearSearch", "Borrar búsqueda")}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink-primary focus-ring"
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <select value={level} onChange={(e) => setLevel(e.target.value as LevelFilter)} aria-label={t("history.filterLevel", "Filtrar por nivel")} className={selectClass}>
              <option value="all">{t("history.levelAll", "Todos los niveles")}</option>
              <option value="pregrado">{t("history.level.pregrado", "Pregrado")}</option>
              <option value="maestria">{t("history.level.maestria", "Maestría")}</option>
              <option value="doctorado">{t("history.level.doctorado", "Doctorado")}</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} aria-label={t("history.sortBy", "Ordenar por")} className={selectClass}>
              <option value="recent">{t("history.sort.recent", "Más recientes")}</option>
              <option value="oldest">{t("history.sort.oldest", "Más antiguos")}</option>
              <option value="studies">{t("history.sort.studies", "Más estudios")}</option>
            </select>
          </div>
        )}

        {openError && (
          <p className="rounded-2xl bg-status-critical-bg px-4 py-3 text-sm font-medium text-status-critical-text" role="alert">
            {openError}
          </p>
        )}

        {analyses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-pastel-sky/40 px-6 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-butter text-pastel-butter-ink">
              <Lightbulb size={26} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-serif text-lg font-semibold text-ink-primary">{t("history.emptyTitle", "Aún no tienes análisis guardados")}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-secondary">{t("history.emptyDesc", "Cuenta tu primera idea de investigación y aquí quedará tu historial para retomarla cuando quieras.")}</p>
            <Link to="/idea" className="mt-5 inline-block">
              <Button>{t("history.emptyCta", "Analizar mi primera idea")}</Button>
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">{t("history.noMatches", "No hay conversaciones que coincidan con tu búsqueda.")}</p>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setLevel("all");
                }}
              >
                {t("history.clearFilters", "Quitar filtros")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id ?? "all"} className="space-y-2.5">
                {group.id && (
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                    {t(GROUP_LABEL[group.id][0], GROUP_LABEL[group.id][1])}
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    <span className="font-semibold normal-case tracking-normal">{group.items.length}</span>
                  </h3>
                )}
                {group.items.map((entry) => (
                  <HistoryEntryCard key={entry.id} entry={entry} isOpening={openingId === entry.id} disabled={openingId !== null} onOpen={() => handleOpen(entry.id)} />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-ink-muted">
        {t("history.newIdeaPrompt", "¿Quieres analizar una idea nueva?")}{" "}
        <Link to="/idea" className="font-semibold text-brand-600 hover:underline">
          {t("history.startHere", "Empieza aquí")}
        </Link>
        .
      </p>
    </div>
  );
}
