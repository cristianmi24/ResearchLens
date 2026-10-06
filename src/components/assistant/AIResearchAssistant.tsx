import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ChevronRight, Send, X } from "lucide-react";
import type { AssistantMessage } from "@/types/assistant";
import { askAssistant, saveAssistantMessages } from "@/services/llmApi";
import { assistantSuggestedQuestions, mockAssistantWelcome } from "@/data/mockAssistant";
import { helpKnowledgeBase } from "@/data/helpKnowledgeBase";
import { findBestHelpAnswer, MIN_HELP_RELEVANCE } from "@/utils/helpMatcher";
import { OPEN_ASSISTANT_EVENT, type OpenAssistantDetail } from "@/utils/assistantBus";
import { AssistantMessageBody } from "@/components/assistant/AssistantMessageBody";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

import { useLanguage } from "@/i18n/LanguageContext";

let messageId = 1;
function nextId() {
  return `msg-${messageId++}`;
}

function SourceBadge({ source }: { source: AssistantMessage["source"] }) {
  if (!source) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 mb-1.5",
        source === "local" ? "bg-status-good-bg text-status-good-text" : "bg-brand-50 text-brand-700"
      )}
    >
      {source === "local" ? "Sin IA · instantáneo" : "Generado por IA · Qwen"}
    </span>
  );
}

export function AIResearchAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([mockAssistantWelcome]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const { t } = useLanguage();

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isThinking) return;

    const userMessage: AssistantMessage = {
      id: nextId(),
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);
    setInput("");

    // Primero se busca en la información fija de cómo funciona ResearchLens (sin IA, sin red, sin
    // costo). Solo si no hay una coincidencia razonable ahí, se le pregunta a Qwen sobre los artículos
    // ya recuperados para esta búsqueda.
    const localMatch = findBestHelpAnswer(trimmed, helpKnowledgeBase);
    if (localMatch && localMatch.score >= MIN_HELP_RELEVANCE) {
      const localMessage: AssistantMessage = {
        id: nextId(),
        role: "assistant",
        text: localMatch.entry.answer,
        createdAt: new Date().toISOString(),
        source: "local",
      };
      setMessages((prev) => [...prev, localMessage]);
      void saveAssistantMessages([userMessage, localMessage]).catch((err) =>
        console.error("[assistant] no se pudo persistir la conversación local:", err),
      );
      return;
    }

    setIsThinking(true);
    const response = await askAssistant(trimmed);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "assistant", createdAt: new Date().toISOString(), source: "ai", ...response },
    ]);
    setIsThinking(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendQuestion(input);
  }

  // Permite que otras páginas (Home, Settings, ...) abran el asistente con una pregunta ya cargada
  // (ej. el botón "Ver cómo funciona"), sin tener que levantar este estado a un contexto compartido.
  useEffect(() => {
    function handleOpenEvent(e: Event) {
      const detail = (e as CustomEvent<OpenAssistantDetail>).detail;
      setOpen(true);
      if (detail?.question) sendQuestion(detail.question);
    }
    window.addEventListener(OPEN_ASSISTANT_EVENT, handleOpenEvent);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpenEvent);
  }, [sendQuestion]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-brand-600 text-white pl-2.5 pr-4 py-2 text-sm font-medium shadow-lg hover:bg-brand-700 transition-colors focus-ring",
          open && "hidden"
        )}
      >
        <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain rounded-full bg-white/20 p-0.5" />
        {t("assistant.button", "Preguntar al asistente")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Cerrar asistente"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-primary/40 animate-fade-in"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl animate-slide-up flex flex-col">
            <div className="relative shrink-0 border-b border-border">
              <div
                className="h-1.5"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-brand-600) 0%, var(--color-cat-7) 55%, var(--color-cat-3) 100%)",
                }}
              />
              <div className="flex items-center justify-between px-5 h-16">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src="/logo.png" alt="Asistente" className="h-9 w-9 shrink-0 object-contain rounded-full bg-brand-50 p-0.5 shadow-sm" />
                  <div className="min-w-0">
                    <p className="font-serif font-semibold text-ink-primary leading-tight truncate">
                      {t("assistant.title", "Asistente de investigación")}
                    </p>
                    <p className="text-xs text-ink-muted leading-tight">
                      {t("assistant.subtitle", "Cómo funciona ResearchLens y tu búsqueda")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="p-1.5 rounded-lg text-ink-secondary hover:bg-surface-muted focus-ring shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex flex-col", message.role === "user" ? "items-end" : "items-start")}>
                  {message.role === "assistant" && <SourceBadge source={message.source} />}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-surface-muted text-ink-primary"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <AssistantMessageBody text={message.text} />
                    ) : (
                      <p>{message.text}</p>
                    )}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-ink-primary/10 space-y-1">
                        <p className="text-xs text-ink-muted font-medium">Fuentes citadas</p>
                        {message.citations.map((c) => (
                          <p key={c.articleId} className="text-xs text-ink-secondary leading-snug">
                            {c.title} · DOI: {c.doi}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex flex-col items-start">
                  <SourceBadge source="ai" />
                  <div className="rounded-xl px-3.5 py-2.5 text-sm bg-surface-muted text-ink-muted">
                    Buscando en la literatura recuperada...
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-5 pb-3 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Preguntas frecuentes</p>
                {assistantSuggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuestion(q)}
                    className="flex w-full items-center justify-between gap-2 text-left text-xs rounded-lg border border-border px-3 py-2 text-ink-secondary hover:border-brand-300 hover:bg-surface-muted transition-colors focus-ring"
                  >
                    <span>{q}</span>
                    <ChevronRight size={14} className="shrink-0 text-ink-muted" />
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus-ring"
              />
              <Button type="submit" size="md" disabled={!input.trim() || isThinking} aria-label="Enviar">
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
