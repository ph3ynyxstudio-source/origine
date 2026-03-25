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
