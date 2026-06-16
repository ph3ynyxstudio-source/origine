import React from "react";
import { useTranslation } from "@/lib/i18n";
import { ChevronDown, Sparkles, X } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

import { getDayEntry } from "../data/storage";
import { formatDate, getLocalStartOfDay, toLocalNoon } from "../data/calendar";
import { getCurrentMoonPhase } from "../data/moon";
import { METRIC_COLORS, formatMetricPercent } from "../data/metricTheme";
import { analyzeHistory } from "@/core/Core/crystaph3y/engine";
import { useLocalDataVersion } from "../hooks/use-local-data-version";
import { useToday } from "../hooks/use-today";
import { getLunarCycleDay, MOON_PHASE_ASSETS } from "../services/lunarEngine";
import { QuickDayEntry } from "./QuickDayEntry";
import type { DayEntry, MomentEntry, MoonPhase } from "../data/day-entry.types";

function Moon({ phase }: { phase: MoonPhase }) {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <div className="absolute inset-6 rounded-full bg-cyan-200/16 blur-3xl" />
      <div className="absolute inset-9 rounded-full bg-violet-400/10 blur-[48px]" />
      <img
        src={MOON_PHASE_ASSETS[phase]}
        alt={phase}
        width={144}
        height={144}
        className="relative h-36 w-36 object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.32)]"
        decoding="async"
      />
    </div>
  );
}

const PHASE_LABEL_KEYS: Record<MoonPhase, string> = {
  new_moon: "phaseNewMoon",
  waxing_crescent: "phaseWaxingCrescent",
  first_quarter: "phaseFirstQuarter",
  waxing_gibbous: "phaseWaxingGibbous",
  full_moon: "phaseFullMoon",
  waning_gibbous: "phaseWaningGibbous",
  last_quarter: "phaseLastQuarter",
  waning_crescent: "phaseWaningCrescent",
};

// --- UTILITAIRES ---
function getAverageMetric(
  entry: DayEntry | null | undefined,
  key: keyof Pick<MomentEntry, "emotion" | "energy">,
): number | null {
  if (!entry) return null;

  const values = (Object.values(entry.moments) as (MomentEntry | undefined)[])
    .map((m) => m?.[key] ?? null)
    .filter((v): v is number => v !== null);

  return values.length
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        ),
      )
    : null;
}

function getFallbackInsightKey(mood: number | null, energy: number | null): string {
  if (mood === null || energy === null) {
    return "insightStartLogging";
  }

  if (energy < 40 && mood < 40) {
    return "insightLowMoodLowEnergy";
  }

  if (energy > 60 && mood < 40) {
    return "insightLowMoodHighEnergy";
  }

  if (energy < 40 && mood > 60) {
    return "insightHighMoodLowEnergy";
  }

  if (energy > 60 && mood > 60) {
    return "insightHighMoodHighEnergy";
  }

  return "insightStable";
}

// --- DASHBOARD ---
export default function Dashboard() {
  const { t, language } = useTranslation();
  const [quickEntryOpen, setQuickEntryOpen] = React.useState(false);
  const dataVersion = useLocalDataVersion();
  const today = useToday();
  const locale = language === "fr" ? fr : enUS;
  const dateLabel = format(today, "EEEE d MMMM", { locale });
  const dateStr = formatDate(today);

  // Dashboard shows the current phase; Calendar/Statistics keep exact event markers.
  const moonPhase = getCurrentMoonPhase(today);
  const moonPhaseLabel = t(PHASE_LABEL_KEYS[moonPhase]);
  const cycleDay = getLunarCycleDay(toLocalNoon(today));

  const entry = getDayEntry(dateStr);
  const mood = getAverageMetric(entry, "emotion");
  const energy = getAverageMetric(entry, "energy");

  const insight = analyzeHistory(
    entry
      ? [{ date: dateStr, mood: mood ?? 50, consumption: 2, tags: [] }]
      : [],
    { date: dateStr, mood: mood ?? 50, consumption: 2, tags: [] },
  );

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-transparent p-4 text-(--text-primary)">
      <header>
        <h1 className="text-2xl font-bold">{t("hello")}</h1>
        <p className="text-(--text-muted)">{dateLabel}</p>
      </header>

      {/* Carte Lune */}
      <div className="lunar-card relative flex flex-col items-center overflow-hidden rounded-[2.5rem] px-8 pb-10 pt-7">
        <div className="pointer-events-none absolute inset-x-10 top-10 h-24 rounded-full bg-cyan-200/6 blur-3xl" />
        <Moon phase={moonPhase} />

        <div className="mt-5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-(--text-muted) opacity-60">
            {t("currentPhase")}
          </p>
          <p className="text-3xl font-bold bg-linear-to-r from-(--color-primary) via-(--color-secondary) to-(--color-accent) bg-clip-text text-transparent">
            {moonPhaseLabel}
          </p>
          <p className="mt-3 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm text-(--text-muted) shadow-[0_0_18px_rgba(34,211,238,0.16)]">
            {t("cycleDay")} {cycleDay}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setQuickEntryOpen((isOpen) => !isOpen)}
          aria-expanded={quickEntryOpen}
          className="lunar-card flex w-full items-center justify-between rounded-[1.75rem] border border-cyan-300/30 bg-linear-to-r from-cyan-300/8 via-violet-400/8 to-transparent px-5 py-4 text-left shadow-[0_0_28px_rgba(34,211,238,0.12)] transition-all duration-300 hover:border-cyan-200/40 hover:shadow-[0_0_34px_rgba(34,211,238,0.16)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-(--text-muted)">
                {t("quickCapture")}
              </p>
              <p className="mt-1 text-sm text-foreground/80">
                {dateLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-(--text-muted)">
            {quickEntryOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
        </button>

        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out ${
            quickEntryOpen
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}>
          <div className="min-h-0">
            <QuickDayEntry
              date={dateStr}
              refreshKey={dataVersion}
              onSaved={() => {}}
              className="rounded-[1.75rem] border border-cyan-300/16 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
            />
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="lunar-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-(--text-muted) mb-1">
            {t("todayMood")}
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: METRIC_COLORS.emotion }}>
            {formatMetricPercent(mood)}
          </p>
        </div>
        <div className="lunar-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-(--text-muted) mb-1">
            {t("energy")}
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: METRIC_COLORS.energy }}>
            {formatMetricPercent(energy)}
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className="lunar-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <p className="text-xs font-bold uppercase tracking-widest text-(--text-muted)">
            {t("insight")}
          </p>
        </div>
        <p className="text-sm leading-relaxed opacity-90">
          {insight?.insight && insight.insight !== "Test Crystaph3y actif"
            ? insight.insight
            : t(getFallbackInsightKey(mood, energy))}
        </p>
      </div>
    </div>
  );
}
