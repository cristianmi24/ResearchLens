import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Compass, Trash2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { ExplorationLevel } from "@/components/research/ExplorationLevel";
import { formatDate } from "@/utils/formatting";
import type { Article } from "@/types/article";

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, removeProject, isLoading } = useProjects();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Cargando proyecto...</p>;
  }

  const project = id ? getProject(id) : undefined;

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-ink-secondary">No encontramos este proyecto.</p>
        <Link to="/projects" className="text-brand-600 font-medium text-sm mt-2 inline-block">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    if (!project || isDeleting) return;
    if (!window.confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    setIsDeleting(true);
    try {
      await removeProject(project.id);
      navigate("/projects");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink-primary">{project.title}</h1>
          <p className="text-ink-secondary mt-2">"{project.originalIdea}"</p>
        </div>
        <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="shrink-0">
          <Trash2 size={16} />
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <ExplorationLevel
            exploration={project.diagnosis.exploration}
            studiesCount={project.diagnosis.indicators.relatedStudiesCount}
          />
          <p className="text-sm text-ink-secondary mt-4 leading-relaxed">{project.diagnosis.exploration.explanation}</p>
        </CardContent>
      </Card>

      {project.savedArticles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ink-primary mb-4">Artículos guardados</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.savedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onOpen={setSelectedArticle} />
            ))}
          </div>
        </div>
      )}

      {project.opportunities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ink-primary mb-4">Oportunidades identificadas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pregunta actual</CardTitle>
        </CardHeader>
        <CardContent>
          {project.currentQuestion ? (
            <p className="text-ink-primary">"{project.currentQuestion}"</p>
          ) : (
            <p className="text-sm text-ink-muted">Aún no se ha seleccionado una pregunta de investigación.</p>
          )}
          <Link to="/refine">
            <Button variant="outline" size="sm" className="mt-4">
              Ir a reformular pregunta
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de cambios</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {project.history.map((entry, i) => (
              <li key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500 mt-1.5" />
                  {i < project.history.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-ink-primary">{entry.label}</p>
                  <p className="text-xs text-ink-muted">{formatDate(entry.date)}</p>
                  <p className="text-sm text-ink-secondary mt-1">{entry.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Link to="/map">
        <Button variant="outline">
          <Compass size={18} />
          Ver mapa de investigación
        </Button>
      </Link>

      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
