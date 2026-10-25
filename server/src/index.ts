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
import { unicordobaRouter } from "./routes/unicordoba.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

// Detrás del proxy de Vercel/Docker la IP real llega en X-Forwarded-For; sin esto todos los
// usuarios compartirían la IP del proxy y los límites de abajo bloquearían a todos a la vez.
app.set("trust proxy", 1);

// Cabeceras HTTP de seguridad (protección contra XSS, sniffing, clickjacking, etc.)
app.use(helmet());
// Solo los orígenes conocidos pueden llamar a la API desde un navegador. En desarrollo se acepta
// cualquier puerto de localhost porque Vite cambia de puerto si el habitual está ocupado.
const isDev = process.env.NODE_ENV !== "production" && !process.env.VERCEL;
const isAllowedOrigin = (origin: string) =>
  config.corsOrigins.includes(origin) || (isDev && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || isAllowedOrigin(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);
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

// Tope general por IP para toda la API (frena scraping y abuso automatizado).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo." },
});

// Rutas que gastan IA o APIs académicas con cuota: un tope más estricto evita que un abuso agote
// las claves (Qwen, Scopus, Springer, IEEE) para todos los demás usuarios.
const expensiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Alcanzaste el límite de análisis por ahora. Intenta de nuevo en unos minutos." },
});

app.use("/api", apiLimiter);
app.use(
  ["/api/research/analyze", "/api/research/refine", "/api/research/article-search", "/api/assistant/chat", "/api/unicordoba"],
  expensiveLimiter,
);

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
    springer: Boolean(config.springer.apiKey),
    ieee: Boolean(config.ieee.apiKey),
    scopus: Boolean(config.scopus.apiKey),
  });
});

app.use("/api/auth", authLimiter, authRouter);

// A partir de aquí, todas las rutas requieren `Authorization: Bearer <token>`.
app.use("/api/research", requireAuth, researchRouter);
app.use("/api/assistant", requireAuth, assistantRouter);
app.use("/api/projects", requireAuth, projectsRouter);
app.use("/api/unicordoba", requireAuth, unicordobaRouter);

// Rutas de API inexistentes: JSON 404 en vez de la página HTML por defecto de Express.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

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
