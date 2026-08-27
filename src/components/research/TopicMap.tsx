import type { Topic } from "@/types/topic";
import { TopicNode } from "./TopicNode";
import { concentrationMeta } from "@/utils/similarity";

interface TopicMapProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onSelect: (topic: Topic) => void;
}

export function TopicMap({ topics, selectedTopicId, onSelect }: TopicMapProps) {
  const maxStudies = Math.max(...topics.map((t) => t.studiesCount));

  return (
    <div>
      <div className="relative h-[420px] sm:h-[480px] rounded-xl border border-border bg-surface-muted/40 overflow-hidden">
        {topics.map((topic) => (
          <TopicNode
            key={topic.id}
            topic={topic}
            maxStudies={maxStudies}
            isSelected={topic.id === selectedTopicId}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        {(Object.keys(concentrationMeta) as Array<keyof typeof concentrationMeta>).map((key) => {
          const meta = concentrationMeta[key];
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-ink-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.colorVar }} />
              {meta.label}
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 text-xs text-ink-muted ml-auto">
          El tamaño del círculo representa la cantidad de estudios encontrados.
        </div>
      </div>
    </div>
  );
}
