import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { ResearchIdeaInput } from "@/components/research/ResearchIdeaInput";
import { useResearch } from "@/hooks/useResearch";
import type { ResearchIdeaInput as ResearchIdeaInputType } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";

export function Idea() {
  const navigate = useNavigate();
  const { submitIdea } = useResearch();
  const { t } = useLanguage();

  function handleSubmit(input: ResearchIdeaInputType) {
    submitIdea(input);
    navigate("/analysis");
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 mb-2"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-cat-7) 14%, white)", color: "var(--color-cat-7)" }}
        >
          <Lightbulb size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">{t("idea.title", "Cuéntanos tu idea")}</h1>
          <p className="text-ink-secondary mt-1 leading-relaxed">
            {t("idea.subtitle", "No necesitas saber cómo formular una pregunta científica. Escríbela con tus propias palabras.")}
          </p>
        </div>
      </motion.div>

      <div className="mt-8">
        <ResearchIdeaInput onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
