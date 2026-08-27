import { useState } from "react";
import type { FormEvent } from "react";
import { MessageCircleQuestion, Send, Sparkles, X } from "lucide-react";
import type { AssistantMessage } from "@/types/assistant";
import { askAssistant } from "@/services/llmApi";
import { assistantSuggestedQuestions, mockAssistantWelcome } from "@/data/mockAssistant";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

let messageId = 1;
function nextId() {
  return `msg-${messageId++}`;
}

export function AIResearchAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([mockAssistantWelcome]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isThinking) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: trimmed, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setIsThinking(true);

    const response = await askAssistant(trimmed);

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "assistant", createdAt: new Date().toISOString(), ...response },
    ]);
    setIsThinking(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendQuestion(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-brand-700 transition-colors focus-ring",
          open && "hidden"
        )}
      >
        <Sparkles size={18} />
        Preguntar al asistente
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Cerrar asistente"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-primary/40 animate-fade-in"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl animate-slide-up flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircleQuestion size={20} className="text-brand-600" />
                <span className="font-semibold text-ink-primary">Research Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="p-1.5 rounded-lg text-ink-secondary hover:bg-surface-muted focus-ring"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-surface-muted text-ink-primary"
                    )}
                  >
                    <p>{message.text}</p>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                        <p className="text-xs opacity-80">Fuentes citadas:</p>
                        {message.citations.map((c) => (
                          <p key={c.articleId} className="text-xs opacity-90 leading-snug">
                            {c.title} · DOI: {c.doi}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-3.5 py-2.5 text-sm bg-surface-muted text-ink-muted">
                    Buscando en la literatura recuperada...
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-5 pb-2 space-y-1.5">
                {assistantSuggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuestion(q)}
                    className="block w-full text-left text-xs rounded-lg border border-border px-3 py-2 text-ink-secondary hover:bg-surface-muted focus-ring"
                  >
                    {q}
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
