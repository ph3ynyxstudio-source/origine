import { DayCell } from "./DayCell";
import { getMonthDays, isCurrentMonth, formatDate } from "../../data/calendar";
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
        const dateStr = formatDate(date);
        const entry = getDayEntry(dateStr);
        const moonPhase = getMoonPhase(date);

        return (
          <DayCell
            key={i}
            date={date}
            isCurrentMonth={isCurrentMonth(date, year, month)}
            moonPhase={entry?.moonPhase ?? moonPhase}
            moments={entry?.moments}
            onOpen={() => onDayOpen(dateStr)}
          />
        );
      })}
    </div>
  );
}
