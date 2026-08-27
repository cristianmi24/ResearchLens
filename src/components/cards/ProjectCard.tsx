import { Link } from "react-router-dom";
import { ArrowRight, Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatting";
import { explorationMeta } from "@/utils/similarity";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const meta = explorationMeta[project.diagnosis.exploration.level];

  return (
    <Card className="p-5 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-ink-primary leading-snug min-w-0 break-words">{project.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge tone="neutral">
            {meta.emoji} {meta.label}
          </Badge>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(project.id)}
              aria-label="Eliminar proyecto"
              title="Eliminar proyecto"
              className="p-1.5 rounded-lg text-ink-muted hover:bg-[var(--color-status-critical-bg)] hover:text-[var(--color-status-critical-text)] focus-ring transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-ink-secondary mt-2 line-clamp-2 flex-1">{project.originalIdea}</p>
      <p className="text-xs text-ink-muted mt-3">Último análisis: {formatDate(project.lastAnalyzedAt)}</p>
      <Link
        to={`/projects/${project.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 mt-4 focus-ring rounded"
      >
        Continuar
        <ArrowRight size={16} />
      </Link>
    </Card>
  );
}
