import type { Opportunity } from "@/types/topic";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const badgeTone: Record<Opportunity["badge"], "good" | "warning"> = {
  poco_explorado: "good",
  parcialmente_explorado: "warning",
  diferenciacion_potencial: "good",
};

const badgeEmoji: Record<Opportunity["badge"], string> = {
  poco_explorado: "🟢",
  parcialmente_explorado: "🟡",
  diferenciacion_potencial: "🟢",
};

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="p-5">
      <Badge tone={badgeTone[opportunity.badge]}>
        <span aria-hidden>{badgeEmoji[opportunity.badge]}</span>
        {opportunity.badgeLabel.toUpperCase()}
      </Badge>
      <h3 className="text-base font-semibold text-ink-primary mt-3">{opportunity.title}</h3>
      <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">{opportunity.description}</p>
    </Card>
  );
}
