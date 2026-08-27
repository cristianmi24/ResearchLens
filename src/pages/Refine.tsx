import { useState } from "react";
import type { FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResearchQuestionCard } from "@/components/research/ResearchQuestionCard";
import type { RefineFormInput, ResearchQuestionProposal } from "@/types/research";

const studyTypeOptions: { value: RefineFormInput["studyType"]; label: string }[] = [
  { value: "experimental", label: "Experimental" },
  { value: "correlacional", label: "Correlacional" },
  { value: "cualitativo", label: "Cualitativo" },
  { value: "revision_sistematica", label: "Revisión sistemática" },
  { value: "mixto", label: "Mixto" },
];

export function Refine() {
  const { diagnosis, proposals, runRefine, selectedQuestion, selectQuestion } = useResearch();

  const [form, setForm] = useState<RefineFormInput>({
    population: "Estudiantes universitarios",
    context: "Educación superior",
    intervention: "IA generativa",
    outcomeVariable: "Rendimiento académico",
    geography: "Colombia",
    studyType: "experimental",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProposals, setShowProposals] = useState(false);

  function updateField<K extends keyof RefineFormInput>(key: K, value: RefineFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    await runRefine(form);
    setIsGenerating(false);
    setShowProposals(true);
  }

  function handleSelect(proposal: ResearchQuestionProposal) {
    selectQuestion(proposal.question);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Construye una mejor pregunta</h1>
        <p className="text-ink-secondary mt-2 leading-relaxed">
          Ajusta los elementos de tu idea para generar preguntas de investigación más claras y delimitadas.
        </p>
      </div>

      <Card className="p-4 bg-surface-muted/60">
        <p className="text-xs font-medium text-ink-secondary mb-1">Idea original</p>
        <p className="text-sm text-ink-primary">
          "{diagnosis?.originalIdea ?? "IA para enseñar programación."}"
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Población" value={form.population} onChange={(v) => updateField("population", v)} />
          <Field label="Contexto" value={form.context} onChange={(v) => updateField("context", v)} />
          <Field label="Intervención" value={form.intervention} onChange={(v) => updateField("intervention", v)} />
          <Field
            label="Variable resultado"
            value={form.outcomeVariable}
            onChange={(v) => updateField("outcomeVariable", v)}
          />
          <Field
            label="Contexto geográfico"
            value={form.geography}
            onChange={(v) => updateField("geography", v)}
          />
          <div>
            <label htmlFor="studyType" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Tipo de investigación
            </label>
            <select
              id="studyType"
              value={form.studyType}
              onChange={(e) => updateField("studyType", e.target.value as RefineFormInput["studyType"])}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-primary focus-ring"
            >
              {studyTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={isGenerating}>
          <Sparkles size={18} />
          {isGenerating ? "Generando..." : "Generar propuestas"}
        </Button>
      </form>

      {showProposals && proposals.length > 0 && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-semibold text-ink-primary mb-1">Propuestas de pregunta de investigación</h2>
          <p className="text-sm text-ink-secondary mb-4">
            Estas propuestas se generan a partir de los elementos que definiste y de los patrones encontrados en la
            literatura.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {proposals.map((proposal) => (
              <ResearchQuestionCard
                key={proposal.id}
                proposal={proposal}
                isSelected={selectedQuestion === proposal.question}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink-secondary mb-1.5">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-primary focus-ring"
      />
    </div>
  );
}
