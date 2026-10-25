import { Info } from "lucide-react";
import type { SourceChoice } from "@/services/unicordobaApi";
import { useLanguage } from "@/i18n/LanguageContext";

const SOURCE_CHOICES: { id: SourceChoice; label: string }[] = [
  { id: "unicordoba", label: "Unicórdoba" },
  { id: "ieee", label: "IEEE Xplore" },
  { id: "springer", label: "Springer Nature" },
  { id: "scopus", label: "Scopus" },
  { id: "all", label: "" },
];

interface SourcePickerProps {
  value: SourceChoice;
  onChange: (value: SourceChoice) => void;
  disabled?: boolean;
}

/** Selector de una sola fuente (o todas), como grupo de opciones accesible por teclado. */
export function SourcePicker({ value, onChange, disabled }: SourcePickerProps) {
  const { t } = useLanguage();
  const usesQuota = value !== "unicordoba";

  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-medium text-ink-primary">{t("unicor.sourceLabel", "Buscar en")}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {SOURCE_CHOICES.map((choice) => {
          const checked = value === choice.id;
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
                type="radio"
                name="panel-source"
                value={choice.id}
                checked={checked}
                onChange={() => onChange(choice.id)}
                className="sr-only"
              />
              {choice.id === "all" ? t("unicor.sourceAll", "Todas") : choice.label}
            </label>
          );
        })}
      </div>
      {usesQuota && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-muted">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t(
            "unicor.quotaHint",
            "IEEE Xplore, Springer Nature y Scopus tienen una cuota diaria limitada: solo se consultan desde este panel y cuando las eliges."
          )}
        </p>
      )}
    </fieldset>
  );
}
