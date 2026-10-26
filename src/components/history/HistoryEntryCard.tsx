import { ArrowRight, BookOpen, Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { SessionHistoryEntry } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";
import { relativeTime } from "./historyUtils";

const LEVEL_STYLE: Record<string, { label: string; className: string }> = {
  pregrado: { label: "Pregrado", className: "bg-pastel-sky text-pastel-sky-ink" },
  maestria: { label: "Maestría", className: "bg-pastel-lavender text-pastel-lavender-ink" },
  doctorado: { label: "Doctorado", className: "bg-pastel-indigo text-pastel-indigo-ink" },
};

const EXPLORATION_STYLE: Record<string, { label: string; className: string }> = {
  bajo: { label: "Poco explorado", className: "bg-pastel-mint text-pastel-mint-ink" },
  moderado: { label: "Moderadamente explorado", className: "bg-pastel-butter text-pastel-butter-ink" },
  alto: { label: "Muy explorado", className: "bg-pastel-peach text-pastel-peach-ink" },
};

const TREND_ICON = { creciente: TrendingUp, estable: Minus, decreciente: TrendingDown } as const;

interface Props {
  entry: SessionHistoryEntry;
  isOpening: boolean;
  disabled: boolean;
  onOpen: () => void;
}

/** Un análisis guardado: la idea, cuándo se hizo, cuánta literatura encontró y su nivel; un clic lo reabre. */
export function HistoryEntryCard({ entry, isOpening, disabled, onOpen }: Props) {
  const { t, language } = useLanguage();
  const level = entry.academicLevel ? LEVEL_STYLE[entry.academicLevel] : null;
  const exploration = entry.explorationLevel ? EXPLORATION_STYLE[entry.explorationLevel] : null;
  const TrendIcon = entry.trend ? TREND_ICON[entry.trend] : null;
  const exactDate = new Date(entry.createdAt).toLocaleString(language, { dateStyle: "medium", timeStyle: "short" });

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      className="group flex min-h-24 w-full items-stretch gap-4 rounded-3xl border border-border bg-white p-4 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)] focus-ring disabled:opacity-60"
    >
      <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-pastel-sky/70 text-pastel-sky-ink">
        <BookOpen size={18} aria-hidden="true" />
        <span className="mt-1 font-serif text-lg font-bold leading-none tabular-nums">{entry.relatedStudiesCount.toLocaleString(language)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide">{t("history.studies", "estudios")}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink-primary">{entry.originalIdea}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          {level && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${level.className}`}>{t(`history.level.${entry.academicLevel}`, level.label)}</span>}
          {exploration && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${exploration.className}`}>
              {t(`history.exploration.${entry.explorationLevel}`, exploration.label)}
            </span>
          )}
          {TrendIcon && entry.trend && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-secondary">
              <TrendIcon size={12} aria-hidden="true" />
              {t(`history.trend.${entry.trend}`, entry.trend)}
            </span>
          )}
          <time dateTime={entry.createdAt} title={exactDate} className="text-xs text-ink-muted">
            {relativeTime(entry.createdAt, language)}
          </time>
        </span>
      </span>

      <span className="flex shrink-0 items-center self-center">
        {isOpening ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600">
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            {t("history.opening", "Abriendo...")}
          </span>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel-lavender text-brand-700 transition-transform group-hover:translate-x-0.5">
            <ArrowRight size={18} aria-hidden="true" />
            <span className="sr-only">{t("history.open", "Abrir análisis")}</span>
          </span>
        )}
      </span>
    </button>
  );
}
