import { Info } from "lucide-react";
import type { PanelSourceId } from "@/services/unicordobaApi";
import { useLanguage } from "@/i18n/LanguageContext";

const SOURCE_CHOICES: { id: PanelSourceId; label: string }[] = [
  { id: "unicordoba", label: "Unicórdoba" },
  { id: "semantic", label: "Semantic Scholar" },
  { id: "openalex", label: "OpenAlex" },
  { id: "crossref", label: "Crossref" },
  { id: "ieee", label: "IEEE Xplore" },
  { id: "springer", label: "Springer Nature" },
  { id: "scopus", label: "Scopus" },
];

interface SourcePickerProps {
  value: PanelSourceId[];
  onChange: (value: PanelSourceId[]) => void;
  disabled?: boolean;
}

/** Selector de una o varias fuentes, como grupo de opciones accesible por teclado. */
export function SourcePicker({ value, onChange, disabled }: SourcePickerProps) {
  const { t } = useLanguage();
  const usesQuota = value.some((source) => ["ieee", "springer", "scopus"].includes(source));

  function toggleSource(source: PanelSourceId) {
    const next = value.includes(source) ? value.filter((item) => item !== source) : [...value, source];
    if (next.length > 0) onChange(next);
  }

  function toggleAll() {
    const allSources = SOURCE_CHOICES.map((choice) => choice.id);
    onChange(value.length === allSources.length ? ["unicordoba"] : allSources);
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-medium text-ink-primary">{t("unicor.sourceLabel", "Buscar en")}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {SOURCE_CHOICES.map((choice) => {
          const checked = value.includes(choice.id);
          return (
            <label
              key={choice.id}
              className={[
                "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500",
                checked
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-border bg-white text-ink-secondary hover:border-brand-300 hover:text-ink-primary",
              ].join(" ")}
            >
              <input
                type="checkbox"
                name="panel-source"
                value={choice.id}
                checked={checked}
                onChange={() => toggleSource(choice.id)}
                className="sr-only"
              />
              {choice.label}
            </label>
          );
        })}
        <label
          className={[
            "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500",
            value.length === SOURCE_CHOICES.length
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-border bg-white text-ink-secondary hover:border-brand-300 hover:text-ink-primary",
          ].join(" ")}
        >
          <input
            type="checkbox"
            checked={value.length === SOURCE_CHOICES.length}
            onChange={toggleAll}
            className="sr-only"
          />
          {t("unicor.sourceAll", "Todas")}
        </label>
      </div>
      {usesQuota && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-muted">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t(
            "unicor.quotaHint",
            "IEEE Xplore, Springer Nature y Scopus tienen una cuota diaria limitada; las fuentes académicas abiertas también están disponibles desde este panel."
          )}
        </p>
      )}
    </fieldset>
  );
}
