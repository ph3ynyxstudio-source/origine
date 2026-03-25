const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();
const SYNODIC_MONTH = 29.53058770576;

export interface LunarPhaseInfo {
  phase: string;
  illumination: number;
  emoji: string;
  label: string;
}

function getMoonAge(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

export function getLunarPhase(date: Date): LunarPhaseInfo {
  const age = getMoonAge(date);
  const fraction = age / SYNODIC_MONTH;
  const illumination =
    Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100) / 100;

  if (age < 1.85)
    return {
      phase: "new_moon",
      illumination,
      emoji: "\uD83C\uDF11",
      label: "New Moon",
    };
  if (age < 7.38)
    return {
      phase: "waxing_crescent",
      illumination,
      emoji: "\uD83C\uDF12",
      label: "Waxing Crescent",
    };
  if (age < 9.23)
    return {
      phase: "first_quarter",
      illumination,
      emoji: "\uD83C\uDF13",
      label: "First Quarter",
    };
  if (age < 14.77)
    return {
      phase: "waxing_gibbous",
      illumination,
      emoji: "\uD83C\uDF14",
      label: "Waxing Gibbous",
    };
  if (age < 16.61)
    return {
      phase: "full_moon",
      illumination,
      emoji: "\uD83C\uDF15",
      label: "Full Moon",
    };
  if (age < 22.15)
    return {
      phase: "waning_gibbous",
      illumination,
      emoji: "\uD83C\uDF16",
      label: "Waning Gibbous",
    };
  if (age < 23.99)
    return {
      phase: "last_quarter",
      illumination,
      emoji: "\uD83C\uDF17",
      label: "Last Quarter",
    };
  if (age < 27.68)
    return {
      phase: "waning_crescent",
      illumination,
      emoji: "\uD83C\uDF18",
      label: "Waning Crescent",
    };
  return {
    phase: "new_moon",
    illumination,
    emoji: "\uD83C\uDF11",
    label: "New Moon",
  };
}

export function getMonthPhases(
  year: number,
  month: number
): Array<{ date: string } & LunarPhaseInfo> {
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

export function getMoodColor(mood: number): string {
  const colors: Record<number, string> = {
    1: "#EF4444",
    2: "#F97316",
    3: "#EAB308",
    4: "#22C55E",
    5: "#6366F1",
  };
  return colors[mood] || "#5A5F78";
}

export function getMoodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: "Terrible",
    2: "Bad",
    3: "Okay",
    4: "Good",
    5: "Great",
  };
  return labels[mood] || "";
}
