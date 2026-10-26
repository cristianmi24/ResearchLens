import { AlertTriangle, CheckCircle2, ExternalLink, ListChecks, Sparkles, Target, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { EvaluationReport, ReferenceStatus } from "@/services/evaluationApi";
import { useLanguage } from "@/i18n/LanguageContext";

const LEVEL_LABEL: Record<string, string> = { pregrado: "Pregrado", maestria: "Maestría", doctorado: "Doctorado" };

const STATUS: Record<ReferenceStatus, { label: string; className: string }> = {
  verificada: { label: "Verificada", className: "bg-pastel-mint text-pastel-mint-ink" },
  encontrada: { label: "Encontrada (sin DOI)", className: "bg-pastel-sky text-pastel-sky-ink" },
  "no-coincide": { label: "Datos no coinciden", className: "bg-pastel-butter text-pastel-butter-ink" },
  "doi-invalido": { label: "DOI inexistente", className: "bg-status-critical-bg text-status-critical-text" },
  "no-encontrada": { label: "No encontrada", className: "bg-pastel-peach text-pastel-peach-ink" },
};

function scoreTone(score: number): string {
  if (score >= 80) return "#0f7a55";
  if (score >= 60) return "#2160c4";
  if (score >= 40) return "#946200";
  return "#b4501f";
}

/** Anillo con la nota global (0–100). */
function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#ece8ff" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={scoreTone(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold" style={{ color: scoreTone(score) }}>
          {score}
        </span>
        <span className="text-xs font-medium text-ink-muted">/ 100</span>
      </div>
    </div>
  );
}

/** Barra de 4 segmentos para la calificación 0–4 de un criterio. */
function ScoreBar({ score }: { score: number }) {
  const color = score >= 3 ? "bg-[#3fbf8a]" : score === 2 ? "bg-[#f2c94c]" : "bg-[#f29a6b]";
  return (
    <div className="flex items-center gap-2" aria-label={`${score} de 4`}>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`h-2 w-7 rounded-full ${n <= score ? color : "bg-surface-muted"}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink-secondary">{score}/4</span>
    </div>
  );
}

export function EvaluationReportView({ report }: { report: EvaluationReport }) {
  const { t } = useLanguage();
  const isThesis = report.docType === "tesis";
  const statusCount = (s: ReferenceStatus) => report.references.checked.filter((r) => r.status === s).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 bg-gradient-to-br from-pastel-sky via-white to-pastel-aqua p-6 sm:flex-row sm:items-center">
          <ScoreRing score={report.overallScore} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700">
                {isThesis ? `${t("eval.thesis", "Tesis")} · ${LEVEL_LABEL[report.level ?? "pregrado"]}` : t("eval.article", "Artículo de revista")}
              </span>
              {report.verdict && <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">{report.verdict}</span>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-primary">{report.summary}</p>
            {report.levelFit && <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{report.levelFit}</p>}
            <p className="mt-3 text-xs text-ink-muted">
              {report.stats.words.toLocaleString()} {t("eval.words", "palabras")} · {report.stats.references} {t("eval.refs", "referencias")} ·{" "}
              {report.stats.citations} {t("eval.citations", "citas en el texto")} · skill {report.skill.id} v{report.skill.version}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="bg-pastel-mint/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-pastel-mint-ink" />
              {t("eval.strengths", "Fortalezas")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-ink-primary">
              {report.strengths.map((s) => (
                <li key={s} className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-pastel-mint-ink" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-pastel-butter/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target size={18} className="text-pastel-butter-ink" />
              {t("eval.priorities", "Ajustes prioritarios")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-ink-primary">
              {report.priorities.map((p, i) => (
                <li key={p} className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-pastel-butter-ink">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={18} className="text-brand-600" />
            {t("eval.criteria", "Evaluación por criterio")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {report.criteria.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-sm font-semibold text-ink-primary">{c.name}</h3>
                <ScoreBar score={c.score} />
              </div>
              <p className="mt-2 text-sm text-ink-secondary">{c.evidence}</p>
              {c.recommendation && (
                <p className="mt-2 rounded-xl bg-pastel-lavender/60 px-3 py-2 text-sm text-ink-primary">
                  <span className="font-semibold text-brand-700">{t("eval.recommendation", "Recomendación")}: </span>
                  {c.recommendation}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("eval.structure", "Estructura detectada")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {report.sections.map((s) => (
            <span
              key={s.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                s.found ? "bg-pastel-mint text-pastel-mint-ink" : "bg-pastel-peach text-pastel-peach-ink"
              }`}
            >
              {s.found ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {s.name}
              {s.found && <span className="font-normal opacity-75">· {s.words}</span>}
            </span>
          ))}
          <p className="w-full pt-1 text-xs text-ink-muted">
            {t("eval.structureNote", "Detección automática por títulos: si un título está escrito distinto, puede aparecer como faltante.")}
          </p>
        </CardContent>
      </Card>

      {report.apa && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("eval.apa", "Normas APA 7")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.apa.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-pastel-mint-ink">
                <CheckCircle2 size={16} />
                {t("eval.apaOk", "No se detectaron problemas de APA que se puedan comprobar automáticamente.")}
              </p>
            ) : (
              report.apa.map((issue) => (
                <details key={issue.type} className="group rounded-2xl border border-border bg-white p-3">
                  <summary className="flex cursor-pointer list-none items-start gap-2 text-sm text-ink-primary">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-pastel-butter-ink" />
                    <span className="flex-1">{issue.message}</span>
                  </summary>
                  <ul className="mt-2 space-y-1 pl-6 text-xs text-ink-secondary">
                    {issue.examples.map((ex) => (
                      <li key={ex} className="list-disc">
                        {ex}
                      </li>
                    ))}
                  </ul>
                </details>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("eval.references", "Verificación de referencias")}</CardTitle>
          <p className="mt-1 text-sm text-ink-secondary">
            {t("eval.referencesDesc", "Comprobadas con Crossref y OpenAlex")}: {report.references.checked.length} {t("eval.of", "de")}{" "}
            {report.references.total} · {statusCount("verificada") + statusCount("encontrada")} {t("eval.ok", "existen")} ·{" "}
            {statusCount("doi-invalido") + statusCount("no-coincide")} {t("eval.toFix", "por corregir")}
          </p>
        </CardHeader>
        <CardContent>
          {report.references.checked.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("eval.noRefs", "No se detectó una sección de referencias para verificar.")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {report.references.checked.map((r, i) => (
                <li key={`${i}-${r.raw.slice(0, 30)}`} className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:gap-3">
                  <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS[r.status].className}`}>
                    {STATUS[r.status].label}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="text-ink-primary">{r.raw}</p>
                    {r.note && <p className="mt-0.5 text-xs text-ink-secondary">{r.note}</p>}
                    {r.doi && (
                      <a
                        href={`https://doi.org/${r.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <ExternalLink size={12} />
                        {r.source ? `${r.source}: ` : ""}
                        {r.doi}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {report.references.total > report.references.checked.length && (
            <p className="mt-2 text-xs text-ink-muted">
              {t("eval.refsLimit", "Se verifican las primeras 30 referencias para no saturar las fuentes públicas.")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
