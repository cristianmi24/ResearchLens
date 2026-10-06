import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Badge";
import { ResearchScore } from "@/components/research/ResearchScore";
import { ExplorationLevel } from "@/components/research/ExplorationLevel";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { RelatedVideos } from "@/components/research/RelatedVideos";
import { TopicMap } from "@/components/research/TopicMap";
import { TrendChart } from "@/components/charts/TrendChart";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { DelimitationOptionCard } from "@/components/opportunities/DelimitationOptionCard";
import { mockTopics, overallTrendTimeline } from "@/data/mockTopics";
import { mockOpportunities, mockDelimitationOptions } from "@/data/mockOpportunities";
import { concentrationMeta } from "@/utils/similarity";
import { formatNumber } from "@/utils/formatting";
import { PublicInterestCard } from "@/components/research/PublicInterestCard";
import { GeoMapSection } from "@/components/map/GeoMapSection";
import { explorationMeta } from "@/utils/similarity";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Article } from "@/types/article";
import type { Topic } from "@/types/topic";

export function Results() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    diagnosis,
    articles,
    topics: contextTopics,
    trends: contextTrends,
    opportunities: contextOpportunities,
    delimitationOptions: contextOptions,
    hasResults,
  } = useResearch();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (!hasResults) {
      navigate("/idea");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResults]);

  if (!diagnosis) return null;

  const meta = explorationMeta[diagnosis.exploration.level];
  const topArticles = articles.slice(0, 4);
  const topics = contextTopics.length > 0 ? contextTopics : mockTopics;
  const overallTimeline = contextTrends.length > 0 ? contextTrends : overallTrendTimeline;
  const opportunities = contextOpportunities.length > 0 ? contextOpportunities : mockOpportunities;
  const delimitationOptions = contextOptions.length > 0 ? contextOptions : mockDelimitationOptions;
  const topicTimeline = selectedTopic ? selectedTopic.timeline : overallTimeline;

  function handleDownloadPdf() {
    window.print();
  }

  const concLabels = {
    alta: t("map.concHigh", "Alta concentración"),
    media: t("map.concMedium", "Concentración media"),
    baja: t("map.concLow", "Baja concentración"),
  };

  return (
    <Card className="print-report w-full animate-fade-in overflow-hidden">
      <div className="space-y-8 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-primary">
              {t("results.title", "Diagnóstico de tu idea")}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="no-print inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-muted focus-ring"
            title={t("results.downloadTitle", "Guardar resultados como PDF")}
          >
            <Download size={17} />
            <span className="hidden sm:inline">{t("results.downloadPdf", "Descargar PDF")}</span>
          </button>
        </div>

        <div>
          <Card className="mt-4 p-4 bg-brand-50/60 border-brand-100">
            <p className="text-xs font-medium text-brand-700 mb-1">{t("results.yourIdea", "Tu idea")}</p>
            <p className="text-ink-primary">"{diagnosis.refinedQuestionPreview}"</p>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{meta.emoji}</span>
            <h2 className="text-sm font-bold text-ink-primary uppercase tracking-wide">
              {diagnosis.exploration.label || meta.label}
            </h2>
          </div>
          <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
            {diagnosis.exploration.explanation}
          </p>
        </Card>

        <div>
          <ResearchScore indicators={diagnosis.indicators} />
          <p className="text-xs text-ink-muted mt-3">{diagnosis.disclaimer}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("results.whatFound", "¿Qué encontramos?")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-secondary mb-3">
              {t("results.relatedTo", "Tu idea se relaciona principalmente con:")}
            </p>
            <div className="flex flex-wrap gap-2">
              {diagnosis.relatedConcepts.map((concept) => (
                <Chip key={concept}>{concept}</Chip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("results.howExplored", "¿Qué tan explorado está?")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExplorationLevel
              exploration={diagnosis.exploration}
              studiesCount={diagnosis.indicators.relatedStudiesCount}
            />
          </CardContent>
        </Card>

        {diagnosis.publicInterest && <PublicInterestCard data={diagnosis.publicInterest} />}

        <GeoMapSection distribution={diagnosis.geoDistribution} />

        <div>
          <h2 className="text-lg font-semibold text-ink-primary mb-1">
            {t("results.topArticlesTitle", "Investigaciones más relacionadas")}
          </h2>
          <p className="text-sm text-ink-secondary mb-4">
            {t(
              "results.topArticlesDesc",
              "Estas son las publicaciones con mayor similitud encontradas en las fuentes consultadas."
            )}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {topArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onOpen={setSelectedArticle} />
            ))}
          </div>
        </div>

        <RelatedVideos
          query={diagnosis.relatedConcepts.slice(0, 3).join(" ") || diagnosis.refinedQuestionPreview}
        />

        <div className="border-t border-border pt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-ink-primary">
              {t("results.researchMapTitle", "Mapa de investigación")}
            </h2>
            <p className="text-sm text-ink-secondary mt-1">
              {t(
                "results.researchMapDesc",
                "Explora los temas relacionados con tu idea dentro de este mismo resultado."
              )}
            </p>
          </div>
          <TopicMap topics={topics} selectedTopicId={selectedTopic?.id ?? null} onSelect={setSelectedTopic} />
          {selectedTopic && (
            <div className="rounded-xl border border-border bg-surface-muted p-5 animate-slide-up">
              <h3 className="font-semibold text-ink-primary">{selectedTopic.name}</h3>
              <p className="text-sm text-ink-secondary mt-1">
                {concLabels[selectedTopic.concentration] || concentrationMeta[selectedTopic.concentration].label} ·{" "}
                {formatNumber(selectedTopic.studiesCount)} {t("results.approxStudies", "estudios aproximados")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4 text-sm">
                <div>
                  <p className="text-xs text-ink-muted mb-1">{t("results.topAuthors", "Principales autores")}</p>
                  <p className="text-ink-primary">{selectedTopic.topAuthors.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted mb-1">{t("results.topYears", "Principales años")}</p>
                  <p className="text-ink-primary">{selectedTopic.topYears.join(", ")}</p>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold text-ink-primary">
              {t("results.topicEvolutionTitle", "Evolución de los temas")}
            </h3>
            <p className="text-sm text-ink-secondary mt-1">
              {t("results.topicEvolutionDesc", "Publicaciones por año en la literatura relacionada.")}
            </p>
            <div className="mt-4">
              <TrendChart
                data={topicTimeline}
                compareData={selectedTopic ? overallTimeline : undefined}
                primaryLabel={selectedTopic?.name ?? t("results.publications", "Publicaciones")}
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-primary">
              {t("results.opportunitiesTitle", "Oportunidades de investigación")}
            </h2>
            <p className="text-sm text-ink-secondary mt-1 mb-4">
              {t(
                "results.opportunitiesDesc",
                "Posibles áreas de diferenciación identificadas en las fuentes consultadas."
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-primary mb-3">
              {t("results.delimitTitle", "Formas de delimitar tu idea")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {delimitationOptions.map((option) => (
                <DelimitationOptionCard
                  key={option.id}
                  option={option}
                  onExplore={() => navigate("/refine")}
                />
              ))}
            </div>
          </div>
        </div>

        {selectedArticle && (
          <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </div>
    </Card>
  );
}
