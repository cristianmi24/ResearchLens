import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Compass, Save, SlidersHorizontal, Sprout, Telescope, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldHelp";
import type { AcademicLevel, ResearchArea, ResearchIdeaInput as ResearchIdeaInputType } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";

const MAX_CHARS = 600;
const MIN_CHARS = 15;
// Con esta extensión la idea ya suele traer fenómeno + población o contexto: es un buen punto de partida.
const IDEAL_CHARS = 90;

const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-serif text-xs font-bold text-white shadow-sm"
      aria-hidden="true"
    >
      {n}
    </span>
  );
}

// Borrador local: si el usuario recarga, cierra la pestaña o pierde la red, lo escrito no se pierde.
const DRAFT_KEY = "zetia.ideaDraft";

interface IdeaDraft {
  rawText: string;
  area: ResearchArea;
  population: string;
  context: string;
  intervention: string;
  objective: string;
  academicLevel: AcademicLevel;
}

function readDraft(): Partial<IdeaDraft> {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") as Partial<IdeaDraft>;
  } catch {
    return {};
  }
}

const fieldClass =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted transition-shadow focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

interface ResearchIdeaInputProps {
  onSubmit: (input: ResearchIdeaInputType) => void;
  isSubmitting?: boolean;
  /** Texto con el que arranca el formulario (p. ej. un ejemplo elegido); pesa más que el borrador guardado. */
  prefill?: Partial<Pick<IdeaDraft, "rawText" | "objective">>;
}

