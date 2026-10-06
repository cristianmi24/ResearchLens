import type { ExplorationEstimate } from "@/types/research";
import { explorationMeta } from "@/utils/similarity";
import { formatNumber } from "@/utils/formatting";
import { useLanguage } from "@/i18n/LanguageContext";

interface ExplorationLevelProps {
  exploration: ExplorationEstimate;
  showLegend?: boolean;
  /** Cantidad real de estudios relacionados; si se entrega, se muestra por qué se clasificó así. */
  studiesCount?: number;
}

// De menos a más explorado, de izquierda a derecha. Los umbrales (150 / 800)
// replican explorationLevelFromCount en server/src/pipeline/diagnosis.ts.
const order: ExplorationEstimate["level"][] = ["bajo", "moderado", "alto"];

const levelKey: Record<ExplorationEstimate["level"], "low" | "moderate" | "high"> = {
  bajo: "low",
  moderado: "moderate",
  alto: "high",
};

function Bar({ filled, colorVar, active }: { filled: number; colorVar: string; active: boolean }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${filled} / 10`}>
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

export function ExplorationLevel({ exploration, showLegend = true, studiesCount }: ExplorationLevelProps) {
  const { t } = useLanguage();

  const levelLabels: Record<ExplorationEstimate["level"], string> = {
    alto: t("exploration.high", "Muy explorado"),
    moderado: t("exploration.moderate", "Moderadamente explorado"),
    bajo: t("exploration.low", "Poco explorado"),
  };

  if (!showLegend) {
    const meta = explorationMeta[exploration.level];
    return <Bar filled={meta.barFilled} colorVar={meta.colorVar} active />;
  }

  const activeMeta = explorationMeta[exploration.level];
  const activeKey = levelKey[exploration.level];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2" role="list">
        {order.map((level) => {
          const meta = explorationMeta[level];
          const active = level === exploration.level;
          const key = levelKey[level];
          return (
            <div key={level} role="listitem" className="flex min-w-0 flex-col items-stretch">
              <div
                className={`rounded-xl border-2 px-1 py-3 text-center sm:px-2 transition-colors ${
                  active ? "shadow-[var(--shadow-card-hover)]" : "border-border bg-white opacity-60"
                }`}
                style={
                  active
                    ? {
                        borderColor: meta.colorVar,
                        backgroundColor: `color-mix(in srgb, ${meta.colorVar} 12%, white)`,
                      }
                    : undefined
                }
                aria-current={active ? "true" : undefined}
              >
                <span className="text-xl leading-none">{meta.emoji}</span>
                <p className={`mt-1.5 break-words text-[11px] leading-tight sm:text-xs sm:uppercase sm:tracking-wide ${active ? "font-bold text-ink-primary" : "font-medium text-ink-muted"}`}>
                  {levelLabels[level]}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-ink-muted">
                  {t(`exploration.range.${key}`)}
                </p>
              </div>
              <div className="h-6 flex flex-col items-center justify-start">
                {active && (
                  <>
                    <span
                      className="block h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent"
                      style={{ borderBottomColor: meta.colorVar }}
                      aria-hidden
                    />
                    <span className="text-[11px] font-semibold" style={{ color: meta.colorVar }}>
                      {t("exploration.youAreHere", "Tu tema está aquí")}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-lg border px-4 py-3 text-sm leading-relaxed"
        style={{
          borderColor: `color-mix(in srgb, ${activeMeta.colorVar} 40%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${activeMeta.colorVar} 7%, white)`,
        }}
      >
        <p className="text-ink-primary">
          <span className="font-semibold">{levelLabels[exploration.level]}.</span>{" "}
          {typeof studiesCount === "number" && (
            <>
              {t("exploration.basedOn", "Clasificado así porque se encontraron")}{" "}
              <strong>{formatNumber(studiesCount)}</strong> {t("exploration.studiesUnit", "estudios relacionados")} (
              {t(`exploration.range.${activeKey}`)}).
            </>
          )}
        </p>
        <p className="mt-1.5 text-ink-secondary">{t(`exploration.meaning.${activeKey}`)}</p>
      </div>
    </div>
  );
}
