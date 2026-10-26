import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { ResearchIdeaInput } from "@/components/research/ResearchIdeaInput";
import { IdeaSidebar, type IdeaExample } from "@/components/research/IdeaSidebar";
import { useResearch } from "@/hooks/useResearch";
import type { ResearchIdeaInput as ResearchIdeaInputType } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";

export function Idea() {
  const navigate = useNavigate();
  const { submitIdea } = useResearch();
  const { t } = useLanguage();
  // Al elegir un ejemplo se cambia la `key` del formulario para que arranque con ese texto.
  const [example, setExample] = useState<{ data: IdeaExample; n: number } | null>(null);

  function handleSubmit(input: ResearchIdeaInputType) {
    submitIdea(input);
    navigate("/analysis");
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pastel-butter via-pastel-sky to-pastel-lavender p-6 sm:p-8"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/40" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-14 left-1/4 h-40 w-40 rounded-full bg-pastel-mint/70 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-pastel-butter-ink shadow-sm">
            <Lightbulb size={24} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold text-ink-primary">{t("idea.title", "Cuéntanos tu idea")}</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-secondary">
              {t("idea.subtitle", "No necesitas saber cómo formular una pregunta científica. Escríbela con tus propias palabras.")}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="rounded-3xl border border-border bg-white/90 p-5 shadow-[var(--shadow-card)] sm:p-7" aria-label={t("idea.formTitle", "Formulario de tu idea")}>
          <ResearchIdeaInput
            key={example?.n ?? 0}
            onSubmit={handleSubmit}
            prefill={example ? { rawText: example.data.rawText, objective: example.data.objective } : undefined}
          />
        </section>
        <IdeaSidebar onPickExample={(data) => setExample({ data, n: (example?.n ?? 0) + 1 })} />
      </div>
    </div>
  );
}
