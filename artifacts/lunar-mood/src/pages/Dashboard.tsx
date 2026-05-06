import React from "react";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

import { getDayEntry } from "../data/storage";
import { formatDate, getLocalStartOfDay } from "../data/calendar";
import { getMoonPhase } from "../data/moon";
import { analyzeHistory } from "@/core/Core/crystaph3y/engine";
import type { DayEntry, MomentEntry, MoonPhase } from "../data/day-entry.types";

const MOON_PHASE_ASSETS: Record<MoonPhase, string> = {
  new_moon: "/branding/moons/moon_new.webp",
  waxing_crescent: "/branding/moons/moon_waxing_crescent.webp",
  first_quarter: "/branding/moons/moon_first_quarter.webp",
  waxing_gibbous: "/branding/moons/moon_waxing_gibbous.webp",
  full_moon: "/branding/moons/moon_full.webp",
  waning_gibbous: "/branding/moons/moon_waning_gibbous.webp",
  last_quarter: "/branding/moons/moon_last_quarter.webp",
  waning_crescent: "/branding/moons/moon_waning_crescent.webp",
};

function Moon({ phase }: { phase: MoonPhase }) {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <div className="absolute inset-5 rounded-full bg-cyan-300/20 blur-2xl" />
      <img
        src={MOON_PHASE_ASSETS[phase]}
        alt={phase}
        width={160}
        height={160}
        className="relative h-40 w-40 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.35)]"
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

function getLunarCycleDay(date: Date): number {
  const known = new Date(2000, 0, 6);
  const cycle = 29.53058867;
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const position = ((diff % cycle) + cycle) % cycle;

  return Math.floor(position) + 1;
}

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
  const today = getLocalStartOfDay();
  const locale = language === "fr" ? fr : enUS;
  const dateLabel = format(today, "EEEE d MMMM", { locale });
  const dateStr = formatDate(today);

  const moonPhase = getMoonPhase(today);
  const moonPhaseLabel = t(PHASE_LABEL_KEYS[moonPhase]);
  const cycleDay = getLunarCycleDay(today);

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
      <div className="lunar-card relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center">
        <Moon phase={moonPhase} />

        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-(--text-muted) opacity-60">
            {t("currentPhase")}
          </p>
          <p className="text-3xl font-bold bg-linear-to-r from-(--color-primary) via-(--color-secondary) to-(--color-accent) bg-clip-text text-transparent">
            {moonPhaseLabel}
          </p>
          <p className="mt-2 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm text-(--text-muted) shadow-[0_0_18px_rgba(34,211,238,0.16)]">
            {t("cycleDay")} {cycleDay}
          </p>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="lunar-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-(--text-muted) mb-1">
            {t("todayMood")}
          </p>
          <p className="text-2xl font-bold text-(--color-primary)">
            {mood !== null ? `${mood}%` : "—"}
          </p>
        </div>
        <div className="lunar-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-(--text-muted) mb-1">
            {t("energy")}
          </p>
          <p className="text-2xl font-bold text-(--color-secondary)">
            {energy !== null ? `${energy}%` : "—"}{" "}
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
