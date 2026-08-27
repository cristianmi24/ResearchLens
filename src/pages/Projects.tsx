import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Save } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useResearch } from "@/hooks/useResearch";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";

export function Projects() {
  const { projects, isLoading, createOrUpdateProject, removeProject } = useProjects();
  const { diagnosis, articles, opportunities, proposals, selectedQuestion, ideaInput } = useResearch();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveCurrent() {
    // Guarda contra doble clic: mientras la primera solicitud está en vuelo,
    // un segundo clic no debe crear un proyecto duplicado.
    if (!diagnosis || isSaving) return;
    setIsSaving(true);
    try {
      const project: Project = {
        // Id determinístico a partir de la sesión de análisis: volver a
        // guardar la misma búsqueda actualiza el mismo proyecto en vez de
        // duplicarlo.
        id: `proj-${diagnosis.id}`,
        title: ideaInput?.rawText.slice(0, 60) ?? diagnosis.originalIdea.slice(0, 60),
        originalIdea: diagnosis.originalIdea,
        createdAt: new Date().toISOString(),
        lastAnalyzedAt: diagnosis.analyzedAt,
        diagnosis,
        savedArticles: articles.slice(0, 3),
        opportunities,
        currentQuestion: selectedQuestion,
        proposals,
        history: [
          { id: `h-${Date.now()}`, label: "Idea inicial", date: diagnosis.analyzedAt, description: "Se registró la idea y se ejecutó el primer análisis." },
        ],
      };
      await createOrUpdateProject(project);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    await removeProject(id);
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">Mis proyectos</h1>
          <p className="text-ink-secondary mt-2">Continúa un análisis anterior o guarda tu progreso actual.</p>
        </div>
        <div className="flex gap-2">
          {diagnosis && (
            <Button variant="outline" onClick={handleSaveCurrent} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? "Guardando..." : "Guardar proyecto actual"}
            </Button>
          )}
          <Link to="/idea">
            <Button>
              <Plus size={16} />
              Nuevo análisis
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Cargando proyectos...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-ink-muted py-12 text-center">
          Aún no tienes proyectos guardados. Analiza una idea para comenzar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
