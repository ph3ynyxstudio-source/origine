import type { MoonPhase } from "./day-entry.types";
import moonEvents from "./moonEvents.json";
import { formatDate, getLocalStartOfDay, toLocalNoon } from "./calendar";
import { getMoonPhase as getMoonPhaseData } from "../services/lunarEngine";

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

function getLocalDayEnd(date: Date): Date {
  const nextDay = getLocalStartOfDay(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
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

export function getMoonPhase(date: Date): MoonPhase {
  const exactPhase = getExactMoonEventPhase(date);

  if (exactPhase) {
    return exactPhase;
  }

  return getMoonPhaseData(toLocalNoon(date)).phase;
}
