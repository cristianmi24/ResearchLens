import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/FieldHelp";
import type { HelpKey } from "@/components/ui/FieldHelp";
import { GeoMapSection } from "@/components/map/GeoMapSection";
import { Button } from "@/components/ui/Button";
import { ResearchQuestionCard } from "@/components/research/ResearchQuestionCard";
import { useLanguage } from "@/i18n/LanguageContext";
import type { RefineFormInput, ResearchQuestionProposal } from "@/types/research";
import type { DelimitationOption } from "@/types/topic";

export function Refine() {
  const navigate = useNavigate();
  const location = useLocation();
  const { diagnosis, proposals, runRefine, selectedQuestion, selectQuestion } = useResearch();
  const { language, t } = useLanguage();

  // Opción de delimitación elegida en "Oportunidades" (si se llegó desde ahí).
  const exploringOption = (location.state as { option?: DelimitationOption } | null)?.option ?? null;

  function handleBack() {
    // Si hay historial (se llegó desde Oportunidades) se vuelve ahí; si se
    // abrió la página directamente, se manda a Oportunidades como destino lógico.
    if (window.history.length > 1) navigate(-1);
    else navigate("/opportunities");
  }

  const studyTypeOptions: { value: RefineFormInput["studyType"]; label: string }[] = [
    { value: "no_definido", label: t("refine.studyType.notDefined", "Aún no lo sé") },
    { value: "experimental", label: t("refine.studyType.experimental", "Experimental") },
    { value: "correlacional", label: t("refine.studyType.correlational", "Correlacional") },
    { value: "cualitativo", label: t("refine.studyType.qualitative", "Cualitativo") },
    { value: "revision_sistematica", label: t("refine.studyType.systematicReview", "Revisión sistemática") },
    { value: "mixto", label: t("refine.studyType.mixed", "Mixto") },
  ];

  const [form, setForm] = useState<RefineFormInput>({
    population: "",
    context: "",
    intervention: "",
    outcomeVariable: "",
    geography: "",
    studyType: "no_definido",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProposals, setShowProposals] = useState(false);

  function updateField<K extends keyof RefineFormInput>(key: K, value: RefineFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    await runRefine({ ...form, language });
    setIsGenerating(false);
    setShowProposals(true);
  }

  function handleSelect(proposal: ResearchQuestionProposal) {
    selectQuestion(proposal.question);
  }

  const levelText = diagnosis?.academicLevel
    ? t(`idea.level.${diagnosis.academicLevel === "pregrado" ? "undergrad" : diagnosis.academicLevel === "maestria" ? "masters" : "phd"}`)
    : t("idea.level.undergrad");

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
      <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-3">
        <ArrowLeft size={16} />
        {t("refine.back", "Volver")}
      </Button>

      {exploringOption && (
        <Card className="p-4 border-brand-200 bg-brand-50/60">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wide">
            <Compass size={14} />
            {t("refine.exploringOption", "Opción que estás explorando")} · {exploringOption.optionLabel}
          </p>
          <p className="text-sm text-ink-primary mt-2 leading-relaxed">{exploringOption.suggestion}</p>
        </Card>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">
          {t("refine.title", "Construye una mejor pregunta")}
        </h1>
        <p className="text-ink-secondary mt-2 leading-relaxed">
          {t(
            "refine.subtitle",
            "Ajusta los elementos de tu idea para generar preguntas de investigación más claras y delimitadas. El nivel seleccionado es"
          )}{" "}
          <strong>{levelText}</strong>.
        </p>
      </div>

      <Card className="p-4 bg-surface-muted/60">
        <p className="text-xs font-medium text-ink-secondary mb-1">
          {t("refine.originalIdea", "Idea original")}
        </p>
        <p className="text-sm text-ink-primary">
          "{diagnosis?.originalIdea ?? t("idea.field.ideaPlaceholder")}"
        </p>
      </Card>

      <GeoMapSection
        distribution={diagnosis?.geoDistribution}
        hint={t(
          "map.refineHint",
          "Úsalo para decidir el contexto geográfico de tu propuesta: donde hay pocos estudios puede haber una oportunidad, pero confírmalo con una búsqueda más amplia."
        )}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            helpKey="population"
            label={t("refine.population", "Población")}
            value={form.population}
            onChange={(v) => updateField("population", v)}
          />
          <Field
            helpKey="context"
            label={t("refine.context", "Contexto")}
            value={form.context}
            onChange={(v) => updateField("context", v)}
          />
          <Field
            helpKey="intervention"
            label={t("refine.intervention", "Intervención")}
            value={form.intervention}
            onChange={(v) => updateField("intervention", v)}
          />
          <Field
            helpKey="outcome"
            label={t("refine.outcomeVariable", "Variable resultado")}
            value={form.outcomeVariable}
            onChange={(v) => updateField("outcomeVariable", v)}
          />
          <Field
            helpKey="geography"
            label={t("refine.geography", "Contexto geográfico")}
            value={form.geography}
            onChange={(v) => updateField("geography", v)}
          />
          <div>
            <FieldLabel htmlFor="studyType" helpKey="studyType" label={t("refine.studyType", "Tipo de investigación")} />
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
          {isGenerating ? t("refine.generating", "Generando...") : t("refine.submitBtn", "Generar propuestas")}
        </Button>
      </form>

      {showProposals && proposals.length > 0 && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-semibold text-ink-primary mb-1">
            {t("refine.proposalsTitle", "Propuestas de pregunta de investigación")}
          </h2>
          <p className="text-sm text-ink-secondary mb-4">
            {t(
              "refine.proposalsSubtitle",
              "Estas propuestas se generan a partir de los elementos que definiste y de los patrones encontrados en la literatura."
            )}
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
  helpKey,
  value,
  onChange,
}: {
  label: string;
  helpKey: HelpKey;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <FieldLabel htmlFor={id} helpKey={helpKey} label={label} />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-primary focus-ring"
      />
    </div>
  );
}
