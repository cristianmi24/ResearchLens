import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Compass, PlayCircle, Puzzle, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { openAssistantWithQuestion } from "@/utils/assistantBus";

const DEMO_QUESTION = "Muéstrame una demo de cómo funciona todo";

const discoveryCards = [
  {
    icon: Search,
    title: "Literatura relacionada",
    description: "Encuentra investigaciones similares a tu idea.",
    color: "var(--color-cat-1)",
  },
  {
    icon: Compass,
    title: "Nivel de exploración",
    description: "Descubre si un tema está muy, moderadamente o poco explorado.",
    color: "var(--color-cat-3)",
  },
  {
    icon: Puzzle,
    title: "Posibles oportunidades",
    description: "Identifica diferencias entre tu idea y trabajos existentes.",
    color: "var(--color-cat-2)",
  },
  {
    icon: Sparkles,
    title: "Mejora tu pregunta",
    description: "Convierte una idea general en una pregunta de investigación más precisa.",
    color: "var(--color-cat-7)",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function Home() {
  return (
    <div className="animate-fade-in">
      <section className="relative text-center max-w-2xl mx-auto py-10 sm:py-16 px-4">
        <div
          className="pointer-events-none absolute inset-x-0 -top-10 h-56 -z-10 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(ellipse at center, var(--color-brand-100), transparent 70%)" }}
        />
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold tracking-wide text-brand-600 mb-3"
        >
          ResearchLens
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl font-semibold text-ink-primary tracking-tight leading-tight"
        >
          Convierte una idea en una investigación mejor fundamentada.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-ink-secondary mt-4 text-base leading-relaxed"
        >
          Descubre qué se ha investigado, qué tan explorado está tu tema y dónde podrían existir oportunidades de
          investigación.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <Link to="/idea">
            <Button size="lg">
              Analizar mi idea
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={() => openAssistantWithQuestion(DEMO_QUESTION)}>
            <PlayCircle size={18} />
            Ver cómo funciona
          </Button>
        </motion.div>
      </section>

      <section id="como-funciona" className="mt-6">
        <h2 className="text-lg font-semibold text-ink-primary text-center mb-6">¿Qué puedes descubrir?</h2>
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {discoveryCards.map((card) => (
            <motion.div key={card.title} variants={item} whileHover={{ y: -3 }}>
              <Card className="p-5 h-full border-t-2 transition-shadow hover:shadow-[var(--shadow-card-hover)]" style={{ borderTopColor: card.color }}>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                  style={{ backgroundColor: `color-mix(in srgb, ${card.color} 14%, white)`, color: card.color }}
                >
                  <card.icon size={20} />
                </div>
                <h3 className="font-semibold text-ink-primary text-sm">{card.title}</h3>
                <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">{card.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
