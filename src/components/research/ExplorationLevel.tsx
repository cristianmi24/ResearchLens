import type { ExplorationEstimate } from "@/types/research";
import { explorationMeta } from "@/utils/similarity";

interface ExplorationLevelProps {
  exploration: ExplorationEstimate;
  /** Cuando es true, muestra los tres niveles apilados a modo de leyenda (pantalla de resultados). */
  showLegend?: boolean;
}

const order: ExplorationEstimate["level"][] = ["alto", "moderado", "bajo"];

function Bar({ filled, colorVar, active }: { filled: number; colorVar: string; active: boolean }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${filled} de 10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 w-3.5 rounded-sm"
          style={{
            backgroundColor: i < filled ? colorVar : "var(--color-surface-muted)",
            opacity: active ? 1 : 0.55,
          }}
        />
      ))}
    </div>
  );
}

export function ExplorationLevel({ exploration, showLegend = true }: ExplorationLevelProps) {
  if (!showLegend) {
    const meta = explorationMeta[exploration.level];
    return <Bar filled={meta.barFilled} colorVar={meta.colorVar} active />;
  }

  return (
    <div className="space-y-3">
      {order.map((level) => {
        const meta = explorationMeta[level];
        const active = level === exploration.level;
        return (
          <div key={level} className="flex items-center gap-3">
            <span className="text-lg leading-none">{meta.emoji}</span>
            <span className={`w-48 text-sm ${active ? "font-semibold text-ink-primary" : "text-ink-muted"}`}>
              {meta.label.toUpperCase()}
            </span>
            <Bar filled={meta.barFilled} colorVar={meta.colorVar} active={active} />
          </div>
        );
      })}
    </div>
  );
}
