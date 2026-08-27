import { similarityToLabel } from "@/utils/similarity";
import { Badge } from "@/components/ui/Badge";

interface SimilarityBadgeProps {
  percent: number;
}

export function SimilarityBadge({ percent }: SimilarityBadgeProps) {
  const label = similarityToLabel(percent);
  const tone = label === "Alta" ? "good" : label === "Media" ? "warning" : "neutral";

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-2xl font-semibold text-ink-primary tabular-nums">{percent}%</span>
      <Badge tone={tone}>Similitud {label.toLowerCase()}</Badge>
    </div>
  );
}
