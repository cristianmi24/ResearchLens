import { config } from "../config.js";
import type { Article } from "../types.js";

/**
 * arXiv expone un feed Atom (XML), no JSON. Para evitar una dependencia extra
 * de parseo XML se extraen las entradas con una expresión regular tolerante:
 * la estructura del feed es estable y cada <entry> es plano.
 */
function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAuthors(entryXml: string): string[] {
  const names: string[] = [];
  const authorBlocks = entryXml.match(/<author>[\s\S]*?<\/author>/g) ?? [];
  for (const block of authorBlocks) {
    const name = extractTag(block, "name");
    if (name) names.push(name);
  }
  return names;
}

function parseEntries(xml: string): Article[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries.map((entry): Article => {
    const id = extractTag(entry, "id");
    const published = extractTag(entry, "published");
    const year = published ? Number(published.slice(0, 4)) : 0;
    const arxivId = id.split("/abs/").pop() ?? id;

    return {
      id: `arxiv-${arxivId}`,
      title: extractTag(entry, "title"),
      authors: extractAuthors(entry),
      year,
      source: "arXiv",
      doi: extractTag(entry, "arxiv:doi") || `10.48550/arXiv.${arxivId.replace(/v\d+$/, "")}`,
      abstract: extractTag(entry, "summary"),
      mainConcepts: [],
      similarityPercent: 0,
      similarityReason: "",
      comparison: [],
    };
  });
}

/**
 * La política de uso de arXiv pide no superar 1 solicitud cada 3 segundos
 * (https://info.arxiv.org/help/api/tou.html). Igual que con Semantic
 * Scholar, se serializan aquí todas las llamadas salientes con una cola en
 * memoria para respetar ese ritmo aunque corran varios análisis en paralelo,
 * y se reintenta con backoff exponencial ante un 429 en vez de rendirse de
 * inmediato: es preferible que la búsqueda tarde más a que se quede sin
 * resultados de arXiv.
 */
const MIN_INTERVAL_MS = 3000;
let queue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function throttle(): Promise<number> {
  const turn = queue.then(async () => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return wait;
  });
  queue = turn.then(() => undefined).catch(() => {});
  return turn;
}

export interface ArxivResult {
  articles: Article[];
  /** Milisegundos totales que se esperó (throttle propio + backoff por 429). */
  waitedMs: number;
  /** true si se agotaron los reintentos y no se pudo consultar. */
  gaveUp: boolean;
}

export async function searchEntries(searchQuery: string, maxResults = 10, attempts = 4): Promise<ArxivResult> {
  const params = new URLSearchParams({
    search_query: `all:${searchQuery}`,
    start: "0",
    max_results: String(maxResults),
    sortBy: "relevance",
  });
  let waitedMs = 0;

  for (let i = 0; i < attempts; i++) {
    waitedMs += await throttle();

    const res = await fetch(`${config.arxiv.baseUrl}?${params.toString()}`);

    if (res.ok) {
      const xml = await res.text();
      return { articles: parseEntries(xml), waitedMs, gaveUp: false };
    }

    if (res.status === 429 && i < attempts - 1) {
      const backoff = 2000 * 2 ** i;
      waitedMs += backoff;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      continue;
    }

    console.error("[arxiv] search failed", res.status, await res.text());
    return { articles: [], waitedMs, gaveUp: true };
  }

  return { articles: [], waitedMs, gaveUp: true };
}
