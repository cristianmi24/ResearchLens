import { Check } from "lucide-react";
import type { QualityRating, ResearchQuestionProposal } from "@/types/research";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { useLanguage } from "@/i18n/LanguageContext";

interface ResearchQuestionCardProps {
  proposal: ResearchQuestionProposal;
  isSelected: boolean;
  onSelect: (proposal: ResearchQuestionProposal) => void;
}

const ratingDot: Record<QualityRating["clarity"], string> = {
  verde: "bg-status-good",
  amarillo: "bg-status-warning",
  rojo: "bg-status-critical",
};

export function ResearchQuestionCard({ proposal, isSelected, onSelect }: ResearchQuestionCardProps) {
  const { t } = useLanguage();

  const ratingLabels: { key: keyof QualityRating; label: string }[] = [
    { key: "clarity", label: t("refine.clarity", "Claridad") },
    { key: "delimitation", label: t("refine.delimitation", "Delimitación") },
    { key: "availableLiterature", label: t("refine.availableLiterature", "Literatura disponible") },
    { key: "differentiation", label: t("refine.differentiation", "Diferenciación") },
  ];

  return (
    <Card className={cn("p-5 flex flex-col h-full", isSelected && "ring-2 ring-brand-400")}>
      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{proposal.label}</p>
      <p className="text-sm text-ink-primary mt-2 leading-relaxed flex-1">{proposal.question}</p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4 text-xs">
        {ratingLabels.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full shrink-0", ratingDot[proposal.ratings[key]])} />
            <dt className="text-ink-secondary">{label}</dt>
          </div>
        ))}
      </dl>

      <Button
        variant={isSelected ? "primary" : "outline"}
        size="sm"
        className="mt-4"
        onClick={() => onSelect(proposal)}
      >
        {isSelected && <Check size={16} />}
        {isSelected ? t("refine.selected", "Seleccionada") : t("refine.select", "Seleccionar")}
      </Button>
    </Card>
  );
}
