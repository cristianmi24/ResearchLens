import { apiFetch } from "./api";
import type { AssistantMessage } from "@/types/assistant";

/**
 * Cliente del asistente de investigación. El backend (Gemini) solo responde
 * preguntas factuales sobre la literatura ya recuperada, citando fuentes,
 * sin inventar artículos ni DOI.
 */
export async function askAssistant(question: string): Promise<Omit<AssistantMessage, "id" | "role" | "createdAt">> {
  return apiFetch<Omit<AssistantMessage, "id" | "role" | "createdAt">>("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export async function saveAssistantMessages(messages: AssistantMessage[]): Promise<void> {
  await apiFetch<void>("/assistant/messages", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}
