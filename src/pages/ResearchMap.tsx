import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Network } from "lucide-react";
import { MapIcon } from "@/components/map/MapIcon";
import { useResearch } from "@/hooks/useResearch";
import { mockTopics, overallTrendTimeline } from "@/data/mockTopics";
import { getArticleById } from "@/data/mockArticles";
import { TopicMap } from "@/components/research/TopicMap";
import { TrendChart } from "@/components/charts/TrendChart";
import { GeoMapSection } from "@/components/map/GeoMapSection";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { concentrationMeta } from "@/utils/similarity";
import { formatNumber } from "@/utils/formatting";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Topic } from "@/types/topic";
type MapTab = "topics" | "geo";

export function ResearchMap() {
  const { t } = useLanguage();
  const { topics: contextTopics, trends: contextTrends, diagnosis } = useResearch();
  const topics = contextTopics.length > 0 ? contextTopics : mockTopics;
  const overallTimeline = contextTrends.length > 0 ? contextTrends : overallTrendTimeline;
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [tab, setTab] = useState<MapTab>("topics");
  const geoDistribution = diagnosis?.geoDistribution ?? null;

  const timeline = selectedTopic ? selectedTopic.timeline : overallTimeline;
  const meta = selectedTopic ? concentrationMeta[selectedTopic.concentration] : null;

  const trendCopy: Record<Topic["trend"], string> = {
    creciente: t(
      "map.trendGrowing",
      "El interés científico por este tema ha aumentado durante los últimos años."
    ),
    estable: t(
      "map.trendStable",
      "El interés científico por este tema se ha mantenido relativamente estable."
    ),
    decreciente: t(
      "map.trendDeclining",
      "El interés científico por este tema ha disminuido en años recientes."
    ),
  };

  const concLabels = {
    alta: t("map.concHigh", "Alta concentración"),
    media: t("map.concMedium", "Concentración media"),
    baja: t("map.concLow", "Baja concentración"),
  };

  return (
    <div className={`${tab === "geo" ? "w-full" : "max-w-4xl mx-auto"} animate-fade-in space-y-8`}>
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">
          {t("map.title", "Mapa de investigación")}
        </h1>
        <p className="text-ink-secondary mt-2 leading-relaxed">
          {tab === "geo"
            ? t(
                "map.geoSubtitle",
                "Mira en qué países, y en qué departamentos de Colombia, se han publicado los estudios sobre tu tema, según la institución de sus autores."
              )
            : t(
                "map.subtitle",
                "Cada círculo representa un tema relacionado con tu idea. Su tamaño indica cuántos estudios existen y su color indica qué tan concentrada está la investigación en ese tema."
              )}
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-border bg-white p-1 shadow-sm" role="tablist">
        {(
          [
            ["topics", t("map.tabTopics", "Mapa de temas"), Network],
            ["geo", t("map.tabGeo", "Mapa geográfico"), MapIcon],
          ] as const
        ).map(([id, label, TabIcon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-ring ${
              tab === id ? "bg-brand-600 text-white" : "text-ink-secondary hover:bg-surface-muted hover:text-ink-primary"
            }`}
          >
            <TabIcon size={18} />
            {label}
          </button>
        ))}
      </div>

      {tab === "geo" ? (
        <section className="space-y-4">
          {geoDistribution ? (
            <GeoMapSection distribution={geoDistribution} showHeader={false} />
          ) : (
            <Card className="p-8 text-center">
              <MapIcon size={56} className="mx-auto" />
              <h2 className="mt-3 text-base font-semibold text-ink-primary">
                {t("map.geoEmptyTitle", "Este análisis no tiene distribución geográfica")}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">
                {t(
                  "map.geoEmptyDesc",
                  "Se guarda al analizar una idea. Si esta búsqueda es anterior a esta función o OpenAlex no respondió, vuelve a analizar tu idea para ver dónde se investiga."
                )}
              </p>
              <Link to="/idea" className="mt-5 inline-block">
                <Button>{t("map.geoEmptyCta", "Analizar una idea")}</Button>
              </Link>
            </Card>
          )}
        </section>
      ) : (
        <>
      <TopicMap topics={topics} selectedTopicId={selectedTopic?.id ?? null} onSelect={setSelectedTopic} />

      {selectedTopic && meta && (
        <Card className="p-5 sm:p-6 animate-slide-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-primary">{selectedTopic.name}</h2>
              <p className="text-sm text-ink-secondary mt-1">
                {meta.emoji} {concLabels[selectedTopic.concentration] || meta.label} ·{" "}
                {formatNumber(selectedTopic.studiesCount)} {t("results.approxStudies", "estudios aproximados")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4 text-sm">
            <div>
              <p className="text-ink-muted text-xs mb-1">{t("map.topAuthors", "Principales autores")}</p>
              <p className="text-ink-primary">{selectedTopic.topAuthors.join(", ")}</p>
            </div>
            <div>
              <p className="text-ink-muted text-xs mb-1">{t("map.topYears", "Principales años")}</p>
              <p className="text-ink-primary">{selectedTopic.topYears.join(", ")}</p>
            </div>
          </div>

          {selectedTopic.relatedArticleIds.length > 0 && (
            <div className="mt-4">
              <p className="text-ink-muted text-xs mb-2">
                {t("map.relatedResearch", "Investigaciones relacionadas")}
              </p>
              <ul className="space-y-1.5">
                {selectedTopic.relatedArticleIds.map((id) => {
                  const article = getArticleById(id);
                  if (!article) return null;
                  return (
                    <li key={id} className="text-sm text-ink-primary flex items-start gap-1.5">
                      <ArrowUpRight size={14} className="mt-1 text-brand-500 shrink-0" />
                      {article.title}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("map.topicEvolution", "Evolución del tema")}</CardTitle>
          <CardDescription>
            {selectedTopic
              ? `Publicaciones por año sobre "${selectedTopic.name}", comparadas con el conjunto de temas relacionados.`
              : "Publicaciones por año en el conjunto de temas relacionados."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={timeline}
            compareData={selectedTopic ? overallTimeline : undefined}
            primaryLabel={selectedTopic ? selectedTopic.name : t("results.publications", "Publicaciones")}
          />
          <p className="text-sm text-ink-secondary mt-2">
            {selectedTopic ? trendCopy[selectedTopic.trend] : trendCopy.creciente}
          </p>
        </CardContent>
      </Card>
        </>
      )}

      <div className="text-center">
        <Link to="/opportunities" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          {t("map.viewOpportunities", "Ver oportunidades de investigación →")}
        </Link>
      </div>
    </div>
  );
}
