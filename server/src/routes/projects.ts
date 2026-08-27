import { Router } from "express";
import { randomUUID } from "node:crypto";
import { listProjects, getProject, upsertProject, deleteProject } from "../db/projects.js";
import type { Project } from "../types.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res) => {
  try {
    res.json(await listProjects(req.userId!));
  } catch (err) {
    console.error("[GET /projects]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

projectsRouter.get("/:id", async (req, res) => {
  try {
    const project = await getProject(req.params.id, req.userId!);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });
    res.json(project);
  } catch (err) {
    console.error("[GET /projects/:id]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

projectsRouter.post("/", async (req, res) => {
  try {
    const body = req.body as Partial<Project>;
    const now = new Date().toISOString();
    const project: Project = {
      id: body.id ?? randomUUID(),
      title: body.title ?? "Proyecto sin título",
      originalIdea: body.originalIdea ?? "",
      createdAt: body.createdAt ?? now,
      lastAnalyzedAt: now,
      diagnosis: body.diagnosis as Project["diagnosis"],
      savedArticles: body.savedArticles ?? [],
      opportunities: body.opportunities ?? [],
      currentQuestion: body.currentQuestion ?? null,
      proposals: body.proposals ?? [],
      history: body.history ?? [],
    };
    if (!project.diagnosis) return res.status(400).json({ error: "diagnosis es requerido" });

    const saved = await upsertProject(project, req.userId!);
    const confirmed = await getProject(saved.id, req.userId!);
    if (!confirmed) {
      return res.status(403).json({ error: "Ese id de proyecto pertenece a otro usuario" });
    }
    res.json(confirmed);
  } catch (err) {
    console.error("[POST /projects]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});

projectsRouter.delete("/:id", async (req, res) => {
  try {
    await deleteProject(req.params.id, req.userId!);
    res.status(204).end();
  } catch (err) {
    console.error("[DELETE /projects/:id]", err);
    res.status(502).json({ error: (err as Error).message });
  }
});
