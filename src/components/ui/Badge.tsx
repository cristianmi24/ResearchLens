import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "good" | "warning" | "critical" | "brand";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-secondary",
  good: "bg-status-good-bg text-status-good-text",
  warning: "bg-status-warning-bg text-status-warning-text",
  critical: "bg-status-critical-bg text-status-critical-text",
  brand: "bg-brand-50 text-brand-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-ink-secondary",
        className
      )}
      {...props}
    />
  );
}
