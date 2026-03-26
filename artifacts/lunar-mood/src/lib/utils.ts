import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMoodColor(mood: number): string {
  const colors: Record<number, string> = {
    1: "#EF4444", // Terrible - Red
    2: "#F97316", // Bad - Orange
    3: "#EAB308", // Okay - Yellow
    4: "#22C55E", // Good - Green
    5: "#7C6AFA", // Great - Primary Violet
  };
  return colors[mood] || "#5A5F78";
}

export function getMoodEmoji(mood: number): string {
  const emojis: Record<number, string> = {
    1: "😫",
    2: "🙁",
    3: "😐",
    4: "🙂",
    5: "🤩",
  };
  return emojis[mood] || "🌌";
}
