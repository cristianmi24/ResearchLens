import { Link } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, Cpu, Database, FileText, Gauge, Scale, ShieldCheck, UserCheck, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLanguage } from "@/i18n/LanguageContext";

// Cada sección se escribe en las traducciones (terms.sN.title / terms.sN.desc); aquí solo se ordena y se le da un ícono y color.
const SECTIONS: { n: number; icon: LucideIcon; tone: string }[] = [
  { n: 1, icon: BookOpenCheck, tone: "bg-pastel-sky text-pastel-sky-ink" },
  { n: 2, icon: UserCheck, tone: "bg-pastel-lavender text-pastel-lavender-ink" },
  { n: 3, icon: ShieldCheck, tone: "bg-pastel-mint text-pastel-mint-ink" },
  { n: 4, icon: Cpu, tone: "bg-pastel-butter text-pastel-butter-ink" },
  { n: 5, icon: FileText, tone: "bg-pastel-aqua text-pastel-aqua-ink" },
  { n: 6, icon: Database, tone: "bg-pastel-indigo text-pastel-indigo-ink" },
  { n: 7, icon: Gauge, tone: "bg-pastel-peach text-pastel-peach-ink" },
  { n: 8, icon: Scale, tone: "bg-pastel-sky text-pastel-sky-ink" },
  { n: 9, icon: UserCog, tone: "bg-pastel-lavender text-pastel-lavender-ink" },
];

/** Condiciones del servicio: página pública (sin sesión), enlazada desde el registro, el inicio y la privacidad. */
export function TermsOfService() {
  const { t } = useLanguage();

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] px-4 py-10 animate-fade-in">
      <main className="mx-auto max-w-2xl space-y-6">
        <Link to="/" className="inline-block rounded-lg focus-ring" aria-label="Zetia">
          <img src="/logos/zetia.webp" alt="Zetia" className="h-10 w-auto" />
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-ink-primary">{t("terms.title", "Condiciones del servicio")}</h1>
          <p className="mt-2 leading-relaxed text-ink-secondary">
            {t("terms.subtitle", "Estas son las reglas básicas para usar Zetia, escritas en términos simples.")}
          </p>
          <p className="mt-2 text-xs font-semibold text-ink-muted">{t("terms.updated", "Última actualización: 26 de octubre de 2026")}</p>
        </div>

        {SECTIONS.map(({ n, icon: Icon, tone }) => (
          <Card key={n}>
            <CardHeader className="flex flex-row items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={19} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <CardTitle>
                  {n}. {t(`terms.s${n}.title`)}
                </CardTitle>
                <CardDescription className="mt-1 leading-relaxed">{t(`terms.s${n}.desc`)}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-ring rounded-lg">
            <ArrowLeft size={16} />
            {t("terms.back", "Volver")}
          </Link>
          <Link to="/privacidad" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 hover:underline focus-ring rounded-lg">
            {t("terms.privacyLink", "Leer la política de privacidad")}
          </Link>
        </div>
      </main>
    </div>
  );
}
