import { config } from "../config.js";

export interface YoutubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  url: string;
}

export async function searchVideos(searchQuery: string, maxResults = 8): Promise<YoutubeVideo[]> {
  if (!config.youtube.apiKey) return [];

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    order: "relevance",
    maxResults: String(maxResults),
    q: searchQuery,
    key: config.youtube.apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  if (!res.ok) {
    console.error("[youtube] search failed", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    items: { id: { videoId: string }; snippet: { title: string; channelTitle: string; publishedAt: string; thumbnails: { medium?: { url: string } } } }[];
  };

  return data.items
    .filter((item) => item.id.videoId)
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.medium?.url ?? "",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
}
