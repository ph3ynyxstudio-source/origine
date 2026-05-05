import type { MoodEntry } from "@/contexts/MoodContext";
import type { InputSignal } from "@/lib/inputParser";

export type MoodMetrics = {
  count: number;
  avgMood: number | null;
  avgEnergy: number | null;
  latestEntry: MoodEntry | null;
  latestSignal: InputSignal | null;
};

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function byCreatedAtDesc(a: MoodEntry, b: MoodEntry): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function getLatestMoodEntry(entries: MoodEntry[]): MoodEntry | null {
  return [...entries].sort(byCreatedAtDesc)[0] ?? null;
}

export function getAverageMood(entries: MoodEntry[]): number | null {
  return average(entries.map((entry) => entry.mood));
}

export function getAverageEnergy(entries: MoodEntry[]): number | null {
  return average(entries.map((entry) => entry.energy));
}

export function getLatestSignal(entries: MoodEntry[]): InputSignal | null {
  return getLatestMoodEntry(entries)?.signal ?? null;
}

export function getMoodMetrics(entries: MoodEntry[]): MoodMetrics {
  const latestEntry = getLatestMoodEntry(entries);
  return {
    count: entries.length,
    avgMood: getAverageMood(entries),
    avgEnergy: getAverageEnergy(entries),
    latestEntry,
    latestSignal: latestEntry?.signal ?? null,
  };
}
