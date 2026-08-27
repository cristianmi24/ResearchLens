import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import { mockTopics, overallTrendTimeline } from "@/data/mockTopics";
import { getArticleById } from "@/data/mockArticles";
import { TopicMap } from "@/components/research/TopicMap";
import { TrendChart } from "@/components/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { concentrationMeta } from "@/utils/similarity";
import { formatNumber } from "@/utils/formatting";
import type { Topic } from "@/types/topic";

const trendCopy: Record<Topic["trend"], string> = {
  creciente: "El interés científico por este tema ha aumentado durante los últimos años.",
  estable: "El interés científico por este tema se ha mantenido relativamente estable.",
  decreciente: "El interés científico por este tema ha disminuido en años recientes.",
};

export function ResearchMap() {
  const { topics: contextTopics, trends: contextTrends } = useResearch();
  const topics = contextTopics.length > 0 ? contextTopics : mockTopics;
  const overallTimeline = contextTrends.length > 0 ? contextTrends : overallTrendTimeline;
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const timeline = selectedTopic ? selectedTopic.timeline : overallTimeline;
  const meta = selectedTopic ? concentrationMeta[selectedTopic.concentration] : null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Mapa de investigación</h1>
        <p className="text-ink-secondary mt-2 leading-relaxed">
          Cada círculo representa un tema relacionado con tu idea. Su tamaño indica cuántos estudios existen y su
          color indica qué tan concentrada está la investigación en ese tema.
        </p>
      </div>

      <TopicMap topics={topics} selectedTopicId={selectedTopic?.id ?? null} onSelect={setSelectedTopic} />

      {selectedTopic && meta && (
        <Card className="p-5 sm:p-6 animate-slide-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-primary">{selectedTopic.name}</h2>
              <p className="text-sm text-ink-secondary mt-1">
                {meta.emoji} {meta.label} · {formatNumber(selectedTopic.studiesCount)} estudios aproximados
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4 text-sm">
            <div>
              <p className="text-ink-muted text-xs mb-1">Principales autores</p>
              <p className="text-ink-primary">{selectedTopic.topAuthors.join(", ")}</p>
            </div>
            <div>
              <p className="text-ink-muted text-xs mb-1">Principales años</p>
              <p className="text-ink-primary">{selectedTopic.topYears.join(", ")}</p>
            </div>
          </div>

          {selectedTopic.relatedArticleIds.length > 0 && (
            <div className="mt-4">
              <p className="text-ink-muted text-xs mb-2">Investigaciones relacionadas</p>
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
          <CardTitle>Evolución del tema</CardTitle>
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
            primaryLabel={selectedTopic ? selectedTopic.name : "Publicaciones"}
          />
          <p className="text-sm text-ink-secondary mt-2">
            {selectedTopic ? trendCopy[selectedTopic.trend] : trendCopy.creciente}
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link to="/opportunities" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Ver oportunidades de investigación →
        </Link>
      </div>
    </div>
  );
}
