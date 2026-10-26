import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BarChart3, BookOpenText, GitCompareArrows, MessageCircleQuestion, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { toneChip, type PastelTone } from "@/components/navigation/navItems";
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
  const { user } = useAuth();
  // El video (7 MB) solo se carga en pantallas grandes: en el celular se ahorra el consumo de datos.
  const [showVideo] = useState(() => window.matchMedia("(min-width: 1024px)").matches);

  const discoveryCards = [
    {
      icon: BookOpenText,
      title: t("home.card1.title", "Literatura relacionada"),
      description: t("home.card1.desc", "Encuentra investigaciones similares a tu idea."),
      tone: "sky" as PastelTone,
    },
    {
      icon: BarChart3,
      title: t("home.card2.title", "Nivel de exploración"),
      description: t("home.card2.desc", "Descubre si un tema está muy, moderadamente o poco explorado."),
      tone: "mint" as PastelTone,
    },
    {
      icon: GitCompareArrows,
      title: t("home.card3.title", "Posibles oportunidades"),
      description: t("home.card3.desc", "Identifica diferencias entre tu idea y trabajos existentes."),
      tone: "peach" as PastelTone,
    },
    {
      icon: MessageCircleQuestion,
      title: t("home.card4.title", "Mejora tu pregunta"),
      description: t("home.card4.desc", "Convierte una idea general en una pregunta de investigación más precisa."),
      tone: "lavender" as PastelTone,
    },
  ];

  useEffect(() => {
    if (!showVideo) return;
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
  }, [showVideo]);

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Encabezado pastel personalizado: saludo, propuesta de valor y acciones principales. */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-pastel-sky via-pastel-lavender to-pastel-aqua p-6 shadow-[var(--shadow-card)] sm:p-10">
        <span className="pointer-events-none absolute -left-16 -top-20 -z-10 h-64 w-64 rounded-full bg-white/50 blur-2xl" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 h-72 w-72 rounded-full bg-pastel-mint/80 blur-3xl" aria-hidden="true" />
        <span className="pointer-events-none absolute right-6 top-6 -z-10 h-28 w-28 rounded-full bg-pastel-butter/90 blur-2xl" aria-hidden="true" />

        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur"
            >
              <img src="/logos/zetia-icon.webp" alt="" aria-hidden="true" className="h-5 w-5 rounded-full object-contain" />
              <span>{t("home.badge", "Zetia · Asistente Académico")}</span>
            </motion.div>

            {user?.firstName && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="mt-5 font-serif text-lg font-semibold text-brand-700"
              >
                {t("nav.greeting", "Hola")}, {user.firstName} 👋
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-2 text-3xl font-bold leading-[1.15] text-ink-primary sm:text-4xl lg:text-[2.6rem]"
            >
              {t("home.headline", "Convierte una idea en una")}{" "}
              <span className="bg-gradient-to-r from-[#2160c4] via-brand-600 to-[#0e8a8f] bg-clip-text text-transparent">
                {t("home.headlineAccent", "investigación mejor fundamentada")}
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg"
            >
              {t("home.description", "Descubre qué se ha investigado, qué tan explorado está tu tema y dónde podrían existir oportunidades de investigación.")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/idea" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  {t("home.analyzeBtn", "Analizar mi idea")}
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => openAssistantWithQuestion(DEMO_QUESTION)}>
                <PlayCircle size={18} className="text-brand-600" />
                {t("home.howItWorksBtn", "Ver cómo funciona")}
              </Button>
            </motion.div>
          </div>

          {showVideo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 1.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative overflow-hidden rounded-[1.75rem] border-[6px] border-white/80 shadow-[var(--shadow-card-hover)]"
            >
              <video
                ref={videoRef}
                className="pointer-events-none aspect-video h-full w-full object-cover"
                src="/inicio.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onEnded={handleEnded}
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/25 to-transparent" />
            </motion.div>
          )}
        </div>
      </section>

      <RecentConversations />

      <section id="como-funciona" className="mt-6">
        <h2 className="mb-6 text-center text-xl font-semibold text-ink-primary">
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
              <Card className="h-full p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${toneChip[card.tone]}`}>
                  <card.icon size={22} />
                </div>
                <h3 className="font-serif text-[0.95rem] font-semibold text-ink-primary">{card.title}</h3>
                <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">{card.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
