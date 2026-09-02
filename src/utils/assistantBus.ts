/**
 * Puente simple para pedirle al asistente ("Preguntar al asistente", montado en AppShell) que se abra
 * con una pregunta ya cargada, desde cualquier otra página (Home, Settings, ...) sin tener que levantar
 * su estado a un contexto compartido. Mismo patrón que "researchlens:unauthorized" en hooks/useAuth.tsx.
 */
export const OPEN_ASSISTANT_EVENT = "researchlens:open-assistant";

export interface OpenAssistantDetail {
  question?: string;
}

export function openAssistantWithQuestion(question?: string): void {
  window.dispatchEvent(new CustomEvent<OpenAssistantDetail>(OPEN_ASSISTANT_EVENT, { detail: { question } }));
}
