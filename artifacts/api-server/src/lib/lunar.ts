const KNOWN_NEW_MOON = new Date("2026-02-16T06:00:00Z").getTime();
const SYNODIC_MONTH = 29.53058770576;

interface LunarPhaseInfo {
  phase: string;
  illumination: number;
  emoji: string;
}

function getMoonAge(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

export function getLunarPhase(date: Date): LunarPhaseInfo {
  const age = getMoonAge(date);
  const fraction = age / SYNODIC_MONTH;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * fraction)) / 2 * 100) / 100;

  if (age < 1.85) return { phase: "new_moon", illumination, emoji: "\uD83C\uDF11" };
  if (age < 7.38) return { phase: "waxing_crescent", illumination, emoji: "\uD83C\uDF12" };
  if (age < 9.23) return { phase: "first_quarter", illumination, emoji: "\uD83C\uDF13" };
  if (age < 14.77) return { phase: "waxing_gibbous", illumination, emoji: "\uD83C\uDF14" };
  if (age < 16.61) return { phase: "full_moon", illumination, emoji: "\uD83C\uDF15" };
  if (age < 22.15) return { phase: "waning_gibbous", illumination, emoji: "\uD83C\uDF16" };
  if (age < 23.99) return { phase: "last_quarter", illumination, emoji: "\uD83C\uDF17" };
  if (age < 27.68) return { phase: "waning_crescent", illumination, emoji: "\uD83C\uDF18" };
  return { phase: "new_moon", illumination, emoji: "\uD83C\uDF11" };
}

export function getMonthPhases(year: number, month: number): Array<{ date: string; phase: string; illumination: number; emoji: string }> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day, 12, 0, 0);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const phaseInfo = getLunarPhase(date);
    phases.push({ date: dateStr, ...phaseInfo });
  }

  return phases;
}
