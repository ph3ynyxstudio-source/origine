import { DayCell } from "./DayCell";
import {
  getLocalStartOfDay,
  getMonthDays,
  isCurrentMonth,
  formatDate,
} from "../../data/calendar";
import { getMoonPhase } from "../../data/moon";
import { getDayEntry } from "../../data/storage";

type Props = {
  year: number;
  month: number;
  onDayOpen: (date: string) => void;
};

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
        const localDate = getLocalStartOfDay(date);
        const dateStr = formatDate(localDate);
        const entry = getDayEntry(dateStr);
        const moonPhase = getMoonPhase(localDate);

        return (
          <DayCell
            key={i}
            date={localDate}
            isCurrentMonth={isCurrentMonth(localDate, year, month)}
            moonPhase={entry?.moonPhase ?? moonPhase}
            moments={entry?.moments}
            onOpen={() => onDayOpen(dateStr)}
          />
        );
      })}
    </div>
  );
}
