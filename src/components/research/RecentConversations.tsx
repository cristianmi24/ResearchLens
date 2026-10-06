import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getHistory } from "@/services/researchApi";
import { useResearch } from "@/hooks/useResearch";
import { useLanguage } from "@/i18n/LanguageContext";
import type { SessionHistoryEntry } from "@/types/research";

const MAX_RECENT = 5;

/**
 * Últimas conversaciones (análisis) del usuario, para retomarlas desde el
 * Inicio. Cada una se abre con loadSession, que reemplaza todo el estado por
 * el de esa búsqueda puntual (no se mezcla con otras). Sin historial no
 * muestra nada: el Inicio de un usuario nuevo queda limpio.
 */
export function RecentConversations() {
  const navigate = useNavigate();
  const { loadSession } = useResearch();
  const { language, t } = useLanguage();
  const [entries, setEntries] = useState<SessionHistoryEntry[]>([]);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHistory()
      .then((data) => {
        if (!cancelled) setEntries(data.analyses.slice(0, MAX_RECENT));
      })
      .catch(() => {
        // Es un atajo opcional: si falla, el Inicio sigue funcionando sin la lista.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleOpen(id: string) {
    if (openingId) return;
    setOpeningId(id);
    try {
      await loadSession(id);
      navigate("/results");
    } finally {
      setOpeningId(null);
    }
  }

  if (entries.length === 0) return null;

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-6">
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-brand-600 shrink-0" />
              {t("home.recent.title", "Tus últimas conversaciones")}
            </CardTitle>
            <CardDescription>{t("home.recent.subtitle", "Retoma una de tus últimas 5 investigaciones.")}</CardDescription>
          </div>
          <Link to="/history" className="text-sm font-medium text-brand-600 hover:text-brand-700 focus-ring rounded">
            {t("home.recent.viewAll", "Ver todo el historial")}
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleOpen(entry.id)}
              disabled={openingId !== null}
              className="w-full flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 text-left hover:bg-surface-muted hover:border-brand-200 transition-colors focus-ring disabled:opacity-60"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink-primary line-clamp-2">{entry.originalIdea}</p>
                <p className="text-xs text-ink-muted mt-1">
                  {new Date(entry.createdAt).toLocaleString(language, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline text-xs font-medium text-ink-secondary tabular-nums">
                  {entry.relatedStudiesCount} {t("history.studies", "estudios")}
                </span>
                {openingId === entry.id ? (
                  <span className="text-xs text-brand-600">{t("history.opening", "Abriendo...")}</span>
                ) : (
                  <ArrowRight size={16} className="text-ink-muted" />
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </motion.section>
  );
}
