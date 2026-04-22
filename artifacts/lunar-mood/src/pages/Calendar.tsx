import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { FullMoon, WaningCrescent, WaxingCrescent } from "@/components/moon-phases";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { MoodDialog } from "./MoodDialog";
export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const monthName = new Date(year, month).toLocaleString("fr-CA", {
    month: "long",
    year: "numeric",
  });

  return (
    <AppLayout>
      <div style={{ padding: "16px", color: "white" }}>
        <div className="mb-4 flex items-center justify-center gap-4 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-md">
          <WaxingCrescent className="h-5 w-5 text-slate-300/70" />
          <FullMoon className="h-5 w-5 text-[#7EEBFF] drop-shadow-[0_0_6px_rgba(126,235,255,0.6)]" />
          <WaningCrescent className="h-5 w-5 text-[#B78CFF]" />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={prevMonth}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ‹
          </button>
          <span style={{ textTransform: "capitalize" }}>{monthName}</span>
          <button
            onClick={nextMonth}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ›
          </button>
        </div>
        <CalendarGrid year={year} month={month} onDayOpen={setSelectedDate} />
        {selectedDate && (
          <MoodDialog
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
