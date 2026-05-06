import { DayCell } from "./DayCell";
import {
  getLocalStartOfDay,
  getMonthDays,
  isCurrentMonth,
  formatDate,
} from "../../data/calendar";
import { getMoonPhase } from "../../data/moon";
import { getDayEntry } from "../../data/storage";
import type { MoonPhase } from "../../data/day-entry.types";

type Props = {
  year: number;
  month: number;
  selectedDate: string;
  onDayOpen: (date: string) => void;
};

const PHASE_CENTERS: Partial<Record<MoonPhase, number>> = {
  new_moon: 0,
  full_moon: (14.77 + 16.61) / 2,
};

function getCyclePosition(date: Date): number {
  const known = new Date(2000, 0, 6);
  const cycle = 29.53058867;
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);

  return ((diff % cycle) + cycle) % cycle;
}

function getPhaseCenterDistance(date: Date, phase: MoonPhase): number {
  const cycle = 29.53058867;
  const center = PHASE_CENTERS[phase];

  if (center === undefined) return Number.POSITIVE_INFINITY;

  const distance = Math.abs(getCyclePosition(date) - center);
  return Math.min(distance, cycle - distance);
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

function getPhaseMarkerDates(days: Date[], phase: MoonPhase): Set<string> {
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

export function CalendarGrid({ year, month, selectedDate, onDayOpen }: Props) {
  const days = getMonthDays(year, month);
  const todayStr = formatDate(getLocalStartOfDay());
  const fullMoonMarkerDates = getPhaseMarkerDates(days, "full_moon");
  const newMoonMarkerDates = getPhaseMarkerDates(days, "new_moon");

  return (
    <div className="grid grid-cols-7 gap-1">
      {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
        <div
          key={i}
          className="pb-2 text-center text-[11px] font-medium uppercase text-(--text-muted) opacity-70"
        >
          {d}
        </div>
      ))}

      {days.map((date, i) => {
        const localDate = getLocalStartOfDay(date);
        const dateStr = formatDate(localDate);
        const entry = getDayEntry(dateStr);
        const moonPhase = getMoonPhase(localDate);

        return (
          <DayCell
            key={i}
            date={localDate}
            isSelected={dateStr === selectedDate}
            isToday={dateStr === todayStr}
            isCurrentMonth={isCurrentMonth(localDate, year, month)}
            moonPhase={entry?.moonPhase ?? moonPhase}
            showFullMoonMarker={fullMoonMarkerDates.has(dateStr)}
            showNewMoonMarker={newMoonMarkerDates.has(dateStr)}
            moments={entry?.moments}
            onOpen={() => onDayOpen(dateStr)}
          />
        );
      })}
    </div>
  );
}
