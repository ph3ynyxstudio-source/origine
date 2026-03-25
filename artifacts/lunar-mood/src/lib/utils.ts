import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMoodColorClass(mood: number | undefined) {
  switch (mood) {
    case 1: return "bg-mood-1 text-white shadow-[0_0_15px_var(--color-mood-1)]";
    case 2: return "bg-mood-2 text-white shadow-[0_0_15px_var(--color-mood-2)]";
    case 3: return "bg-mood-3 text-white shadow-[0_0_15px_var(--color-mood-3)]";
    case 4: return "bg-mood-4 text-white shadow-[0_0_15px_var(--color-mood-4)]";
    case 5: return "bg-mood-5 text-white shadow-[0_0_15px_var(--color-mood-5)]";
    default: return "bg-muted text-muted-foreground";
  }
}

export function getMoodEmoji(mood: number | undefined) {
  switch (mood) {
    case 1: return "😫";
    case 2: return "😔";
    case 3: return "😌";
    case 4: return "😊";
    case 5: return "🤩";
    default: return "✨";
  }
}

export function getMoodLabel(mood: number | undefined) {
  switch (mood) {
    case 1: return "Terrible";
    case 2: return "Bad";
    case 3: return "Okay";
    case 4: return "Good";
    case 5: return "Great";
    default: return "Unknown";
  }
}

export const PERIOD_COLORS: Record<string, string> = {
  morning: "#F59E0B",
  afternoon: "#3B82F6",
  evening: "#8B5CF6",
};

export const PERIOD_LABELS: Record<string, string> = {
  morning: "Matin",
  afternoon: "Après-midi",
  evening: "Soir",
};

export function getPeriodColorClass(period: string) {
  switch (period) {
    case "morning": return "bg-amber-500";
    case "afternoon": return "bg-blue-500";
    case "evening": return "bg-violet-500";
    default: return "bg-muted";
  }
}

export function getEnergyLabel(energy: number) {
  if (energy <= 0) return "0%";
  if (energy <= 25) return "25%";
  if (energy <= 50) return "50%";
  if (energy <= 75) return "75%";
  return "100%";
}

export function getConsumptionLabel(level: number) {
  switch (level) {
    case 0: return "Aucune";
    case 1: return "Très peu";
    case 2: return "Peu";
    case 3: return "Modéré";
    case 4: return "Beaucoup";
    case 5: return "Excessif";
    default: return "—";
  }
}