export function ResearchIdeaInput({ onSubmit, isSubmitting, prefill }: ResearchIdeaInputProps) {
  const { language, t } = useLanguage();
  const [draft] = useState(() => ({ ...readDraft(), ...prefill }));
  const [rawText, setRawText] = useState(draft.rawText ?? "");
  const [area, setArea] = useState<ResearchArea>(draft.area ?? "educacion");
  const [population, setPopulation] = useState(draft.population ?? "");
  const [context, setContext] = useState(draft.context ?? "");
  const [intervention, setIntervention] = useState(draft.intervention ?? "");
  const [objective, setObjective] = useState(draft.objective ?? "");
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(draft.academicLevel ?? "pregrado");
  const [showOptional, setShowOptional] = useState(Boolean(draft.population || draft.context || draft.intervention));
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const hasContent = [rawText, objective, population, context, intervention].some((v) => v.trim().length > 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (hasContent) {
          const value: IdeaDraft = { rawText, area, population, context, intervention, objective, academicLevel };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        // Almacenamiento lleno o bloqueado (modo privado): el formulario sigue funcionando sin borrador.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [hasContent, rawText, area, population, context, intervention, objective, academicLevel]);

  function discardDraft() {
    setRawText("");
    setObjective("");
    setPopulation("");
    setContext("");
    setIntervention("");
    setArea("educacion");
    setAcademicLevel("pregrado");
    setConfirmDiscard(false);
  }

  // Las opciones se generan dinámicamente para reflejar el idioma actual
  const areaOptions: { value: ResearchArea; label: string }[] = [
    { value: "educacion", label: t("idea.area.education", "Educación") },
    { value: "salud", label: t("idea.area.health", "Salud") },
    { value: "tecnologia", label: t("idea.area.technology", "Tecnología") },
    { value: "ciencias_sociales", label: t("idea.area.socialSciences", "Ciencias sociales") },
    { value: "ciencias_naturales", label: t("idea.area.naturalSciences", "Ciencias naturales") },
    { value: "ingenieria", label: t("idea.area.engineering", "Ingeniería") },
    { value: "administracion", label: t("idea.area.administration", "Administración") },
    { value: "otro", label: t("idea.area.other", "Otro") },
  ];

  const academicLevelOptions: { value: AcademicLevel; label: string; detail: string; icon: LucideIcon; tone: string }[] = [
    { value: "pregrado", label: t("idea.level.undergrad", "Pregrado"), detail: t("idea.level.undergrad.detail", "Alcance viable y fundamentos claros"), icon: Sprout, tone: "bg-pastel-mint" },
    { value: "maestria", label: t("idea.level.masters", "Maestría"), detail: t("idea.level.masters.detail", "Brecha, método y evidencia"), icon: Compass, tone: "bg-pastel-sky" },
    { value: "doctorado", label: t("idea.level.phd", "Doctorado"), detail: t("idea.level.phd.detail", "Contribución original y defendible"), icon: Telescope, tone: "bg-pastel-lavender" },
  ];

  const canSubmit = rawText.trim().length >= MIN_CHARS && rawText.length <= MAX_CHARS && objective.trim().length >= 5;
  const meterColor = rawText.length < MIN_CHARS ? "bg-[#f2c94c]" : rawText.length < IDEAL_CHARS ? "bg-brand-400" : "bg-[#3fbf8a]";
  const ideaHint =
    rawText.length < MIN_CHARS
      ? t("idea.field.minChars", "Mínimo 15 caracteres.")
      : rawText.length < IDEAL_CHARS
      ? t("idea.field.hintMore", "Bien. Si puedes, añade a quién o dónde (población, contexto).")
      : t("idea.field.hintGood", "Buen nivel de detalle para empezar.");
  const optionalFilledCount = [population, context, intervention].filter((v) => v.trim().length > 0).length;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      rawText: rawText.trim(),
      objective: objective.trim(),
      academicLevel,
      area,
      population,
      context,
      intervention,
      language,
    });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
    >
      {/* 1 · Idea principal */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3">
          <StepBadge n={1} />
          <div className="min-w-0 flex-1">
            <FieldLabel htmlFor="idea" helpKey="idea" variant="primary" label={t("idea.field.ideaLabel", "Tu idea de investigación")} />
            <textarea
              id="idea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value.slice(0, MAX_CHARS))}
              rows={6}
              placeholder={t("idea.field.ideaPlaceholder", "Ejemplo: Quiero investigar cómo la inteligencia artificial puede ayudar a los estudiantes a aprender programación.")}
              aria-describedby="idea-meter"
              className={`${fieldClass} mt-2 resize-none rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed`}
            />
            <div id="idea-meter" className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-pastel-lavender" aria-hidden="true">
                <div className={`h-full rounded-full transition-all duration-300 ${meterColor}`} style={{ width: `${Math.min(100, (rawText.length / MAX_CHARS) * 100)}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between gap-3 text-xs">
                <p className={rawText.length >= IDEAL_CHARS ? "font-semibold text-pastel-mint-ink" : "text-ink-muted"} aria-live="polite">
                  {ideaHint}
                </p>
                <p className={`tabular-nums ${rawText.length >= MAX_CHARS ? "font-semibold text-status-critical-text" : "text-ink-muted"}`}>
                  {rawText.length}/{MAX_CHARS}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2 · Nivel académico */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3">
          <StepBadge n={2} />
          <fieldset className="min-w-0 flex-1">
            <legend className="w-full">
              <FieldLabel htmlFor="level-pregrado" helpKey="level" variant="primary" label={t("idea.field.levelLabel", "Nivel académico del proyecto")} />
            </legend>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
              {academicLevelOptions.map((option) => {
                const checked = academicLevel === option.value;
                return (
                  <label
                    key={option.value}
                    className={`relative flex min-h-24 cursor-pointer flex-col gap-1 rounded-2xl border p-3.5 transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500 ${
                      checked ? `${option.tone} border-transparent shadow-[var(--shadow-card)]` : "border-border bg-white hover:border-brand-300"
                    }`}
                  >
                    <input
                      id={`level-${option.value}`}
                      type="radio"
                      name="academicLevel"
                      value={option.value}
                      checked={checked}
                      onChange={() => setAcademicLevel(option.value)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 text-sm font-bold text-ink-primary">
                      <option.icon size={17} aria-hidden="true" />
                      {option.label}
                      {checked && <Check size={15} className="ml-auto" aria-hidden="true" />}
                    </span>
                    <span className="text-xs leading-snug text-ink-secondary">{option.detail}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {t("idea.field.levelHint", "Esto ajusta el nivel de exigencia del diagnóstico y las recomendaciones.")}
            </p>
          </fieldset>
        </div>
      </motion.div>

      {/* 3 · Objetivo */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3">
          <StepBadge n={3} />
          <div className="min-w-0 flex-1">
            <FieldLabel htmlFor="objective" helpKey="objective" variant="primary" label={t("idea.field.objectiveLabel", "¿Qué quieres lograr? Objetivo general")} />
            <input
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={t("idea.field.objectivePlaceholder", "Sé concreto. Ej. mejorar el rendimiento académico en cursos de programación")}
              required
              className={`${fieldClass} mt-2 py-3`}
            />
            <p className="mt-2 text-xs text-ink-muted">
              {t("idea.field.objectiveHint", "Necesitamos algo concreto para poder buscar literatura relevante: dinos en una frase qué buscas lograr.")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Detalles opcionales */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-pastel-lavender/40 p-3">
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          aria-expanded={showOptional}
          className="flex min-h-10 w-full items-center gap-2 rounded-xl px-1 text-sm font-semibold text-ink-secondary transition-colors hover:text-brand-700 focus-ring"
        >
          <SlidersHorizontal size={15} />
          {t("idea.field.optionalDetails", "Detalles opcionales")}
          {optionalFilledCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
              {optionalFilledCount}
            </span>
          )}
          <motion.span animate={{ rotate: showOptional ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto text-ink-muted">
            <ChevronDown size={15} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showOptional && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                <div>
                  <FieldLabel htmlFor="area" helpKey="area" label={t("idea.field.areaLabel", "Área")} />
                  <select
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value as ResearchArea)}
                    className={fieldClass}
                  >
                    {areaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="population" helpKey="population" label={t("idea.field.populationLabel", "Población")} />
                  <input
                    id="population"
                    value={population}
                    onChange={(e) => setPopulation(e.target.value)}
                    placeholder={t("idea.field.populationPlaceholder", "Ej. estudiantes universitarios")}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="context" helpKey="context" label={t("idea.field.contextLabel", "Contexto")} />
                  <input
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder={t("idea.field.contextPlaceholder", "Ej. Colombia")}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="intervention" helpKey="intervention" label={t("idea.field.interventionLabel", "Variable / intervención")} />
                  <input
                    id="intervention"
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                    placeholder={t("idea.field.interventionPlaceholder", "Ej. inteligencia artificial")}
                    className={fieldClass}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Botón submit + estado del borrador */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="inline-block w-full sm:w-auto">
          <Button type="submit" size="lg" disabled={!canSubmit || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? t("idea.field.analyzing", "Analizando...") : t("idea.field.submitBtn", "Analizar idea")}
            <ArrowRight size={18} />
          </Button>
        </motion.div>
        {hasContent && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-live="polite">
            <span className="inline-flex items-center gap-1">
              <Save size={13} aria-hidden="true" />
              {t("idea.draft.saved", "Borrador guardado en este navegador")}
            </span>
            {confirmDiscard ? (
              <>
                <button type="button" onClick={discardDraft} className="focus-ring rounded px-2 py-1.5 font-semibold text-[var(--color-status-critical-text)] hover:underline">
                  {t("idea.draft.confirm", "Sí, descartar")}
                </button>
                <button type="button" onClick={() => setConfirmDiscard(false)} className="focus-ring rounded px-2 py-1.5 hover:underline">
                  {t("idea.draft.cancel", "Cancelar")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDiscard(true)}
                className="focus-ring inline-flex items-center gap-1 rounded px-2 py-1.5 hover:text-ink-primary hover:underline"
              >
                <Trash2 size={13} aria-hidden="true" />
                {t("idea.draft.discard", "Descartar borrador")}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.form>
  );
}
