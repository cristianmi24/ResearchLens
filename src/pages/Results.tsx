import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Compass, FlaskConical } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ResearchScore } from "@/components/research/ResearchScore";
import { ExplorationLevel } from "@/components/research/ExplorationLevel";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { RelatedVideos } from "@/components/research/RelatedVideos";
import { PublicInterestCard } from "@/components/research/PublicInterestCard";
import { explorationMeta } from "@/utils/similarity";
import type { Article } from "@/types/article";

export function Results() {
  const navigate = useNavigate();
  const { diagnosis, articles, hasResults } = useResearch();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!hasResults) {
      navigate("/idea");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResults]);

  if (!diagnosis) return null;

  const meta = explorationMeta[diagnosis.exploration.level];
  const topArticles = articles.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Diagnóstico de tu idea</h1>
        <Card className="mt-4 p-4 bg-brand-50/60 border-brand-100">
          <p className="text-xs font-medium text-brand-700 mb-1">Tu idea</p>
          <p className="text-ink-primary">"{diagnosis.refinedQuestionPreview}"</p>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{meta.emoji}</span>
          <h2 className="text-sm font-bold text-ink-primary uppercase tracking-wide">{meta.label}</h2>
        </div>
        <p className="text-sm text-ink-secondary mt-2 leading-relaxed">{diagnosis.exploration.explanation}</p>
      </Card>

      <div>
        <ResearchScore indicators={diagnosis.indicators} />
        <p className="text-xs text-ink-muted mt-3">{diagnosis.disclaimer}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>¿Qué encontramos?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-secondary mb-3">Tu idea se relaciona principalmente con:</p>
          <div className="flex flex-wrap gap-2">
            {diagnosis.relatedConcepts.map((concept) => (
              <Chip key={concept}>{concept}</Chip>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Qué tan explorado está?</CardTitle>
        </CardHeader>
        <CardContent>
          <ExplorationLevel exploration={diagnosis.exploration} />
        </CardContent>
      </Card>

      {diagnosis.publicInterest && <PublicInterestCard data={diagnosis.publicInterest} />}

      <div>
        <h2 className="text-lg font-semibold text-ink-primary mb-1">Investigaciones más relacionadas</h2>
        <p className="text-sm text-ink-secondary mb-4">
          Estas son las publicaciones con mayor similitud encontradas en las fuentes consultadas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {topArticles.map((article) => (
            <ArticleCard key={article.id} article={article} onOpen={setSelectedArticle} />
          ))}
        </div>
      </div>

      <RelatedVideos query={diagnosis.relatedConcepts.slice(0, 3).join(" ") || diagnosis.refinedQuestionPreview} />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link to="/map" className="flex-1">
          <Button variant="outline" className="w-full">
            <Compass size={18} />
            Ver mapa de investigación
          </Button>
        </Link>
        <Link to="/opportunities" className="flex-1">
          <Button className="w-full">
            <FlaskConical size={18} />
            Ver oportunidades
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
