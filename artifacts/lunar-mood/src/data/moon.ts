import type { DayEntry, MoonPhase } from "./day-entry.types";
import { isDevFallbackEnabled } from "./devFallbacks";
import moonEvents from "./moonEvents.json";
import { formatDate, getLocalStartOfDay, toLocalNoon } from "./calendar";
import {
  getLunarCyclePosition,
  getMoonPhase as getMoonPhaseData,
  SYNODIC_MONTH,
} from "../services/lunarEngine";
import { isValidMoonPhase } from "./validator";

type ExactMoonPhase = Extract<MoonPhase, "new_moon" | "full_moon">;

type MoonEventRecord = {
  type: MoonPhase;
  dateUtc: string;
};

type ExactMoonEventRecord = {
  phase: ExactMoonPhase;
  timestamp: number;
};

function isExactMoonPhase(phase: MoonPhase): phase is ExactMoonPhase {
  return phase === "new_moon" || phase === "full_moon";
}

function isExactMoonEvent(
  event: MoonEventRecord,
): event is MoonEventRecord & { type: ExactMoonPhase } {
  return isExactMoonPhase(event.type);
}

const EXACT_MOON_EVENTS: ExactMoonEventRecord[] = (moonEvents.events as MoonEventRecord[])
  .filter(isExactMoonEvent)
  .map((event) => ({
    phase: event.type,
    timestamp: new Date(event.dateUtc).getTime(),
  }));

export const IMPORTANT_MOON_PHASES: MoonPhase[] = [
  "new_moon",
  "first_quarter",
  "full_moon",
  "last_quarter",
];

const PHASE_CENTERS: Partial<Record<MoonPhase, number>> = {
  new_moon: 0,
  first_quarter: SYNODIC_MONTH / 4,
  full_moon: SYNODIC_MONTH / 2,
  last_quarter: (SYNODIC_MONTH * 3) / 4,
};

function getLocalDayEnd(date: Date): Date {
  const nextDay = getLocalStartOfDay(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

function getPhaseCenterDistance(date: Date, phase: MoonPhase): number {
  const center = PHASE_CENTERS[phase];

  if (center === undefined) return Number.POSITIVE_INFINITY;

  const distance = Math.abs(getLunarCyclePosition(toLocalNoon(date)) - center);
  return Math.min(distance, SYNODIC_MONTH - distance);
}

function pickClusterMarkerDay(cluster: Date[], phase: MoonPhase): string {
  if (cluster.length === 1) return formatDate(cluster[0]);

  const closest = cluster.reduce((best, candidate) => {
    const bestDistance = getPhaseCenterDistance(best, phase);
    const candidateDistance = getPhaseCenterDistance(candidate, phase);

    return candidateDistance < bestDistance ? candidate : best;
  }, cluster[Math.floor(cluster.length / 2)]);

  return formatDate(closest);
}

export function getExactMoonEventPhase(date: Date): ExactMoonPhase | null {
  const dayStart = getLocalStartOfDay(date).getTime();
  const dayEnd = getLocalDayEnd(date).getTime();

  const matchingEvent = EXACT_MOON_EVENTS.find(
    (event) => event.timestamp >= dayStart && event.timestamp < dayEnd,
  );

  return matchingEvent?.phase ?? null;
}

export function getExactMoonEventDates(
  days: Date[],
  phase: ExactMoonPhase,
): Set<string> {
  return days.reduce<Set<string>>((dates, day) => {
    if (getExactMoonEventPhase(day) === phase) {
      dates.add(formatDate(day));
    }

    return dates;
  }, new Set<string>());
}

function getCalculatedMoonPhase(date: Date): MoonPhase {
  const fallbackPhase = getMoonPhaseData(toLocalNoon(date)).phase;
  const simulatedPhase = isDevFallbackEnabled("unknown_lunar_phase")
    ? ("unknown_phase" as MoonPhase)
    : fallbackPhase;

  return isValidMoonPhase(simulatedPhase) ? simulatedPhase : fallbackPhase;
}

export function getMoonPhase(date: Date): MoonPhase {
  const exactPhase = getExactMoonEventPhase(date);

  return exactPhase ?? getCalculatedMoonPhase(date);
}

export function getCurrentMoonPhase(date: Date): MoonPhase {
  const exactPhase = getExactMoonEventPhase(date);

  if (exactPhase) {
    return exactPhase;
  }

  const calculatedPhase = getCalculatedMoonPhase(date);

  if (calculatedPhase === "new_moon") {
    return getLunarCyclePosition(toLocalNoon(date)) < SYNODIC_MONTH / 2
      ? "waxing_crescent"
      : "waning_crescent";
  }

  if (calculatedPhase === "full_moon") {
    return getLunarCyclePosition(toLocalNoon(date)) < SYNODIC_MONTH / 2
      ? "waxing_gibbous"
      : "waning_gibbous";
  }

  return calculatedPhase;
}

export function getDisplayMoonPhase(
  date: Date,
  entry?: Pick<DayEntry, "moonPhase"> | null,
): MoonPhase {
  return getExactMoonEventPhase(date) ?? entry?.moonPhase ?? getMoonPhase(date);
}

export function getMoonPhaseMarkerDates(
  days: Date[],
  phases: MoonPhase[] = IMPORTANT_MOON_PHASES,
): Set<string> {
  const markerDates = new Set<string>();

  phases.forEach((phase) => {
    getMarkerDatesForPhase(days, phase).forEach((date) => markerDates.add(date));
  });

  return markerDates;
}

export function getMoonPhaseChangeDates(days: Date[]): Set<string> {
  return days.reduce<Set<string>>((dates, day) => {
    const localDate = getLocalStartOfDay(day);
    const previousDate = getLocalStartOfDay(day);
    previousDate.setDate(previousDate.getDate() - 1);

    if (getMoonPhase(localDate) !== getMoonPhase(previousDate)) {
      dates.add(formatDate(localDate));
    }

    return dates;
  }, new Set<string>());
}

function getMarkerDatesForPhase(days: Date[], phase: MoonPhase): Set<string> {
  if (phase === "new_moon" || phase === "full_moon") {
    const exactMarkerDates = getExactMoonEventDates(days, phase);

    if (exactMarkerDates.size > 0) {
      return exactMarkerDates;
    }
  }

  const markerDates = new Set<string>();
  let cluster: Date[] = [];

  for (const date of days) {
    const localDate = getLocalStartOfDay(date);

    if (getMoonPhase(localDate) === phase) {
      cluster.push(localDate);
      continue;
    }

    if (cluster.length) {
      markerDates.add(pickClusterMarkerDay(cluster, phase));
      cluster = [];
    }
  }

  if (cluster.length) {
    markerDates.add(pickClusterMarkerDay(cluster, phase));
  }

  return markerDates;
}
