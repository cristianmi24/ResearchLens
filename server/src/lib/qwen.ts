import { config } from "../config.js";

/**
 * Cliente para Qwen vía DashScope (modo compatible con OpenAI). Reemplaza a
 * Gemini como proveedor de LLM: mismo tipo de cuenta con saldo de tokens
 * prepago, así que aquí se prioriza gastar lo mínimo posible:
 *  - `qwen-flash` (el modelo de chat más barato de la familia) por defecto.
 *  - Prompts truncados donde ya se truncaban para Gemini.
 *  - Embeddings agrupados en lote real (varios textos por request), a
 *    diferencia de Gemini que solo aceptaba un texto por llamada.
 */

const EMBED_BATCH_SIZE = 10;
const MAX_ATTEMPTS = 3;

function assertKey() {
  if (!config.qwen.apiKey) throw new Error("QWEN_API_KEY no configurada");
}

class QwenHttpError extends Error {
  status: number;
  /** Saldo de tokens agotado o insuficiente: reintentar no sirve de nada. */
  insufficientBalance: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.insufficientBalance = /insufficient|balance|arrearage/i.test(message);
  }
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

async function withRetry<T>(fn: () => Promise<T>, attempts = MAX_ATTEMPTS): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (err instanceof QwenHttpError && err.insufficientBalance) throw err;
      const status = err instanceof QwenHttpError ? err.status : undefined;
      const isRetryable = status !== undefined && RETRYABLE_STATUS.has(status);
      if (!isRetryable || i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** i));
    }
  }
  throw lastErr;
}

interface GenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  json?: boolean;
}

async function callChatCompletion(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  assertKey();
  const url = `${config.qwen.baseUrl}/chat/completions`;

  const messages: { role: string; content: string }[] = [];
  if (opts.systemInstruction) messages.push({ role: "system", content: opts.systemInstruction });
  messages.push({ role: "user", content: prompt });

  const body: Record<string, unknown> = {
    model: config.qwen.textModel,
    messages,
    temperature: opts.temperature ?? 0.4,
    // Los modelos qwen3.x son "híbridos" (razonan por defecto) y facturan esos
    // tokens de pensamiento aunque no se muestren; se desactiva siempre para
    // mantener el costo mínimo (ver nota en config.ts).
    enable_thinking: false,
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  };

  try {
    return await withRetry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.qwen.apiKey}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new QwenHttpError(res.status, `[qwen] chat/completions falló (${res.status}): ${errText}`);
      }

      const data = (await res.json()) as { choices?: { message: { content: string } }[] };
      const text = data.choices?.[0]?.message?.content ?? "";
      if (!text) throw new Error("[qwen] respuesta vacía");
      return text;
    });
  } catch (err) {
    if (err instanceof QwenHttpError && err.insufficientBalance) {
      throw new Error(`[qwen] saldo de tokens agotado o insuficiente para ${config.qwen.textModel}.`);
    }
    throw err;
  }
}

export async function generateText(prompt: string, opts?: GenerateOptions): Promise<string> {
  return callChatCompletion(prompt, opts);
}

/** Pide una respuesta en JSON y la parsea. Lanza si Qwen no devuelve JSON válido. */
export async function generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const text = await callChatCompletion(prompt, { json: true, systemInstruction, temperature: 0.3 });
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error(`[qwen] no se pudo parsear JSON: ${text.slice(0, 200)}`);
  }
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const url = `${config.qwen.baseUrl}/embeddings`;

  try {
    return await withRetry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.qwen.apiKey}` },
        body: JSON.stringify({ model: config.qwen.embeddingModel, input: texts.map((t) => t.slice(0, 8000)) }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new QwenHttpError(res.status, `[qwen] embeddings falló (${res.status}): ${errText}`);
      }

      const data = (await res.json()) as { data: { embedding: number[]; index: number }[] };
      return [...data.data].sort((a, b) => a.index - b.index).map((d) => d.embedding);
    });
  } catch (err) {
    if (err instanceof QwenHttpError && err.insufficientBalance) {
      throw new Error(`[qwen] saldo de tokens agotado o insuficiente para ${config.qwen.embeddingModel}.`);
    }
    throw err;
  }
}

/** Agrupa los textos en lotes reales (una sola request por lote) para minimizar llamadas y costo. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  assertKey();
  if (texts.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    batches.push(texts.slice(i, i + EMBED_BATCH_SIZE));
  }

  const results = await Promise.all(batches.map(embedBatch));
  return results.flat();
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
