import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name} en .env`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),

  // Qwen (Alibaba Cloud DashScope, modo compatible con OpenAI).
  // qwen3.7-flash es un modelo "híbrido" con razonamiento (chain-of-thought)
  // activado por defecto, que puede gastar cientos de tokens de "thinking"
  // en una respuesta trivial; se manda siempre `enable_thinking:false` (ver
  // lib/qwen.ts) para que se comporte como un flash normal y barato.
  // text-embedding-v3 para embeddings (soporta batch real: varios textos en
  // una sola llamada, a diferencia de Gemini que solo aceptaba uno por vez).
  qwen: {
    apiKey: process.env.QWEN_API_KEY ?? "",
    baseUrl: process.env.QWEN_BASE_URL ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    textModel: process.env.QWEN_MODEL ?? "qwen3.7-flash",
    embeddingModel: process.env.QWEN_EMBEDDING_MODEL ?? "text-embedding-v3",
  },

  openAlex: {
    mailto: process.env.OPENALEX_MAILTO ?? "",
    apiKey: process.env.OPENALEX_API_KEY ?? "",
  },

  crossref: {
    mailto: process.env.CROSSREF_MAILTO ?? "",
  },

  semanticScholar: {
    apiKey: process.env.SEMANTIC_SCHOLAR_API_KEY ?? "",
  },

  arxiv: {
    baseUrl: process.env.ARXIV_API_BASE_URL ?? "http://export.arxiv.org/api/query",
  },

  doaj: {
    baseUrl: process.env.DOAJ_API_BASE_URL ?? "https://doaj.org/api",
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY ?? "",
  },

  databaseUrl: process.env.DATABASE_URL ?? "",

  auth: {
    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  // Tope de análisis por usuario por día. Cada análisis dispara ~3 llamadas de
  // texto + varias de embeddings a Qwen; con un saldo de tokens compartido y
  // limitado, esto evita que un solo usuario agote el saldo de todos.
  usage: {
    dailyAnalysisLimit: Number(process.env.DAILY_ANALYSIS_LIMIT ?? 15),
  },
};

export { required };
