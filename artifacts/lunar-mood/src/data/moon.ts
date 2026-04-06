import { MoonPhase } from "./day-entry.types";

export function getMoonPhase(date: Date): MoonPhase {
  const known = new Date(2000, 0, 6);
  const cycle = 29.53058867;
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const position = ((diff % cycle) + cycle) % cycle;

  if (position < 1.85) return "new_moon";
  if (position < 7.38) return "waxing_crescent";
  if (position < 9.22) return "first_quarter";
  if (position < 14.77) return "waxing_gibbous";
  if (position < 16.61) return "full_moon";
  if (position < 22.15) return "waning_gibbous";
  if (position < 23.99) return "last_quarter";
  return "waning_crescent";
}
