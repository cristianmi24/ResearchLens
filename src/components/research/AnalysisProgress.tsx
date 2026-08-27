import { Check, Loader2 } from "lucide-react";
import type { AnalysisStep } from "@/types/research";
import { cn } from "@/utils/cn";

interface AnalysisProgressProps {
  steps: AnalysisStep[];
}

export function AnalysisProgress({ steps }: AnalysisProgressProps) {
  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li
          key={step.key}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
            step.status === "active" && "bg-brand-50",
            step.status === "done" && "opacity-70"
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
              step.status === "done" && "bg-status-good border-status-good text-white",
              step.status === "active" && "border-brand-500 text-brand-600",
              step.status === "pending" && "border-border text-ink-muted"
            )}
          >
            {step.status === "done" && <Check size={14} strokeWidth={3} />}
            {step.status === "active" && <Loader2 size={14} className="animate-spin" />}
            {step.status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-ink-muted" />}
          </span>
          <span
            className={cn(
              "font-medium",
              step.status === "pending" ? "text-ink-muted" : "text-ink-primary"
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
