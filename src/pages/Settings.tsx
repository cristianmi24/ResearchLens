import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { CalendarHeart, Check, Database, Globe, Mail, LogOut, PlayCircle, Save, ShieldCheck, User } from "lucide-react";
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
  const { t, language } = useLanguage();
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

  // "Miembro desde": da sensación de perfil propio sin pedir datos nuevos.
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(language, { month: "long", year: "numeric" })
    : null;

  return (
    <motion.div
      className="max-w-2xl mx-auto animate-fade-in space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold text-ink-primary">{t("settings.title", "Configuración")}</h1>
        <p className="text-ink-secondary mt-2">{t("settings.subtitle", "Preferencias generales de Zetia.")}</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden">
          {/* Portada pastel con burbujas; el avatar se monta encima con un aro de color. */}
          <div className="relative h-28 bg-gradient-to-r from-pastel-sky via-pastel-lavender to-pastel-aqua sm:h-32">
            <span className="absolute left-10 top-4 h-16 w-16 rounded-full bg-white/45" aria-hidden="true" />
            <span className="absolute right-16 top-8 h-24 w-24 rounded-full bg-pastel-mint/80 blur-xl" aria-hidden="true" />
            <span className="absolute right-4 -bottom-6 h-20 w-20 rounded-full bg-pastel-butter/90 blur-lg" aria-hidden="true" />
          </div>
          <CardContent className="relative pb-6 pt-0">
            <div className="-mt-12 rounded-full bg-[conic-gradient(from_200deg,#9cc8ff,#b5a9fb,#8fe3e6,#9ee6c6,#9cc8ff)] p-1 shadow-[var(--shadow-card-hover)] w-fit">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white font-serif text-2xl font-bold text-brand-700">
                {initials(user?.firstName, user?.lastName, user?.email)}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-serif text-xl font-semibold text-ink-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-secondary">
                <Mail size={14} aria-hidden="true" />
                {user?.email}
              </p>
              {memberSince && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pastel-mint px-3 py-1 text-xs font-semibold text-pastel-mint-ink">
                  <CalendarHeart size={13} aria-hidden="true" />
                  {t("settings.memberSince", "Miembro desde")} {memberSince}
                </span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-border/70 pt-4">
              <Button variant="outline" onClick={() => openAssistantWithQuestion(DEMO_QUESTION)}>
                <PlayCircle size={16} />
                {t("home.howItWorksBtn", "Ver cómo funciona")}
              </Button>
              <Link to="/privacidad">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ShieldCheck size={16} />
                  {t("settings.privacyBtn", "Políticas y privacidad")}
                </Button>
              </Link>
              <Button variant="ghost" className="hover:bg-status-critical-bg hover:text-status-critical-text" onClick={handleLogout}>
                <LogOut size={16} />
                {t("nav.logout", "Cerrar sesión")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pastel-sky text-pastel-sky-ink">
              <Database size={19} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("settings.sourcesTitle", "Fuentes y preferencias")}</CardTitle>
              <CardDescription>
                {t("settings.sourcesDesc", "Las conexiones a OpenAlex, Crossref, Semantic Scholar, arXiv, YouTube y Google Trends se gestionan en tiempo real.")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-pastel-sky-ink" />
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pastel-lavender text-pastel-lavender-ink">
              <User size={19} />
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
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink-primary outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
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
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink-primary outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
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
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface-muted px-3 text-sm text-ink-secondary"
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
