import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Share2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLanguage } from "@/i18n/LanguageContext";

export function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] px-4 py-10 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ResearchLens logo" className="h-8 w-8 object-contain rounded-lg shadow-xs" />
          <span className="font-semibold text-ink-primary tracking-tight">ResearchLens</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">
            {t("privacy.title", "Políticas y privacidad")}
          </h1>
          <p className="text-ink-secondary mt-2 leading-relaxed">
            {t(
              "privacy.subtitle",
              "Este resumen explica, en términos simples, qué datos guardamos y con quién los compartimos."
            )}
          </p>
        </div>

        <Card className="border border-border bg-white shadow-card">
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Lock size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("privacy.card1.title", "Qué guardamos de ti")}</CardTitle>
              <CardDescription className="mt-1 leading-relaxed">
                {t(
                  "privacy.card1.desc",
                  "Tu nombre, apellido y correo (para identificar tu cuenta), y tu contraseña, que nunca se guarda en texto plano: se almacena con un hash bcrypt irreversible. También guardamos las ideas de investigación que analizas y los proyectos que decides guardar, asociados únicamente a tu cuenta."
                )}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-white shadow-card">
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("privacy.card2.title", "Quién puede ver tus datos")}</CardTitle>
              <CardDescription className="mt-1 leading-relaxed">
                {t(
                  "privacy.card2.desc",
                  "Solo tú. Cada análisis, proyecto y conversación con el asistente queda ligado a tu usuario mediante autenticación (JWT); el backend valida en cada solicitud que los datos pedidos te pertenezcan antes de devolverlos."
                )}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-white shadow-card">
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Share2 size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>
                {t("privacy.card3.title", "Con qué servicios de terceros trabajamos")}
              </CardTitle>
              <CardDescription className="mt-1 leading-relaxed">
                {t(
                  "privacy.card3.desc",
                  "Para buscar literatura académica real consultamos OpenAlex, Crossref, arXiv y Semantic Scholar. Para el análisis y el asistente usamos inteligencia artificial. Ninguno de estos servicios recibe tu identidad personal: solo reciben el texto de tu idea de investigación para poder buscar y razonar sobre ella."
                )}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-white shadow-card">
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Database size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("privacy.card4.title", "Dónde se almacena todo")}</CardTitle>
              <CardDescription className="mt-1 leading-relaxed">
                {t(
                  "privacy.card4.desc",
                  "En una base de datos segura y administrada, con conexión cifrada (TLS). No compartimos ni vendemos tus datos a terceros con fines comerciales."
                )}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-white shadow-card">
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-good-bg text-status-good-text">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle>{t("privacy.card5.title", "Cómo protegemos tus datos")}</CardTitle>
              <CardDescription className="mt-1 leading-relaxed">
                {t(
                  "privacy.card5.desc",
                  "Tu contraseña nunca se guarda en texto plano: se cifra con bcrypt (hash irreversible). Cada sesión se identifica con un JWT firmado y con expiración. El servidor aplica límites de tasa y cabeceras de seguridad HTTP."
                )}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft size={16} />
          {t("privacy.back", "Volver")}
        </Link>
      </div>
    </div>
  );
}
