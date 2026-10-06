import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Compass, PlayCircle, Puzzle, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecentConversations } from "@/components/research/RecentConversations";
import { openAssistantWithQuestion } from "@/utils/assistantBus";
import { useLanguage } from "@/i18n/LanguageContext";

const DEMO_QUESTION = "Muéstrame una demo de cómo funciona todo";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  const discoveryCards = [
    {
      icon: Search,
      title: t("home.card1.title", "Literatura relacionada"),
      description: t("home.card1.desc", "Encuentra investigaciones similares a tu idea."),
      color: "var(--color-cat-1)",
    },
    {
      icon: Compass,
      title: t("home.card2.title", "Nivel de exploración"),
      description: t("home.card2.desc", "Descubre si un tema está muy, moderadamente o poco explorado."),
      color: "var(--color-cat-3)",
    },
    {
      icon: Puzzle,
      title: t("home.card3.title", "Posibles oportunidades"),
      description: t("home.card3.desc", "Identifica diferencias entre tu idea y trabajos existentes."),
      color: "var(--color-cat-2)",
    },
    {
      icon: Sparkles,
      title: t("home.card4.title", "Mejora tu pregunta"),
      description: t("home.card4.desc", "Convierte una idea general en una pregunta de investigación más precisa."),
      color: "var(--color-cat-7)",
    },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="relative text-center py-16 sm:py-24 px-4 overflow-hidden rounded-3xl isolate border border-slate-800/50 shadow-xl bg-slate-950">
        <video
          ref={videoRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover z-0"
          src="/inicio.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onEnded={handleEnded}
        />

        {/* Película translúcida calibrada: el video se ve completo y con vida, mientras el texto resalta con nitidez */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/75" />
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, transparent 75%)" }}
        />

        {/* Contenido sin caja opaca: el video se aprecia de fondo en todo su esplendor */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-slate-900/80 text-cyan-300 border border-cyan-500/35 shadow-[0_0_18px_rgba(6,182,212,0.25)] backdrop-blur-md mb-5"
          >
            <img src="/logo.png" alt="ResearchLens logo" className="h-5 w-5 object-contain rounded-full shadow-xs" />
            <span>{t("home.badge", "ResearchLens · Asistente Académico")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl lg:text-[2.85rem] font-bold text-white tracking-tight leading-[1.18] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
          >
            {t("home.headline", "Convierte una idea en una")}{" "}
            <span className="font-serif italic font-medium bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent">
              {t("home.headlineAccent", "investigación mejor fundamentada")}
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-200 mt-4 text-base sm:text-lg leading-relaxed max-w-xl mx-auto font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
          >
            {t("home.description", "Descubre qué se ha investigado, qué tan explorado está tu tema y dónde podrían existir oportunidades de investigación.")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8"
          >
            <Link to="/idea" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_25px_rgba(42,120,214,0.45)] border border-brand-400/30 transition-all font-semibold"
              >
                {t("home.analyzeBtn", "Analizar mi idea")}
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-slate-900/65 hover:bg-slate-900/85 text-white border-white/30 backdrop-blur-md shadow-lg"
              onClick={() => openAssistantWithQuestion(DEMO_QUESTION)}
            >
              <PlayCircle size={18} className="text-cyan-400" />
              {t("home.howItWorksBtn", "Ver cómo funciona")}
            </Button>
          </motion.div>
        </div>
      </section>

      <RecentConversations />

      <section id="como-funciona" className="mt-6">
        <h2 className="text-lg font-semibold text-ink-primary text-center mb-6">
          {t("home.discoverTitle", "¿Qué puedes descubrir?")}
        </h2>
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
