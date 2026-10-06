import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldHelp";
import type { AcademicLevel, ResearchArea, ResearchIdeaInput as ResearchIdeaInputType } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";

const MAX_CHARS = 600;

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted transition-shadow focus:outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100";

interface ResearchIdeaInputProps {
  onSubmit: (input: ResearchIdeaInputType) => void;
  isSubmitting?: boolean;
}

export function ResearchIdeaInput({ onSubmit, isSubmitting }: ResearchIdeaInputProps) {
  const { language, t } = useLanguage();
  const [rawText, setRawText] = useState("");
  const [area, setArea] = useState<ResearchArea>("educacion");
  const [population, setPopulation] = useState("");
  const [context, setContext] = useState("");
  const [intervention, setIntervention] = useState("");
  const [objective, setObjective] = useState("");
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>("pregrado");
  const [showOptional, setShowOptional] = useState(false);

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

  const academicLevelOptions: { value: AcademicLevel; label: string; detail: string }[] = [
    { value: "pregrado", label: t("idea.level.undergrad", "Pregrado"), detail: t("idea.level.undergrad.detail", "Alcance viable y fundamentos claros") },
    { value: "maestria", label: t("idea.level.masters", "Maestría"), detail: t("idea.level.masters.detail", "Brecha, método y evidencia") },
    { value: "doctorado", label: t("idea.level.phd", "Doctorado"), detail: t("idea.level.phd.detail", "Contribución original y defendible") },
  ];

  const canSubmit = rawText.trim().length >= 15 && rawText.length <= MAX_CHARS && objective.trim().length >= 5;
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
      {/* Idea principal */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <FieldLabel htmlFor="idea" helpKey="idea" variant="primary" label={t("idea.field.ideaLabel", "Tu idea de investigación")} />
        <textarea
          id="idea"
          value={rawText}
          onChange={(e) => setRawText(e.target.value.slice(0, MAX_CHARS))}
          rows={6}
          placeholder={t("idea.field.ideaPlaceholder", "Ejemplo: Quiero investigar cómo la inteligencia artificial puede ayudar a los estudiantes a aprender programación.")}
          className={`${fieldClass} rounded-xl px-4 py-3 resize-none`}
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-ink-muted">{t("idea.field.minChars", "Mínimo 15 caracteres.")}</p>
          <p className={`text-xs tabular-nums ${rawText.length >= MAX_CHARS ? "text-[var(--color-status-critical-text)]" : "text-ink-muted"}`}>
            {rawText.length}/{MAX_CHARS}
          </p>
        </div>
      </motion.div>

      {/* Nivel académico */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <FieldLabel htmlFor="academicLevel" helpKey="level" variant="primary" label={t("idea.field.levelLabel", "Nivel académico del proyecto")} />
        <select id="academicLevel" value={academicLevel} onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)} className={fieldClass}>
          {academicLevelOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label} · {option.detail}</option>
          ))}
        </select>
        <p className="text-xs text-ink-muted mt-1.5">
          {t("idea.field.levelHint", "Esto ajusta el nivel de exigencia del diagnóstico y las recomendaciones.")}
        </p>
      </motion.div>

      {/* Objetivo */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <FieldLabel htmlFor="objective" helpKey="objective" variant="primary" label={t("idea.field.objectiveLabel", "¿Qué quieres lograr? Objetivo general")} />
        <input
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder={t("idea.field.objectivePlaceholder", "Sé concreto. Ej. mejorar el rendimiento académico en cursos de programación")}
          required
          className={`${fieldClass} py-2.5`}
        />
        <p className="text-xs text-ink-muted mt-1.5">
          {t("idea.field.objectiveHint", "Necesitamos algo concreto para poder buscar literatura relevante: dinos en una frase qué buscas lograr.")}
        </p>
      </motion.div>

      {/* Detalles opcionales */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors focus-ring rounded"
        >
          <SlidersHorizontal size={15} />
          {t("idea.field.optionalDetails", "Detalles opcionales")}
          {optionalFilledCount > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-100 px-1 text-[10px] font-semibold text-brand-700">
              {optionalFilledCount}
            </span>
          )}
          <motion.span animate={{ rotate: showOptional ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-ink-muted">
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

      {/* Botón submit */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="inline-block w-full sm:w-auto">
          <Button type="submit" size="lg" disabled={!canSubmit || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? t("idea.field.analyzing", "Analizando...") : t("idea.field.submitBtn", "Analizar idea")}
            <ArrowRight size={18} />
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}
