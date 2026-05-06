import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { formatDate, getLocalStartOfDay } from "../data/calendar";
import { MoodDialog } from "./MoodDialog";
import { QuickDayEntry } from "./QuickDayEntry";

export default function Calendar() {
  const { language } = useTranslation();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    formatDate(getLocalStartOfDay()),
  );
  const [journalDate, setJournalDate] = useState<string | null>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [quickEntryRefreshKey, setQuickEntryRefreshKey] = useState(0);

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

  function openJournal(dateStr: string) {
    setSelectedDate(dateStr);
    setJournalDate(dateStr);
  }

  function refreshEntries() {
    setCalendarRefreshKey((key) => key + 1);
  }

  function refreshAfterJournalClose() {
    setCalendarRefreshKey((key) => key + 1);
    setQuickEntryRefreshKey((key) => key + 1);
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-4 overflow-hidden bg-transparent p-4 text-(--text-primary)">
      <div className="lunar-card relative z-10 flex items-center justify-between rounded-2xl p-3">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-2xl leading-none text-(--text-primary) transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-(--color-primary)"
          aria-label="Mois precedent">
          ‹
        </button>

        <span className="bg-linear-to-r from-(--color-primary) via-(--color-secondary) to-(--color-accent) bg-clip-text text-lg font-bold capitalize text-transparent">
          {monthName}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-2xl leading-none text-(--text-primary) transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-(--color-primary)"
          aria-label="Mois suivant">
          ›
        </button>
      </div>

      <div className="lunar-card relative z-10 overflow-hidden rounded-2xl p-4">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-violet-500/10 opacity-25 blur-3xl" />
        <div className="relative z-10">
          <CalendarGrid
            key={calendarRefreshKey}
            year={year}
            month={month}
            selectedDate={selectedDate}
            onDayOpen={openJournal}
          />
        </div>
      </div>

      <QuickDayEntry
        date={selectedDate}
        refreshKey={quickEntryRefreshKey}
        onSaved={refreshEntries}
      />

      {journalDate && (
        <MoodDialog
          date={journalDate}
          onClose={() => {
            setJournalDate(null);
            refreshAfterJournalClose();
          }}
        />
      )}
    </div>
  );
}
