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
  selectedDate: string;
  onDayOpen: (date: string) => void;
};

export function CalendarGrid({ year, month, selectedDate, onDayOpen }: Props) {
  const days = getMonthDays(year, month);
  const todayStr = formatDate(getLocalStartOfDay());

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
            moments={entry?.moments}
            onOpen={() => onDayOpen(dateStr)}
          />
        );
      })}
    </div>
  );
}
