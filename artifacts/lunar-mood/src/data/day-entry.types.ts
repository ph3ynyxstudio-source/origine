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

export type MetricValue = 1 | 2 | 3 | 4 | 5 | null;

export type MomentEntry = {
  emotion: MetricValue;
  energy: MetricValue;
  consumption: MetricValue;
};

export type DayEntry = {
  date: string;
  moonPhase: MoonPhase;
  moments: Partial<Record<MomentKey, MomentEntry>>;
  note: string;
  updatedAt: number;
};
