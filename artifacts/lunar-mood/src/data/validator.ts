import type {
  DayEntry,
  MomentEntry,
  MomentKey,
  MoonPhase,
  NormalizedSignal,
} from "./day-entry.types";

const ALLOWED_MOON_PHASES: MoonPhase[] = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];

const ALLOWED_CONSUMPTION_TAGS: NormalizedSignal[] = [
  "caffeine",
  "sugar",
  "alcohol",
  "fast_food",
  "water",
  "screen",
  "exercise",
  "medication",
];

const MOMENT_KEYS: MomentKey[] = ["morning", "midday", "evening"];

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value !== "string") return todayString();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? todayString() : value;
}

function normalizeMetricValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function normalizeMoment(value: unknown): MomentEntry {
  const moment = isRecord(value) ? value : {};

  return {
    emotion: normalizeMetricValue(moment.emotion),
    energy: normalizeMetricValue(moment.energy),
    consumption: normalizeMetricValue(moment.consumption),
  };
}

function normalizeMoments(value: unknown): DayEntry["moments"] {
  if (!isRecord(value)) return {};

  return MOMENT_KEYS.reduce<DayEntry["moments"]>((moments, key) => {
    if (value[key] !== undefined) {
      moments[key] = normalizeMoment(value[key]);
    }

    return moments;
  }, {});
}

function normalizeConsumptionTags(value: unknown): NormalizedSignal[] {
  const tags = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.consumptionTags)
      ? value.consumptionTags
      : [];

  return tags.filter(isValidConsumptionTag);
}

function normalizeIllumination(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;

  return Math.min(100, Math.max(0, Math.round(numeric)));
}

export function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;

  return Math.min(10, Math.max(0, Math.round(numeric)));
}

export function isValidConsumptionTag(tag: unknown): tag is NormalizedSignal {
  return (
    typeof tag === "string" &&
    ALLOWED_CONSUMPTION_TAGS.includes(tag as NormalizedSignal)
  );
}

export function isValidMoonPhase(phase: unknown): phase is MoonPhase {
  return (
    typeof phase === "string" &&
    ALLOWED_MOON_PHASES.includes(phase as MoonPhase)
  );
}

export function validateDayEntry(entry: unknown): DayEntry {
  const data = isRecord(entry) ? entry : {};
  const moonPhase = isValidMoonPhase(data.moonPhase)
    ? data.moonPhase
    : undefined;

  return {
    date: normalizeDate(data.date),
    moonPhase,
    moonIllumination: normalizeIllumination(data.moonIllumination),
    moments: normalizeMoments(data.moments),
    note: typeof data.note === "string" ? data.note : "",
    normalized: normalizeConsumptionTags(data.normalized),
    updatedAt:
      typeof data.updatedAt === "number" && Number.isFinite(data.updatedAt)
        ? data.updatedAt
        : Date.now(),
  };
}
