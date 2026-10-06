import { Check, Minus, X } from "lucide-react";
import type { ComparisonField } from "@/types/article";
import { matchStyles } from "@/utils/similarity";
import { cn } from "@/utils/cn";
import { useLanguage } from "@/i18n/LanguageContext";

interface ResearchComparisonProps {
  fields: ComparisonField[];
}

const iconByMatch = { check: Check, warning: Minus, cross: X };

const rowTone: Record<ComparisonField["match"], string> = {
  coincide: "text-status-good",
  parcial: "text-status-warning-text",
  diferente: "text-status-critical",
};

export function ResearchComparison({ fields }: ResearchComparisonProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr] bg-surface-muted text-xs font-semibold text-ink-secondary uppercase tracking-wide">
        <div className="px-4 py-2.5">{t("comparison.field", "Campo")}</div>
        <div className="px-4 py-2.5">{t("comparison.yourIdea", "Tu idea")}</div>
        <div className="px-4 py-2.5">{t("comparison.research", "Investigación")}</div>
      </div>
      <div className="divide-y divide-border">
        {fields.map((field) => {
          const meta = matchStyles[field.match];
          const Icon = iconByMatch[meta.icon];
          return (
            <div
              key={field.label}
              className="grid grid-cols-1 gap-1.5 px-4 py-3 text-sm sm:grid-cols-[1fr_1fr_1fr] sm:items-center sm:gap-0 sm:py-0"
            >
              <div className="font-medium text-ink-primary flex items-center gap-2 sm:px-0 sm:py-3">
                <Icon size={16} className={cn("shrink-0", rowTone[field.match])} />
                {field.label}
              </div>
              <div className="text-ink-secondary sm:px-4 sm:py-3">
                <span className="text-xs text-ink-muted sm:hidden">{t("comparison.yourIdea", "Tu idea")}: </span>
                {field.ideaValue}
              </div>
              <div className="text-ink-secondary sm:px-4 sm:py-3">
                <span className="text-xs text-ink-muted sm:hidden">{t("comparison.research", "Investigación")}: </span>
                {field.articleValue}
              </div>
            </div>
          );
        })}
      </div>
      <p className="px-4 py-3 text-xs text-ink-muted bg-surface-muted border-t border-border">
        {t("comparison.disclaimer", "Encontrar un artículo parecido no significa que tu investigación sea igual.")}
      </p>
    </div>
  );
}
