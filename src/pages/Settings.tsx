import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Check, Database, Globe, Mail, LogOut, PlayCircle, Save, ShieldCheck, User } from "lucide-react";
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
  const { user, logout, updateProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();
    if (!nextFirstName || !nextLastName) {
      setError(t("settings.profileRequired", "Escribe tu nombre y apellido."));
      setSaved(false);
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateProfile(nextFirstName, nextLastName);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.profileError", "No se pudo guardar tu perfil."));
    } finally {
      setIsSaving(false);
    }
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
        <p className="text-ink-secondary mt-2">{t("settings.subtitle", "Preferencias generales de Zetia.")}</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="overflow-visible">
          <CardContent className="pt-5 pb-5">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface-muted text-xl font-semibold text-ink-primary"
            >
              {initials(user?.firstName, user?.lastName, user?.email)}
            </div>
            <div className="mt-4">
              <p className="text-lg font-semibold tracking-tight text-ink-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">{user?.email}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-border/70 pt-4">
              <Button variant="secondary" className="shadow-sm" onClick={handleLogout}>
                <LogOut size={16} />
                {t("nav.logout", "Cerrar sesión")}
              </Button>
              <Button variant="outline" className="shadow-sm" onClick={() => openAssistantWithQuestion(DEMO_QUESTION)}>
                <PlayCircle size={16} />
                {t("home.howItWorksBtn", "Ver cómo funciona")}
              </Button>
              <Link to="/privacidad">
                <Button variant="outline" className="w-full shadow-sm sm:w-auto">
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-ink-secondary">
              <Database size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("settings.sourcesTitle", "Fuentes y preferencias")}</CardTitle>
              <CardDescription>
                {t("settings.sourcesDesc", "Las conexiones a OpenAlex, Crossref, Semantic Scholar, arXiv, YouTube y Google Trends se gestionan en tiempo real.")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-ink-secondary" />
                <div>
                  <p className="text-sm font-semibold text-ink-primary">{t("settings.languageTitle", "Idioma del sistema")}</p>
                  <p className="text-xs text-ink-secondary">{t("settings.languageDesc", "Selecciona el idioma de la interfaz.")}</p>
                </div>
              </div>
              <LanguageSelector variant="tabs" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-ink-secondary">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("settings.profileTitle", "Tu perfil")}</CardTitle>
              <CardDescription>
                {t("settings.profileDesc", "Actualiza la información que aparece en tu cuenta.")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink-primary">
                  {t("auth.modal.firstName", "Nombre")}
                  <input
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      setSaved(false);
                      setError("");
                    }}
                    maxLength={60}
                    autoComplete="given-name"
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-ink-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
                <label className="text-sm font-medium text-ink-primary">
                  {t("auth.modal.lastName", "Apellido")}
                  <input
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      setSaved(false);
                      setError("");
                    }}
                    maxLength={60}
                    autoComplete="family-name"
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-ink-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-ink-primary">
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-ink-muted" />
                  {t("auth.modal.email", "Correo")}
                </span>
                <input
                  value={user?.email ?? ""}
                  readOnly
                  disabled
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-surface-muted px-3 text-sm text-ink-secondary"
                />
                <span className="mt-1 block text-xs font-normal text-ink-muted">
                  {t("settings.emailHint", "El correo se usa para iniciar sesión y no se puede cambiar aquí.")}
                </span>
              </label>
              {error && <p className="text-sm text-status-critical-text" role="alert">{error}</p>}
              {saved && (
                <p className="flex items-center gap-1.5 text-sm text-status-good-text" role="status">
                  <Check size={16} />
                  {t("settings.profileSaved", "Cambios guardados correctamente.")}
                </p>
              )}
              <Button type="submit" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? t("settings.profileSaving", "Guardando...") : t("settings.profileSave", "Guardar cambios")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
