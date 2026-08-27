import type { ComparisonMatch } from "@/types/article";
import type { ExplorationLevel } from "@/types/research";
import type { ConcentrationLevel } from "@/types/topic";

/**
 * Traduce métricas técnicas a lenguaje comprensible para un estudiante,
 * siguiendo el principio del sistema: nunca mostrar una métrica sin explicación.
 */
export function similarityToLabel(percent: number): "Baja" | "Media" | "Alta" {
  if (percent >= 75) return "Alta";
  if (percent >= 50) return "Media";
  return "Baja";
}

export const matchStyles: Record<ComparisonMatch, { icon: "check" | "warning" | "cross"; label: string }> = {
  coincide: { icon: "check", label: "Coincide" },
  parcial: { icon: "warning", label: "Parcialmente similar" },
  diferente: { icon: "cross", label: "Diferente" },
};

export const explorationMeta: Record<
  ExplorationLevel,
  { label: string; barFilled: number; colorVar: string; emoji: string }
> = {
  alto: { label: "Muy explorado", barFilled: 8, colorVar: "var(--color-status-critical)", emoji: "🔴" },
  moderado: { label: "Moderadamente explorado", barFilled: 6, colorVar: "var(--color-status-warning)", emoji: "🟡" },
  bajo: { label: "Poco explorado", barFilled: 3, colorVar: "var(--color-status-good)", emoji: "🟢" },
};

export const concentrationMeta: Record<ConcentrationLevel, { label: string; colorVar: string; emoji: string }> = {
  alta: { label: "Alta concentración", colorVar: "var(--color-status-critical)", emoji: "🔴" },
  media: { label: "Concentración media", colorVar: "var(--color-status-warning)", emoji: "🟡" },
  baja: { label: "Baja concentración", colorVar: "var(--color-status-good)", emoji: "🟢" },
};
