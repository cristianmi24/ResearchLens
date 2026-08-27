import type { Topic } from "@/types/topic";
import { concentrationMeta } from "@/utils/similarity";
import { cn } from "@/utils/cn";

interface TopicNodeProps {
  topic: Topic;
  maxStudies: number;
  isSelected: boolean;
  onSelect: (topic: Topic) => void;
}

const MIN_SIZE = 56;
const MAX_SIZE = 132;

export function TopicNode({ topic, maxStudies, isSelected, onSelect }: TopicNodeProps) {
  const meta = concentrationMeta[topic.concentration];
  const ratio = Math.sqrt(topic.studiesCount / maxStudies);
  const size = Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE));

  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      style={{
        // clamp() evita que el nodo se salga del contenedor en pantallas
        // angostas: el centro nunca queda a menos de su propio radio del borde.
        left: `clamp(${size / 2}px, ${topic.x}%, calc(100% - ${size / 2}px))`,
        top: `clamp(${size / 2}px, ${topic.y}%, calc(100% - ${size / 2}px))`,
        width: size,
        height: size,
        backgroundColor: `color-mix(in srgb, ${meta.colorVar} 16%, white)`,
        borderColor: meta.colorVar,
      }}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex flex-col items-center justify-center text-center px-2 transition-transform hover:scale-105 focus-ring",
        isSelected && "ring-4 ring-brand-200"
      )}
    >
      <span className="text-xs font-semibold text-ink-primary leading-tight">{topic.name}</span>
      <span className="text-[10px] text-ink-secondary mt-0.5">{topic.studiesCount}</span>
    </button>
  );
}
