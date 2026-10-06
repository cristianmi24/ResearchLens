import { useEffect, useState } from "react";
import { PlayCircle, SquarePlay } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getYoutubeVideos } from "@/services/researchApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { YoutubeVideo } from "@/types/youtube";

interface RelatedVideosProps {
  query: string;
}

export function RelatedVideos({ query }: RelatedVideosProps) {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<YoutubeVideo[] | null>(null);

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(language, { year: "numeric", month: "short" });
  }

  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    getYoutubeVideos(query)
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (videos === null) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-ink-primary mb-1 flex items-center gap-2">
          <SquarePlay size={20} className="text-red-600" />
          {t("videos.title", "Videos relacionados")}
        </h2>
        <p className="text-sm text-ink-muted">{t("videos.loading", "Buscando videos…")}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-primary mb-1 flex items-center gap-2">
        <SquarePlay size={20} className="text-red-600" />
        {t("videos.title", "Videos relacionados")}
      </h2>
      <p className="text-sm text-ink-secondary mb-4">
        {t("videos.subtitle", "Contenido de YouTube sobre este tema, para complementar tu lectura.")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {videos.slice(0, 4).map((video) => (
          <a
            key={video.videoId}
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <Card className="overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
              <div className="relative aspect-video bg-surface-muted">
                {video.thumbnailUrl && (
                  <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <PlayCircle
                    size={40}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                  />
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-ink-primary line-clamp-2 leading-snug">{video.title}</h3>
                <p className="text-xs text-ink-muted mt-1">
                  {video.channelTitle} · {formatDate(video.publishedAt)}
                </p>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
