export type MoonPhase =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

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
  | "junk_food"
  | "hydration";
export type DayEntry = {
  date: string;
  // Snapshot historique de la phase au moment de la sauvegarde.
  // Le dashboard affiche la phase courante via getMoonPhase(date).
  moonPhase: MoonPhase;
  moments: Partial<Record<MomentKey, MomentEntry>>;
  note: string;
  normalized?: NormalizedSignal[];
  updatedAt: number;
};
