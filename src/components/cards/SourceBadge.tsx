import { CheckCircle2 } from "lucide-react";
import type { SourceConsultation } from "@/types/research";
import { formatNumber, formatShortDate } from "@/utils/formatting";

interface SourceBadgeProps {
  source: SourceConsultation;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-border px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <CheckCircle2 size={18} className="text-status-good shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-primary">{source.name}</p>
          <p className="text-xs text-ink-muted">Consultada el {formatShortDate(source.consultedAt)}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-ink-secondary tabular-nums shrink-0">
        {formatNumber(source.resultsCount)} resultados
      </p>
    </div>
  );
}
