interface AssistantMessageBodyProps {
  text: string;
}

type Block = { type: "p"; text: string } | { type: "ol"; items: string[] };

const NUMBERED_LINE = /^\d+\.\s+(.*)$/;

/**
 * Renderiza el texto de una respuesta del asistente reconociendo listas numeradas ("1. ...", "2. ...")
 * como una lista real con viñetas circulares, en vez de dejarlas como texto corrido — la respuesta de
 * "demo completa" (y cualquier otra explicación paso a paso) queda organizada, no un párrafo plano.
 */
function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(NUMBERED_LINE);
    const last = blocks[blocks.length - 1];
    if (match) {
      if (last && last.type === "ol") last.items.push(match[1]);
      else blocks.push({ type: "ol", items: [match[1]] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

export function AssistantMessageBody({ text }: AssistantMessageBodyProps) {
  const blocks = toBlocks(text);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) =>
        block.type === "ol" ? (
          <ol key={i} className="space-y-2">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[11px] font-semibold leading-none mt-0.5">
                  {j + 1}
                </span>
                <span className="flex-1 pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p key={i}>{block.text}</p>
        )
      )}
    </div>
  );
}
