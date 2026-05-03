import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

import {
  FullMoon,
  WaningCrescent,
  WaxingCrescent,
} from "@/components/moon-phases";

import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { MoodDialog } from "./MoodDialog";

export default function Calendar() {
  const { t, language } = useTranslation(); // ✅ FIX

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

  // ✅ FIX i18n date
  const locale = language === "fr" ? "fr-CA" : "en-US";

  const date = new Date(year, month);

  const monthName = date.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ padding: "16px", color: "white" }}>
      {/* ✅ TITLE */}
      <h1 className="text-center mb-4">{t("calendar")}</h1>

      <div className="mb-4 flex items-center justify-center gap-4 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-md">
        <WaxingCrescent className="h-5 w-5 text-slate-300/70" />
        <FullMoon className="h-5 w-5 text-[#7EEBFF] drop-shadow-[0_0_6px_rgba(126,235,255,0.6)]" />
        <WaningCrescent className="h-5 w-5 text-[#B78CFF]" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-white text-xl">
          ‹
        </button>

        <span className="capitalize">{monthName}</span>

        <button onClick={nextMonth} className="text-white text-xl">
          ›
        </button>
      </div>

      <CalendarGrid year={year} month={month} onDayOpen={setSelectedDate} />

      {selectedDate && (
        <MoodDialog date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}
