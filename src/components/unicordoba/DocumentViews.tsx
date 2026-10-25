import { AlertTriangle, BookOpen, ExternalLink, User, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { MultiSourceResult, PanelDocument } from "@/services/unicordobaApi";
import { useLanguage } from "@/i18n/LanguageContext";

const REPOSITORY_URL = "https://repositorio.unicordoba.edu.co";

/** Enlace para abrir el documento en su fuente: DOI si lo hay; si es de Unicórdoba, la búsqueda en el repositorio. */
function documentLink(doc: PanelDocument): string | null {
  if (doc.doi) return `https://doi.org/${doc.doi}`;
  if (doc.source === "Unicórdoba") return `${REPOSITORY_URL}/search?query=${encodeURIComponent(`"${doc.title}"`)}`;
  return null;
}

export function DocumentCard({ doc, onOpen }: { doc: PanelDocument; onOpen: () => void }) {
  const { t } = useLanguage();
  return (
    <Card className="flex flex-col p-5 hover:border-brand-300 transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{doc.year || "s.f."}</Badge>
        <Badge>{doc.source}</Badge>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink-primary leading-snug line-clamp-3">{doc.title}</h3>
      {doc.authors.length > 0 && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-secondary">
          <User size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{doc.authors.join("; ")}</span>
        </p>
      )}
      {doc.abstract && <p className="mt-3 text-sm text-ink-secondary line-clamp-4">{doc.abstract}</p>}
      <div className="mt-auto pt-4">
        <Button size="sm" variant="outline" onClick={onOpen}>
          <BookOpen size={15} />
          {t("unicor.viewMore", "Ver resumen completo")}
        </Button>
      </div>
    </Card>
  );
}

export function DocumentModal({ doc, onClose }: { doc: PanelDocument; onClose: () => void }) {
  const { t } = useLanguage();
  const link = documentLink(doc);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="doc-title">
      <button
        type="button"
        aria-label={t("unicor.close", "Cerrar")}
        className="absolute inset-0 bg-ink-primary/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("unicor.close", "Cerrar")}
          title={t("unicor.close", "Cerrar")}
          className="absolute right-4 top-4 rounded-lg p-2 text-ink-secondary hover:bg-surface-muted focus-ring"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 pr-10">
          <Badge tone="brand">{doc.year || "s.f."}</Badge>
          <Badge>{doc.source}</Badge>
        </div>
        <h2 id="doc-title" className="mt-3 text-lg font-semibold text-ink-primary leading-snug">
          {doc.title}
        </h2>
        {doc.authors.length > 0 && <p className="mt-2 text-sm text-ink-secondary">{doc.authors.join("; ")}</p>}
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("unicor.abstract", "Resumen")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-primary whitespace-pre-line">
          {doc.abstract || t("unicor.noAbstract", "Este documento no tiene resumen disponible.")}
        </p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ExternalLink size={15} />
            {doc.source === "Unicórdoba"
              ? t("unicor.openRepo", "Abrir en el repositorio Unicórdoba")
              : `${t("unicor.openSource", "Abrir en")} ${doc.source}`}
          </a>
        )}
      </div>
    </div>
  );
}

/** Resumen de una búsqueda en varias fuentes: total y cuántos resultados aportó cada base. */
export function SourceSummary({ result, query }: { result: MultiSourceResult; query: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-ink-secondary" aria-live="polite">
      <span>
        <span className="font-semibold text-ink-primary">{result.articles.length}</span> {t("unicor.resultsSince", "resultados desde")}{" "}
        {result.desdeAnio} {t("unicor.for", "para")} <span className="font-medium text-ink-primary">“{query}”</span>:
      </span>
      {result.sources.map((s) => (
        <span
          key={s.id}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            s.ok ? "bg-surface-muted text-ink-secondary" : "bg-status-warning-bg text-status-warning-text"
          }`}
        >
          {!s.ok && <AlertTriangle size={12} aria-hidden="true" />}
          {s.name} · {s.ok ? s.count : t("unicor.sourceFailed", "sin respuesta")}
        </span>
      ))}
    </div>
  );
}
