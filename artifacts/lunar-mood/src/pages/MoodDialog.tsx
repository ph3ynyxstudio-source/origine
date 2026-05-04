import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

import { getDayEntry, saveDayEntry } from "../data/storage";
import { getMoonPhase } from "../data/moon";
import { parseLocalDate } from "../data/calendar";
import type {
  MomentKey,
  MetricValue,
  DayEntry,
  NormalizedSignal,
} from "../data/day-entry.types";

type Props = {
  date: string;
  onClose: () => void;
};

const MOMENTS: MomentKey[] = ["morning", "midday", "evening"];

export function MoodDialog({ date, onClose }: Props) {
  const { t } = useTranslation();

  const existing = getDayEntry(date);

  const [activeMoment, setActiveMoment] = useState<MomentKey>("morning");
  const [moments, setMoments] = useState(existing?.moments ?? {});
  const [note, setNote] = useState(existing?.note ?? "");

  const current = moments[activeMoment] ?? {
    emotion: null,
    energy: null,
    consumption: null,
  };

  function setMetric(key: keyof typeof current, value: MetricValue) {
    setMoments((prev) => ({
      ...prev,
      [activeMoment]: {
        ...(prev[activeMoment] ?? {}),
        ...current,
        [key]: value,
      },
    }));
  }

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
      moments,
      normalized,
      updatedAt: Date.now(),
    };

    saveDayEntry(entry);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="pb-safe flex max-h-[85vh] w-[90%] max-w-100 flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-bg-surface p-6 text-white shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{date}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-white/60 transition-colors hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2">
          {MOMENTS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMoment(m)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors ${
                activeMoment === m
                  ? "bg-primary shadow-lg shadow-primary/20"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              {t(m)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">{t("emotion")}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={current.emotion ?? 50}
            onChange={(e) =>
              setMetric("emotion", Number(e.target.value) as MetricValue)
            }
            className="emotion w-full cursor-pointer focus:outline-none"
          />
          <strong>{current.emotion ?? 50}%</strong>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">{t("energy")}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={current.energy ?? 50}
            onChange={(e) =>
              setMetric("energy", Number(e.target.value) as MetricValue)
            }
            className="energy w-full cursor-pointer focus:outline-none"
          />
          <strong>{current.energy ?? 50}%</strong>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">{t("consumption")}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={current.consumption ?? 50}
            onChange={(e) =>
              setMetric("consumption", Number(e.target.value) as MetricValue)
            }
            className="w-full cursor-pointer focus:outline-none"
          />
          <strong>{current.consumption ?? 50}%</strong>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">{t("note")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white transition-colors focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            {t("cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-linear-to-r from-[#22D3EE] to-[#A855F7] px-4 py-3 text-sm font-medium text-white shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.34)]"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
