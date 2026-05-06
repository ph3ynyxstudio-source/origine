import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

import { getMoonPhase } from "../data/moon";
import { getDayEntry, saveDayEntry } from "../data/storage";
import { parseLocalDate } from "../data/calendar";
import type {
  DayEntry,
  MetricValue,
  MomentEntry,
  MomentKey,
  NormalizedSignal,
} from "../data/day-entry.types";

type Props = {
  date: string;
  refreshKey: number;
  onSaved: () => void;
};

const MOMENTS: MomentKey[] = ["morning", "midday", "evening"];

const EMPTY_MOMENT: MomentEntry = {
  emotion: null,
  energy: null,
  consumption: null,
};

type ConsumptionTag = Extract<
  NormalizedSignal,
  | "caffeine"
  | "sugar"
  | "alcohol"
  | "fast_food"
  | "water"
  | "screen"
  | "exercise"
  | "medication"
>;

const CONSUMPTION_TAGS: { key: ConsumptionTag; labelKey: string }[] = [
  { key: "caffeine", labelKey: "tagCaffeine" },
  { key: "sugar", labelKey: "tagSugar" },
  { key: "alcohol", labelKey: "tagAlcohol" },
  { key: "fast_food", labelKey: "tagFastFood" },
  { key: "water", labelKey: "tagWater" },
  { key: "screen", labelKey: "tagScreen" },
  { key: "exercise", labelKey: "tagExercise" },
  { key: "medication", labelKey: "tagMedication" },
];

type MetricConfig = {
  key: keyof MomentEntry;
  labelKey: string;
  color: string;
  glow: string;
};

const METRICS: MetricConfig[] = [
  {
    key: "emotion",
    labelKey: "emotion",
    color: "#EC4899",
    glow: "shadow-[0_0_18px_rgba(236,72,153,0.16)]",
  },
  {
    key: "energy",
    labelKey: "energy",
    color: "#22D3EE",
    glow: "shadow-[0_0_18px_rgba(34,211,238,0.16)]",
  },
  {
    key: "consumption",
    labelKey: "consumption",
    color: "#A855F7",
    glow: "shadow-[0_0_18px_rgba(168,85,247,0.16)]",
  },
];

export function QuickDayEntry({ date, refreshKey, onSaved }: Props) {
  const { t, language } = useTranslation();
  const [activeMoment, setActiveMoment] = useState<MomentKey>("morning");
  const [moments, setMoments] = useState<DayEntry["moments"]>({});
  const [selectedTags, setSelectedTags] = useState<ConsumptionTag[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const existing = getDayEntry(date);

    setActiveMoment("morning");
    setMoments(existing?.moments ?? {});
    setSelectedTags(getSelectedConsumptionTags(existing?.normalized));
    setSavedAt(null);
  }, [date, refreshKey]);

  const current = moments[activeMoment] ?? EMPTY_MOMENT;
  const dateLabel = new Intl.DateTimeFormat(
    language === "fr" ? "fr-CA" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  ).format(parseLocalDate(date));

  function setMetric(key: keyof MomentEntry, value: MetricValue) {
    const existing = getDayEntry(date);
    const currentMoment = existing?.moments[activeMoment] ?? EMPTY_MOMENT;
    const nextMoment: MomentEntry = {
      ...currentMoment,
      [key]: value,
    };
    const nextMoments: DayEntry["moments"] = {
      ...(existing?.moments ?? {}),
      [activeMoment]: nextMoment,
    };

    const entry: DayEntry = {
      date,
      moonPhase: existing?.moonPhase ?? getMoonPhase(parseLocalDate(date)),
      note: existing?.note ?? "",
      moments: nextMoments,
      normalized: existing?.normalized,
      updatedAt: Date.now(),
    };

    saveDayEntry(entry);
    setMoments(nextMoments);
    setSavedAt(entry.updatedAt);
    onSaved();
  }

  function getSelectedConsumptionTags(
    normalized: NormalizedSignal[] | undefined,
  ): ConsumptionTag[] {
    if (!normalized) return [];

    return CONSUMPTION_TAGS.map((tag) => tag.key).filter((tag) =>
      normalized.includes(tag),
    );
  }

  function toggleConsumptionTag(tag: ConsumptionTag) {
    const existing = getDayEntry(date);
    const currentTags = getSelectedConsumptionTags(existing?.normalized);
    const hasTag = currentTags.includes(tag);
    const nextTags = hasTag
      ? currentTags.filter((currentTag) => currentTag !== tag)
      : [...currentTags, tag];
    const otherSignals =
      existing?.normalized?.filter(
        (signal) =>
          !CONSUMPTION_TAGS.some((consumptionTag) => consumptionTag.key === signal),
      ) ?? [];

    const entry: DayEntry = {
      date,
      moonPhase: existing?.moonPhase ?? getMoonPhase(parseLocalDate(date)),
      note: existing?.note ?? "",
      moments: existing?.moments ?? moments,
      normalized: [...otherSignals, ...nextTags],
      updatedAt: Date.now(),
    };

    saveDayEntry(entry);
    setSelectedTags(nextTags);
    setSavedAt(entry.updatedAt);
    onSaved();
  }

  return (
    <section className="lunar-card relative z-10 rounded-2xl p-4">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
            {t("quickEntry")}
          </p>
          <h2 className="mt-1 text-lg font-bold capitalize text-(--text-primary)">
            {dateLabel}
          </h2>
        </div>
        <div className="min-h-5 text-right text-xs text-(--text-muted)">
          {savedAt ? t("saved") : ""}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2">
        {MOMENTS.map((moment) => (
          <button
            key={moment}
            type="button"
            onClick={() => setActiveMoment(moment)}
            className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
              activeMoment === moment
                ? "border-cyan-300/30 bg-primary/15 text-(--color-primary)"
                : "border-border bg-muted text-(--text-muted) hover:border-primary/25 hover:text-(--text-primary)"
            }`}>
            {t(moment)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {METRICS.map((metric) => {
          const value = current[metric.key] ?? 50;

          return (
            <label key={metric.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground/75">
                  {t(metric.labelKey)}
                </span>
                <strong style={{ color: metric.color }}>{value}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(event) =>
                  setMetric(metric.key, Number(event.target.value))
                }
                className={`h-2 w-full cursor-pointer accent-current focus:outline-none ${metric.glow}`}
                style={{
                  accentColor: metric.color,
                  background:
                    metric.key === "consumption"
                      ? "var(--slider-track)"
                      : undefined,
                }}
              />
              {metric.key === "consumption" && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {CONSUMPTION_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.key);

                    return (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() => toggleConsumptionTag(tag.key)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? "border-[rgba(0,229,255,0.35)] bg-primary/10 text-(--color-primary) shadow-[0_0_12px_rgba(0,229,255,0.12)]"
                            : "border-[rgba(244,190,160,0.22)] bg-bg-surface/80 text-(--text-muted) hover:border-primary/25 hover:text-(--text-primary)"
                        }`}
                        aria-pressed={isSelected}>
                        {t(tag.labelKey)}
                      </button>
                    );
                  })}
                </div>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
