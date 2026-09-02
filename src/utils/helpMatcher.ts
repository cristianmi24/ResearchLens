import type { HelpEntry } from "@/data/helpKnowledgeBase";

// Palabras demasiado comunes para aportar señal de qué tema se está preguntando.
// OJO: "esta"/"estas" quedan afuera a propósito — tras quitar tildes para normalizar, colisionan con
// "está"/"estás" (verbo estar), y dejar ambas como stopword vaciaba por completo preguntas como
// "¿cómo estás?" (ninguna palabra sobrevivía el filtro, así que nunca podía calzar con nada).
const STOPWORDS = new Set([
  "de", "la", "el", "en", "y", "a", "los", "las", "un", "una", "unos", "unas", "que", "con", "para",
  "del", "al", "por", "su", "sus", "es", "son", "como", "más", "mas", "o", "u", "e", "se", "lo", "le",
  "les", "sin", "sobre", "entre", "este", "estos", "ese", "esa", "esos", "esas", "mi",
  "me", "yo", "tu", "puedo", "quiero", "hay",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

export interface HelpMatch {
  entry: HelpEntry;
  score: number;
}

/**
 * Busca la entrada de la base de conocimiento que mejor coincide con la pregunta del usuario,
 * comparando palabras clave (sin IA, sin red, sin costo). Devuelve null si no hay ninguna
 * coincidencia razonable.
 */
export function findBestHelpAnswer(query: string, entries: HelpEntry[]): HelpMatch | null {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  let best: HelpMatch | null = null;
  for (const entry of entries) {
    const entryTokens = tokenize(`${entry.question} ${entry.keywords.join(" ")}`);
    const matched = queryTokens.filter((qt) => entryTokens.some((et) => et.includes(qt) || qt.includes(et)));
    const score = matched.length / queryTokens.length;
    if (!best || score > best.score) best = { entry, score };
  }
  return best;
}

/** Al menos un tercio de las palabras clave de la pregunta debe coincidir para aceptar la respuesta. */
export const MIN_HELP_RELEVANCE = 0.34;
