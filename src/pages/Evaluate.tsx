import { useRef, useState } from "react";
import { BookOpenCheck, FileText, GraduationCap, Loader2, Newspaper, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EvaluationReportView } from "@/components/evaluation/EvaluationReportView";
import { evaluateDocument, type DocumentType, type EvaluationReport } from "@/services/evaluationApi";
import { ACCEPTED_EXTENSIONS, extractTextFromFile } from "@/utils/extractText";
import type { AcademicLevel } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";

const MIN_WORDS = 300;

const optionClass = (active: boolean) =>
  [
    "flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500",
    active ? "border-brand-400 bg-pastel-lavender/70 text-ink-primary shadow-[var(--shadow-card)]" : "border-border bg-white text-ink-secondary hover:border-brand-300",
  ].join(" ");

/**
 * Evaluación de documentos: tesis (según nivel, con APA 7) y artículos de revista (estructura IMRyD, sin
 * imponer estilo de citación). El texto se extrae en el navegador y las referencias se verifican con
 * Crossref y OpenAlex en el servidor.
 */
export function Evaluate() {
  const { t, language } = useLanguage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocumentType>("tesis");
  const [level, setLevel] = useState<AcademicLevel>("pregrado");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<EvaluationReport | null>(null);

  const words = (text.match(/\S+/g) ?? []).length;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setIsReading(true);
    try {
      setText(await extractTextFromFile(file));
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("eval.readError", "No se pudo leer el archivo."));
    } finally {
      setIsReading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleEvaluate() {
    if (words < MIN_WORDS) {
      setError(t("eval.tooShort", `El documento debe tener al menos ${MIN_WORDS} palabras.`));
      return;
    }
    setError("");
    setIsEvaluating(true);
    setReport(null);
    try {
      setReport(await evaluateDocument({ docType, level, text, language }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("eval.error", "No se pudo evaluar el documento."));
    } finally {
      setIsEvaluating(false);
    }
  }

  function clearDocument() {
    setText("");
    setFileName("");
    setReport(null);
    setError("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <p className="text-sm font-semibold text-brand-600">{t("eval.badge", "Revisión como jurado y par evaluador")}</p>
        <h1 className="mt-1 text-3xl font-bold text-ink-primary">{t("eval.title", "Evaluar documento")}</h1>
        <p className="mt-2 text-ink-secondary">
          {t(
            "eval.subtitle",
            "Sube tu tesis o un artículo: revisamos estructura, coherencia y rigor según el nivel, aplicamos APA 7 en tesis y comprobamos que las referencias existan."
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("eval.formTitle", "1. ¿Qué vas a evaluar?")}</CardTitle>
          <CardDescription>
            {docType === "tesis"
              ? t("eval.thesisHint", "Las tesis se evalúan con la exigencia del nivel y con normas APA 7.")
              : t("eval.articleHint", "En artículos no se aplica APA: cada revista define su estilo. Se revisa la estructura (resumen, introducción, método…) y que las referencias existan.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <fieldset>
            <legend className="sr-only">{t("eval.docType", "Tipo de documento")}</legend>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className={optionClass(docType === "tesis")}>
                <input type="radio" name="docType" className="sr-only" checked={docType === "tesis"} onChange={() => setDocType("tesis")} />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pastel-sky text-pastel-sky-ink">
                  <GraduationCap size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink-primary">{t("eval.thesis", "Tesis / trabajo de grado")}</span>
                  <span className="text-xs">{t("eval.thesisDesc", "Pregrado, maestría o doctorado · APA 7")}</span>
                </span>
              </label>
              <label className={optionClass(docType === "articulo")}>
                <input type="radio" name="docType" className="sr-only" checked={docType === "articulo"} onChange={() => setDocType("articulo")} />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pastel-aqua text-pastel-aqua-ink">
                  <Newspaper size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink-primary">{t("eval.article", "Artículo de revista")}</span>
                  <span className="text-xs">{t("eval.articleDesc", "Estructura IMRyD · referencias verificadas")}</span>
                </span>
              </label>
            </div>
          </fieldset>

          {docType === "tesis" && (
            <label className="block text-sm font-medium text-ink-primary">
              {t("eval.level", "Nivel académico")}
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 sm:w-72"
              >
                <option value="pregrado">{t("idea.level.undergrad", "Pregrado")}</option>
                <option value="maestria">{t("idea.level.masters", "Maestría")}</option>
                <option value="doctorado">{t("idea.level.phd", "Doctorado")}</option>
              </select>
            </label>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("eval.docTitle", "2. Tu documento")}</CardTitle>
          <CardDescription>
            {t("eval.docDesc", "PDF, Word (.docx) o texto (.txt). El archivo se lee en tu navegador; solo se envía su texto para evaluarlo.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={fileInput} type="file" accept={ACCEPTED_EXTENSIONS} className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} id="doc-file" />
          <label
            htmlFor="doc-file"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-brand-200 bg-pastel-sky/40 px-6 py-8 text-center transition-colors hover:border-brand-400 hover:bg-pastel-sky/60"
          >
            {isReading ? <Loader2 size={28} className="animate-spin text-brand-600" /> : <Upload size={28} className="text-brand-600" />}
            <span className="font-semibold text-ink-primary">
              {isReading ? t("eval.reading", "Leyendo el documento…") : t("eval.drop", "Arrastra tu archivo aquí o haz clic para elegirlo")}
            </span>
            <span className="text-xs text-ink-muted">
              PDF · DOCX · TXT · {t("eval.minWords", `mínimo ${MIN_WORDS} palabras`)}
            </span>
          </label>

          {fileName && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-pastel-mint/60 px-4 py-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ink-primary">
                <FileText size={16} className="shrink-0 text-pastel-mint-ink" />
                <span className="truncate font-medium">{fileName}</span>
                <span className="shrink-0 text-ink-secondary">· {words.toLocaleString()} {t("eval.words", "palabras")}</span>
              </span>
              <button type="button" onClick={clearDocument} aria-label={t("eval.remove", "Quitar documento")} title={t("eval.remove", "Quitar documento")} className="rounded-lg p-1.5 text-ink-secondary hover:bg-white focus-ring">
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm font-medium text-status-critical-text" role="alert">
              {error}
            </p>
          )}

          <Button size="lg" onClick={handleEvaluate} disabled={isEvaluating || isReading || !fileName} aria-busy={isEvaluating}>
            {isEvaluating ? <Loader2 size={18} className="animate-spin" /> : <BookOpenCheck size={18} />}
            {isEvaluating ? t("eval.evaluating", "Evaluando… (revisión y verificación de referencias)") : t("eval.submit", "Evaluar documento")}
          </Button>
        </CardContent>
      </Card>

      {report && <EvaluationReportView report={report} />}
    </div>
  );
}
