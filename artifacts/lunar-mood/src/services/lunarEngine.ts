/**
 * LUNARENGINE.TS - Ph3yNyx Studio
 * Local-first moon phase calculation for Lun4rMood.
 */

export type MoonPhase =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export interface MoonData {
  phase: MoonPhase;
  age: number;
  illumination: number;
}

export const MOON_PHASE_ASSETS: Record<MoonPhase, string> = {
  new_moon: "/moons/moon_new.webp",
  waxing_crescent: "/moons/moon_waxing_crescent.webp",
  first_quarter: "/moons/moon_first_quarter.webp",
  waxing_gibbous: "/moons/moon_waxing_gibbous.webp",
  full_moon: "/moons/moon_full.webp",
  waning_gibbous: "/moons/moon_waning_gibbous.webp",
  last_quarter: "/moons/moon_last_quarter.webp",
  waning_crescent: "/moons/moon_waning_crescent.webp",
};

export const SYNODIC_MONTH = 29.53058867;
export const KNOWN_NEW_MOON_UTC = new Date("2000-01-06T18:14:00Z").getTime();

const PHASE_NAMES: MoonPhase[] = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];

export const getMoonPhase = (date: Date = new Date()): MoonData => {
  const normalizedAge = getLunarCyclePosition(date);

  const illumination =
    ((1 -
      Math.cos((2 * Math.PI * normalizedAge) / SYNODIC_MONTH)) /
      2) *
    100;

  const phaseIndex =
    Math.floor((normalizedAge / SYNODIC_MONTH) * PHASE_NAMES.length + 0.5) %
    PHASE_NAMES.length;

  return {
    phase: PHASE_NAMES[phaseIndex],
    age: Number(normalizedAge.toFixed(2)),
    illumination: Number(illumination.toFixed(0)),
  };
};

export function getLunarCyclePosition(date: Date = new Date()): number {
  const diffInMs = date.getTime() - KNOWN_NEW_MOON_UTC;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const age = diffInDays % SYNODIC_MONTH;

  return age < 0 ? age + SYNODIC_MONTH : age;
}

export function getLunarCycleDay(date: Date = new Date()): number {
  return Math.floor(getLunarCyclePosition(date)) + 1;
}
