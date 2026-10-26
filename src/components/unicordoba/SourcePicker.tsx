import { Check, Info } from "lucide-react";
import type { PanelSourceId } from "@/services/unicordobaApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { sourceStyleById } from "./sourceStyles";

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

const chipBase =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500";

/** Selector de una o varias fuentes: cada una con su color, y una marca ✓ cuando está elegida. */
export function SourcePicker({ value, onChange, disabled }: SourcePickerProps) {
  const { t } = useLanguage();
  const usesQuota = value.some((source) => ["ieee", "springer", "scopus"].includes(source));
  const allSelected = value.length === SOURCE_CHOICES.length;

  function toggleSource(source: PanelSourceId) {
    const next = value.includes(source) ? value.filter((item) => item !== source) : [...value, source];
    if (next.length > 0) onChange(next);
  }

  function toggleAll() {
    const allSources = SOURCE_CHOICES.map((choice) => choice.id);
    onChange(allSelected ? ["unicordoba"] : allSources);
  }

  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="text-sm font-semibold text-ink-primary">{t("unicor.sourceLabel", "Buscar en")}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SOURCE_CHOICES.map((choice) => {
          const checked = value.includes(choice.id);
          const style = sourceStyleById(choice.id);
          return (
            <label
              key={choice.id}
              className={`${chipBase} ${
                checked ? `${style.chip} border-transparent shadow-sm` : "border-border bg-white text-ink-secondary hover:border-brand-300 hover:text-ink-primary"
              }`}
            >
              <input type="checkbox" name="panel-source" value={choice.id} checked={checked} onChange={() => toggleSource(choice.id)} className="sr-only" />
              {checked ? <Check size={14} aria-hidden="true" /> : <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden="true" />}
              {choice.label}
            </label>
          );
        })}
        <label
          className={`${chipBase} ${
            allSelected ? "border-transparent bg-brand-600 text-white shadow-sm" : "border-dashed border-brand-300 bg-white text-brand-700 hover:bg-pastel-lavender/60"
          }`}
        >
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="sr-only" />
          {allSelected && <Check size={14} aria-hidden="true" />}
          {t("unicor.sourceAll", "Todas")}
        </label>
      </div>
      {usesQuota && (
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-pastel-butter/60 px-3 py-2 text-xs text-pastel-butter-ink">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t(
            "unicor.quotaHint",
            "IEEE Xplore, Springer Nature y Scopus tienen una cuota diaria limitada; las fuentes académicas abiertas también están disponibles desde este panel."
          )}
        </p>
      )}
    </fieldset>
  );
}
