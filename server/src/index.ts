import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { initSchema } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { researchRouter } from "./routes/research.js";
import { assistantRouter } from "./routes/assistant.js";
import { projectsRouter } from "./routes/projects.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

// Cabeceras HTTP de seguridad (protección contra XSS, sniffing, clickjacking, etc.)
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Limita intentos de login/registro por IP para mitigar ataques de fuerza bruta
// y credential stuffing sobre datos personales (correo/contraseña).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
});

// El esquema de la base de datos debe existir antes de atender la primera petición
// (en serverless el arranque en frío y la primera petición ocurren a la vez).
app.use(async (_req, _res, next) => {
  await schemaReady;
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    qwen: Boolean(config.qwen.apiKey),
    database: Boolean(config.databaseUrl),
    auth: Boolean(config.auth.jwtSecret),
  });
});

app.use("/api/auth", authLimiter, authRouter);

// A partir de aquí, todas las rutas requieren `Authorization: Bearer <token>`.
app.use("/api/research", requireAuth, researchRouter);
app.use("/api/assistant", requireAuth, assistantRouter);
app.use("/api/projects", requireAuth, projectsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const schemaReady = initSchema().catch((err) => console.error("[db] error inicializando esquema:", err));

// En Vercel no hay proceso que escuche en un puerto: la app se exporta y la
// plataforma la invoca por petición. En local y en Docker sí se levanta el servidor.
if (!process.env.VERCEL) {
  schemaReady.finally(() => {
    app.listen(config.port, () => {
      console.log(`ResearchLens API escuchando en http://localhost:${config.port}`);
    });
  });
}

export default app;
