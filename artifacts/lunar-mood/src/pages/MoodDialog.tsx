import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

import { getDayEntry, saveDayEntry } from "../data/storage";
import { getMoonPhase } from "../data/moon";
import { parseLocalDate } from "../data/calendar";
import type { DayEntry, NormalizedSignal } from "../data/day-entry.types";

type Props = {
  date: string;
  onClose: () => void;
};

export function MoodDialog({ date, onClose }: Props) {
  const { t } = useTranslation();

  const existing = getDayEntry(date);

  const [note, setNote] = useState(existing?.note ?? "");

  function normalizeNote(value: string): NormalizedSignal[] {
    const normalized: NormalizedSignal[] = [];
    const lower = value.toLowerCase();

    if (lower.includes("café")) normalized.push("caffeine");
    if (lower.includes("coffee")) normalized.push("caffeine");

    if (lower.includes("sucre")) normalized.push("sugar");
    if (lower.includes("gâteau")) normalized.push("sugar");
    if (lower.includes("cake")) normalized.push("sugar");

    return normalized;
  }

  function handleSave() {
    const normalized = normalizeNote(note);

    const entry: DayEntry = {
      date,
      moonPhase: existing?.moonPhase ?? getMoonPhase(parseLocalDate(date)),
      note,
      moments: existing?.moments ?? {},
      normalized,
      updatedAt: Date.now(),
    };

    saveDayEntry(entry);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/55 p-4 backdrop-blur-md">
      <div className="lunar-card pb-safe flex max-h-[85vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-2xl border-primary/35 p-6 text-foreground shadow-[0_0_42px_rgba(34,211,238,0.18),0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
              {t("journal")}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{date}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-foreground/70">{t("noteOptional")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={9}
            className="w-full resize-none rounded-xl border border-primary/20 bg-background/40 p-4 text-sm leading-relaxed text-foreground shadow-inner shadow-black/10 transition-colors placeholder:text-muted-foreground focus:border-primary/45 focus:outline-none"
            placeholder={t("journalPlaceholder")}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80">
            {t("cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-linear-to-r from-[#22D3EE] to-[#A855F7] px-4 py-3 text-sm font-medium text-white shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.34)]">
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
//review
