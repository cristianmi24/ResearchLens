export interface AssistantCitation {
  articleId: string;
  title: string;
  doi: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: AssistantCitation[];
  createdAt: string;
  /** Solo para mensajes del asistente: "local" = base de conocimiento fija (sin IA, instantáneo),
   * "ai" = generado por Qwen citando literatura real. Se usa para mostrar una insignia honesta. */
  source?: "local" | "ai";
}
