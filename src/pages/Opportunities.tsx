import { useNavigate } from "react-router-dom";
import { useResearch } from "@/hooks/useResearch";
import { mockOpportunities, mockDelimitationOptions } from "@/data/mockOpportunities";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { DelimitationOptionCard } from "@/components/opportunities/DelimitationOptionCard";
import { useLanguage } from "@/i18n/LanguageContext";
import type { DelimitationOption } from "@/types/topic";

export function Opportunities() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { opportunities: contextOpportunities, delimitationOptions: contextOptions } = useResearch();

  const opportunities = contextOpportunities.length > 0 ? contextOpportunities : mockOpportunities;
  const delimitationOptions = contextOptions.length > 0 ? contextOptions : mockDelimitationOptions;

  function handleExplore(option: DelimitationOption) {
    // La opción viaja en el estado de navegación para que "Construye una mejor
    // pregunta" muestre qué ruta se está explorando.
    navigate("/refine", { state: { option } });
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">
          {t("opportunities.title", "¿Dónde podría estar tu oportunidad?")}
        </h1>
        <p className="text-ink-secondary mt-2 leading-relaxed">
          {t(
            "opportunities.subtitle",
            "Con base en las fuentes consultadas, identificamos posibles áreas de diferenciación para tu propuesta. Esto no significa que exista un vacío científico, sino una oportunidad de delimitación."
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink-primary mb-1">
          {t("opportunities.howDelimitTitle", "¿Cómo podrías delimitar tu idea?")}
        </h2>
        <p className="text-sm text-ink-secondary mb-4">
          {t(
            "opportunities.howDelimitDesc",
            "Estas alternativas están basadas en los patrones que encontramos en la literatura consultada."
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {delimitationOptions.map((option) => (
            <DelimitationOptionCard key={option.id} option={option} onExplore={handleExplore} />
          ))}
        </div>
      </div>
    </div>
  );
}
