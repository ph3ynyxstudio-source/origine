import React from "react";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

import { getDayEntry } from "../data/storage";
import { formatDate, getLocalStartOfDay } from "../data/calendar";
import { getMoonPhase } from "../data/moon";
import { analyzeHistory } from "@/core/Core/crystaph3y/engine";
import type { DayEntry, MomentEntry, MoonPhase } from "../data/day-entry.types";

// --- MOON NEON FULL (Pleine Lune Uniquement) ---
function Moon() {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      {/* 1. Halo extérieur (L'aura néon) */}
      <div className="absolute -inset-3.75 rounded-full blur-3xl opacity-50 bg-linear-to-tr from-(--color-primary) via-(--color-secondary) to-(--color-accent)" />

      {/* 2. Corps de la lune */}
      <div className="absolute inset-0 rounded-full overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.4)]">
        {/* 3. Surface éclairée (Pleine Lune) */}
        <div className="absolute inset-0 bg-linear-to-tr from-(--color-primary) via-(--color-secondary) to-(--color-accent)" />

        {/* 4. Texture et brillance subtile */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white_0%,transparent_70%)]" />
      </div>

      {/* 5. Cercle de contour "Edge Light" */}
      <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none" />
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
    <div className="flex flex-col gap-4 p-4 text-(--text-primary) min-h-screen bg-(--bg-base)">
      <header>
        <h1 className="text-2xl font-bold">{t("hello")}</h1>
        <p className="text-(--text-muted)">{dateLabel}</p>
      </header>

      {/* Carte Lune */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-bg-surface p-8 shadow-2xl shadow-black/60 backdrop-blur-2xl flex flex-col items-center">
        <Moon />

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
        <div className="rounded-2xl border border-white/8 bg-bg-surface p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-wider text-(--text-muted) mb-1">
            {t("todayMood")}
          </p>
          <p className="text-2xl font-bold text-(--color-primary)">
            {mood ?? "--"}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-bg-surface p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-wider text-(--text-muted) mb-1">
            {t("energy")}
          </p>
          <p className="text-2xl font-bold text-(--color-secondary)">
            {energy ?? "--"}%
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-2xl border border-white/8 bg-bg-surface p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <p className="text-xs font-bold uppercase tracking-widest text-(--text-muted)">
            {t("insight")}
          </p>
        </div>
        <p className="text-sm leading-relaxed opacity-90">{insight.insight}</p>
      </div>
    </div>
  );
}
