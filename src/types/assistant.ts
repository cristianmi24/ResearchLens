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
}
