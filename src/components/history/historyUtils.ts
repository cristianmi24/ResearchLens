import type { SessionHistoryEntry } from "@/types/research";

export type SortMode = "recent" | "oldest" | "studies";
export type LevelFilter = "all" | "pregrado" | "maestria" | "doctorado";

export type DateGroupId = "today" | "yesterday" | "week" | "month" | "older";

export const GROUP_ORDER: DateGroupId[] = ["today", "yesterday", "week", "month", "older"];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** En qué grupo de fechas cae un análisis, según días calendario (no horas) para que "Ayer" sea ayer de verdad. */
export function dateGroupOf(iso: string, now = new Date()): DateGroupId {
  const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days <= 7) return "week";
  if (days <= 30) return "month";
  return "older";
}

export function filterAndSort(
  entries: SessionHistoryEntry[],
  opts: { search: string; level: LevelFilter; sort: SortMode },
): SessionHistoryEntry[] {
  const needle = opts.search.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    if (needle && !entry.originalIdea.toLowerCase().includes(needle)) return false;
    if (opts.level !== "all" && entry.academicLevel !== opts.level) return false;
    return true;
  });
  const byDate = (a: SessionHistoryEntry, b: SessionHistoryEntry) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  return [...filtered].sort((a, b) => {
    if (opts.sort === "oldest") return -byDate(a, b);
    if (opts.sort === "studies") return b.relatedStudiesCount - a.relatedStudiesCount || byDate(a, b);
    return byDate(a, b);
  });
}

export interface HistoryStats {
  total: number;
  thisWeek: number;
  averageStudies: number;
  topLevel: SessionHistoryEntry["academicLevel"];
}

export function computeStats(entries: SessionHistoryEntry[], now = new Date()): HistoryStats {
  const thisWeek = entries.filter((e) => now.getTime() - new Date(e.createdAt).getTime() <= 7 * DAY_MS).length;
  const averageStudies = entries.length ? Math.round(entries.reduce((sum, e) => sum + e.relatedStudiesCount, 0) / entries.length) : 0;
  const counts = new Map<string, number>();
  for (const e of entries) if (e.academicLevel) counts.set(e.academicLevel, (counts.get(e.academicLevel) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] as SessionHistoryEntry["academicLevel"] | undefined;
  return { total: entries.length, thisWeek, averageStudies, topLevel: top ?? null };
}

/** "hace 3 horas", "hace 2 días" en el idioma de la interfaz. */
export function relativeTime(iso: string, language: string, now = new Date()): string {
  const diffSec = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86400), "day");
}
