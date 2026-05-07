import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "@/lib/i18n";

import { getMoonPhase } from "../data/moon";
import { getDayEntry, saveDayEntry } from "../data/storage";
import { parseLocalDate } from "../data/calendar";
import { cn } from "../lib/utils";
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

const PRIMARY_CONSUMPTION_TAGS = CONSUMPTION_TAGS.filter((tag) =>
  ["caffeine", "sugar", "screen"].includes(tag.key),
);

const MORE_CONSUMPTION_TAGS = CONSUMPTION_TAGS.filter(
  (tag) => !PRIMARY_CONSUMPTION_TAGS.some((primaryTag) => primaryTag.key === tag.key),
);

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
  const [showMoreConsumptionTags, setShowMoreConsumptionTags] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const existing = getDayEntry(date);

    setActiveMoment("morning");
    setMoments(existing?.moments ?? {});
    setSelectedTags(getSelectedConsumptionTags(existing?.normalized));
    setShowMoreConsumptionTags(false);
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

  function renderConsumptionChip(tag: { key: ConsumptionTag; labelKey: string }) {
    const isSelected = selectedTags.includes(tag.key);

    return (
      <button
        key={tag.key}
        type="button"
        onClick={() => toggleConsumptionTag(tag.key)}
        className={cn(
          "min-h-9 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
          isSelected
            ? "border-[#A855F7]/45 bg-[#A855F7]/15 text-[#A855F7] shadow-[0_0_16px_rgba(168,85,247,0.14)]"
            : "border-border bg-muted/55 text-muted-foreground hover:border-primary/30 hover:text-foreground",
        )}
        aria-pressed={isSelected}>
        {isSelected ? "✓" : "+"} {t(tag.labelKey)}
      </button>
    );
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
            className={cn(
              "min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
              activeMoment === moment
                ? "border-cyan-300/30 bg-primary/15 text-(--color-primary)"
                : "border-border bg-muted text-(--text-muted) hover:border-primary/25 hover:text-(--text-primary)",
            )}>
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
                className={`lunar-slider h-2 w-full cursor-pointer accent-current focus:outline-none ${metric.glow}`}
                style={{
                  "--slider-thumb-color": metric.color,
                  accentColor: metric.color,
                  background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color} ${value}%, var(--slider-track) ${value}%, var(--slider-track) 100%)`,
                } as CSSProperties}
              />
              {metric.key === "consumption" && (
                <div className="mt-1 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_CONSUMPTION_TAGS.map(renderConsumptionChip)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowMoreConsumptionTags((isVisible) => !isVisible)
                      }
                      className={cn(
                        "min-h-9 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                        showMoreConsumptionTags
                          ? "border-[#22D3EE]/45 bg-[#22D3EE]/12 text-[#22D3EE] shadow-[0_0_16px_rgba(34,211,238,0.12)]"
                          : "border-border bg-muted/55 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                      aria-expanded={showMoreConsumptionTags}>
                      + Add more
                    </button>
                  </div>
                  {showMoreConsumptionTags && (
                    <div className="flex flex-wrap gap-2">
                      {MORE_CONSUMPTION_TAGS.map(renderConsumptionChip)}
                    </div>
                  )}
                </div>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
