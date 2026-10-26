import { BarChart3, Lightbulb, Search, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface IdeaExample {
  label: string;
  rawText: string;
  objective: string;
}

/** Ejemplos por idioma: al elegir uno se precarga el formulario, para quien no sabe cómo empezar. */
const EXAMPLES: Record<string, IdeaExample[]> = {
  es: [
    {
      label: "IA y programación",
      rawText: "Quiero investigar cómo la inteligencia artificial generativa puede ayudar a estudiantes de primer semestre a aprender programación.",
      objective: "Evaluar el efecto de los asistentes de IA en el aprendizaje de programación",
    },
    {
      label: "Celular y sueño",
      rawText: "Me interesa saber cómo el uso excesivo del celular en la noche afecta el sueño y el rendimiento de adolescentes en colegios públicos.",
      objective: "Analizar la relación entre uso del celular, calidad del sueño y rendimiento académico",
    },
    {
      label: "Agricultura sostenible",
      rawText: "Quiero estudiar qué prácticas de agricultura sostenible pueden adoptar los pequeños productores de ñame en Córdoba, Colombia.",
      objective: "Identificar prácticas sostenibles viables para pequeños productores de ñame",
    },
  ],
  en: [
    {
      label: "AI and programming",
      rawText: "I want to research how generative artificial intelligence can help first-semester students learn programming.",
      objective: "Evaluate the effect of AI assistants on programming learning",
    },
    {
      label: "Phones and sleep",
      rawText: "I want to know how heavy nighttime phone use affects sleep and school performance in teenagers at public schools.",
      objective: "Analyze the relationship between phone use, sleep quality and academic performance",
    },
    {
      label: "Sustainable farming",
      rawText: "I want to study which sustainable farming practices small yam producers in Córdoba, Colombia can adopt.",
      objective: "Identify viable sustainable practices for small yam producers",
    },
  ],
  pt: [
    {
      label: "IA e programação",
      rawText: "Quero pesquisar como a inteligência artificial generativa pode ajudar estudantes do primeiro semestre a aprender programação.",
      objective: "Avaliar o efeito dos assistentes de IA na aprendizagem de programação",
    },
    {
      label: "Celular e sono",
      rawText: "Quero saber como o uso excessivo do celular à noite afeta o sono e o desempenho de adolescentes em escolas públicas.",
      objective: "Analisar a relação entre uso do celular, qualidade do sono e desempenho acadêmico",
    },
    {
      label: "Agricultura sustentável",
      rawText: "Quero estudar quais práticas de agricultura sustentável pequenos produtores de inhame em Córdoba, Colômbia podem adotar.",
      objective: "Identificar práticas sustentáveis viáveis para pequenos produtores de inhame",
    },
  ],
};

const NEXT_STEPS: { icon: LucideIcon; key: string; fallback: string; tone: string }[] = [
  { icon: Search, key: "idea.next.s1", fallback: "Buscamos literatura real en varias fuentes académicas.", tone: "bg-pastel-sky text-pastel-sky-ink" },
  { icon: BarChart3, key: "idea.next.s2", fallback: "Medimos qué tan explorado está tu tema y qué tan parecido es a lo que ya existe.", tone: "bg-pastel-mint text-pastel-mint-ink" },
  { icon: Target, key: "idea.next.s3", fallback: "Te mostramos oportunidades y preguntas de investigación mejor delimitadas.", tone: "bg-pastel-lavender text-pastel-lavender-ink" },
];

const TIPS: { key: string; fallback: string }[] = [
  { key: "idea.tip1", fallback: "Di qué quieres estudiar, en quién y dónde." },
  { key: "idea.tip2", fallback: "No hace falta usar términos técnicos." },
  { key: "idea.tip3", fallback: "Una sola idea a la vez da mejores resultados." },
];

interface IdeaSidebarProps {
  onPickExample: (example: IdeaExample) => void;
}

export function IdeaSidebar({ onPickExample }: IdeaSidebarProps) {
  const { t, language } = useLanguage();
  const examples = EXAMPLES[language] ?? EXAMPLES.es;

  return (
    <aside className="space-y-4" aria-label={t("idea.sidebar", "Ayuda para escribir tu idea")}>
      <section className="rounded-3xl border border-border bg-white/90 p-5 shadow-[var(--shadow-card)]">
        <h2 className="flex items-center gap-2 font-serif text-sm font-semibold text-ink-primary">
          <Sparkles size={16} className="text-pastel-butter-ink" aria-hidden="true" />
          {t("idea.examples.title", "¿Sin ideas? Prueba un ejemplo")}
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => onPickExample(example)}
              className="rounded-2xl border border-border bg-pastel-butter/40 px-3.5 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-pastel-butter/70 focus-ring"
            >
              <span className="block text-sm font-semibold text-ink-primary">{example.label}</span>
              <span className="mt-0.5 line-clamp-2 block text-xs text-ink-secondary">{example.rawText}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white/90 p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-serif text-sm font-semibold text-ink-primary">{t("idea.next.title", "¿Qué pasa después?")}</h2>
        <ol className="mt-3 space-y-3">
          {NEXT_STEPS.map((step) => (
            <li key={step.key} className="flex items-start gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${step.tone}`}>
                <step.icon size={17} aria-hidden="true" />
              </span>
              <span className="pt-1 text-sm leading-snug text-ink-secondary">{t(step.key, step.fallback)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-pastel-sky to-pastel-lavender p-5">
        <h2 className="flex items-center gap-2 font-serif text-sm font-semibold text-ink-primary">
          <Lightbulb size={16} className="text-brand-600" aria-hidden="true" />
          {t("idea.tips.title", "Para escribir mejor tu idea")}
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">
          {TIPS.map((tip) => (
            <li key={tip.key} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
              {t(tip.key, tip.fallback)}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
