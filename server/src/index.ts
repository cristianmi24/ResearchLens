import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { initSchema } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { researchRouter } from "./routes/research.js";
import { assistantRouter } from "./routes/assistant.js";
import { projectsRouter } from "./routes/projects.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    qwen: Boolean(config.qwen.apiKey),
    database: Boolean(config.databaseUrl),
    auth: Boolean(config.auth.jwtSecret),
  });
});

app.use("/api/auth", authRouter);

// A partir de aquí, todas las rutas requieren `Authorization: Bearer <token>`.
app.use("/api/research", requireAuth, researchRouter);
app.use("/api/assistant", requireAuth, assistantRouter);
app.use("/api/projects", requireAuth, projectsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

initSchema()
  .catch((err) => console.error("[db] error inicializando esquema:", err))
  .finally(() => {
    app.listen(config.port, () => {
      console.log(`ResearchLens API escuchando en http://localhost:${config.port}`);
    });
  });
