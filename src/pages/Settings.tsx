import { Link, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Database, Globe, LogOut, PlayCircle, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { openAssistantWithQuestion } from "@/utils/assistantBus";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

const DEMO_QUESTION = "Muéstrame una demo de cómo funciona todo";

function initials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  }
  return (email?.[0] ?? "?").toUpperCase();
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function Settings() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto animate-fade-in space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold text-ink-primary">{t("settings.title", "Configuración")}</h1>
        <p className="text-ink-secondary mt-2">{t("settings.subtitle", "Preferencias generales de ResearchLens.")}</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden">
          <div
            className="h-20 relative"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-cat-7) 60%, var(--color-cat-3) 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.25), transparent 45%)" }}
            />
          </div>
          <CardContent className="-mt-8 pb-5">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-white text-xl font-semibold ring-4 ring-white shadow-[var(--shadow-card-hover)]"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-cat-7))" }}
            >
              {initials(user?.firstName, user?.lastName, user?.email)}
            </div>
            <div className="mt-3">
              <p className="font-semibold text-ink-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-ink-secondary">{user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut size={16} />
                {t("nav.logout", "Cerrar sesión")}
              </Button>
              <Button variant="outline" onClick={() => openAssistantWithQuestion(DEMO_QUESTION)}>
                <PlayCircle size={16} />
                {t("home.howItWorksBtn", "Ver cómo funciona")}
              </Button>
              <Link to="/privacidad">
                <Button variant="outline">
                  <ShieldCheck size={16} />
                  {t("settings.privacyBtn", "Políticas y privacidad")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-cat-1) 14%, white)", color: "var(--color-cat-1)" }}
            >
              <Database size={18} />
            </div>
            <div className="min-w-0">
                <CardTitle>{t("settings.sourcesTitle", "Fuentes de datos conectadas")}</CardTitle>
                <CardDescription>
                  {t("settings.sourcesDesc", "Las conexiones a OpenAlex, Crossref, Semantic Scholar, arXiv, YouTube y Google Trends se gestionan en tiempo real.")}
                </CardDescription>
              </div>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-cat-3) 14%, white)", color: "var(--color-cat-3)" }}
              >
                <Globe size={18} />
              </div>
              <div className="min-w-0">
                <CardTitle>{t("settings.languageTitle", "Idioma del sistema")}</CardTitle>
                <CardDescription>{t("settings.languageDesc", "Selecciona el idioma de la interfaz (Español, English, Português).")}</CardDescription>
              </div>
            </div>
            <LanguageSelector variant="tabs" />
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-cat-7) 14%, white)", color: "var(--color-cat-7)" }}
            >
              <User size={18} />
            </div>
            <div className="min-w-0">
                <CardTitle>{t("settings.accountTitle", "Cuenta creada")}</CardTitle>
                <CardDescription>{t("settings.accountDesc", "Tu sesión está protegida con autenticación JWT y contraseña cifrada.")}</CardDescription>
              </div>
          </CardHeader>
        </Card>
      </motion.div>
    </motion.div>
  );
}
