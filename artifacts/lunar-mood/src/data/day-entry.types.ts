import type { MoonPhase } from "../services/lunarEngine";

export type { MoonPhase };

export type MomentKey = "morning" | "midday" | "evening";

export type MetricValue = number | null;

export type MomentEntry = {
  emotion: MetricValue;
  energy: MetricValue;
  consumption: MetricValue;
};
export type NormalizedSignal =
  | "caffeine"
  | "sugar"
  | "alcohol"
  | "cannabis"
  | "fast_food"
  | "junk_food"
  | "hydration"
  | "water"
  | "screen"
  | "exercise"
  | "medication";
export type DayEntry = {
  date: string;
  // Snapshot historique de la phase au moment de la sauvegarde.
  // Le dashboard affiche la phase courante via getMoonPhase(date).
  moonPhase?: MoonPhase;
  moonIllumination?: number;
  moments: Partial<Record<MomentKey, MomentEntry>>;
  note: string;
  normalized?: NormalizedSignal[];
  updatedAt: number;
};
