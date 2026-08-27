import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Project, ProjectHistoryEntry } from "@/types/project";
import { deleteProject as deleteProjectApi, listProjects, saveProject } from "@/services/projectsApi";
import { useAuth } from "@/hooks/useAuth";

interface ProjectsContextValue {
  projects: Project[];
  isLoading: boolean;
  getProject: (id: string) => Project | undefined;
  createOrUpdateProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  addHistoryEntry: (projectId: string, entry: Omit<ProjectHistoryEntry, "id">) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    listProjects().then((data) => {
      setProjects(data);
      setIsLoading(false);
    });
  }, [isAuthenticated]);

  const getProject = useCallback((id: string) => projects.find((p) => p.id === id), [projects]);

  const createOrUpdateProject = useCallback(async (project: Project) => {
    const saved = await saveProject(project);
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
  }, []);

  const removeProject = useCallback(async (id: string) => {
    await deleteProjectApi(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addHistoryEntry = useCallback((projectId: string, entry: Omit<ProjectHistoryEntry, "id">) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, history: [...p.history, { ...entry, id: `h-${Date.now()}` }] }
          : p
      )
    );
  }, []);

  const value = useMemo<ProjectsContextValue>(
    () => ({ projects, isLoading, getProject, createOrUpdateProject, removeProject, addHistoryEntry }),
    [projects, isLoading, getProject, createOrUpdateProject, removeProject, addHistoryEntry]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects debe usarse dentro de <ProjectsProvider>");
  return ctx;
}
