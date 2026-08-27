import { apiFetch, ApiError } from "./api";
import type { Project } from "@/types/project";

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

export async function getProject(id: string): Promise<Project | undefined> {
  try {
    return await apiFetch<Project>(`/projects/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function saveProject(project: Project): Promise<Project> {
  return apiFetch<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
}
