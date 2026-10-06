import { ArrowRight } from "lucide-react";
import type { DelimitationOption } from "@/types/topic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";

interface DelimitationOptionCardProps {
  option: DelimitationOption;
  onExplore: (option: DelimitationOption) => void;
}

export function DelimitationOptionCard({ option, onExplore }: DelimitationOptionCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="p-5 flex flex-col h-full">
      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{option.optionLabel}</p>
      <p className="text-sm text-ink-primary mt-2 flex-1 leading-relaxed">{option.suggestion}</p>
      <Button variant="outline" size="sm" className="mt-4 self-start" onClick={() => onExplore(option)}>
        {t("opportunities.exploreOption", "Explorar esta opción")}
        <ArrowRight size={16} />
      </Button>
    </Card>
  );
}
