import { DayCell } from "./DayCell";
import { getMonthDays, isCurrentMonth, formatDate } from "../../data/calendar";
import { getMoonPhase } from "../../data/moon";
import { getDayEntry } from "../../data/storage";
import { MetricValue, MomentEntry } from "../../data/day-entry.types";

type Props = {
  year: number;
  month: number;
  onDayOpen: (date: string) => void;
};

function avgMetric(
  moments: Partial<Record<string, MomentEntry>>,
  key: keyof MomentEntry,
): MetricValue {
  const values = Object.values(moments)
    .map((m) => m?.[key])
    .filter(
      (v): v is Exclude<MetricValue, null> => v !== null && v !== undefined,
    );
  if (!values.length) return null;
  return Math.round(
    values.reduce((a, b) => a + b, 0) / values.length,
  ) as MetricValue;
}

export function CalendarGrid({ year, month, onDayOpen }: Props) {
  const days = getMonthDays(year, month);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "4px",
      }}
    >
      {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
        <div
          key={i}
          style={{ textAlign: "center", fontSize: "11px", opacity: 0.5 }}
        >
          {d}
        </div>
      ))}
      {days.map((date, i) => {
        const dateStr = formatDate(date);
        const entry = getDayEntry(dateStr);
        const moonPhase = getMoonPhase(date);
        return (
          <DayCell
            key={i}
            date={date}
            isCurrentMonth={isCurrentMonth(date, year, month)}
            moonPhase={entry?.moonPhase ?? moonPhase}
            indicators={{
              emotion: entry ? avgMetric(entry.moments, "emotion") : null,
              energy: entry ? avgMetric(entry.moments, "energy") : null,
              consumption: entry
                ? avgMetric(entry.moments, "consumption")
                : null,
            }}
            onOpen={() => onDayOpen(dateStr)}
          />
        );
      })}
    </div>
  );
}
