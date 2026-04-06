import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
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
