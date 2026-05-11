import { formatDate, getLocalStartOfDay } from "./calendar";
import type { DayEntry, MomentEntry, NormalizedSignal } from "./day-entry.types";
import {
  LOCAL_DATA_UPDATED_EVENT,
  deleteDayEntry,
  getDayEntry,
  saveDayEntry,
} from "./storage";

const DEV_SEED_DATES_KEY = "lun4rmood:dev-seed:dates";
const DEV_SEED_NOTE_PREFIX = "[DEV_SEED]";
const DEV_SEED_SIGNALS: NormalizedSignal[] = [
  "caffeine",
  "sugar",
  "alcohol",
  "fast_food",
  "water",
  "screen",
  "exercise",
  "medication",
];

type DevSeedResult = {
  created: number;
  skipped: number;
};

function notifyBulkSeedUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LOCAL_DATA_UPDATED_EVENT));
}

function readSeededDates(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(DEV_SEED_DATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeSeededDates(dates: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEV_SEED_DATES_KEY, JSON.stringify(dates));
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createMoment(base: number, offset: number): MomentEntry {
  return {
    emotion: clampMetric(base + ((offset * 9) % 31) - 15),
    energy: clampMetric(base + ((offset * 7) % 27) - 13),
    consumption: clampMetric(base + ((offset * 11) % 35) - 17),
  };
}

function createDevEntry(date: Date, index: number): DayEntry {
  const base = 52 + ((index * 13) % 18) - 9;
  const morning = createMoment(base, index + 1);
  const midday = createMoment(base + 6, index + 3);
  const evening = createMoment(base - 4, index + 5);
  const signals = DEV_SEED_SIGNALS.filter((_, signalIndex) =>
    (index + signalIndex) % 4 === 0,
  );

  return {
    date: formatDate(date),
    moments: {
      morning,
      midday,
      evening,
    },
    note: `${DEV_SEED_NOTE_PREFIX} Sample journal entry ${index + 1}`,
    normalized: signals,
    updatedAt: Date.now() - index * 3_600_000,
  };
}

export function generateDevSeedData(days = 28): DevSeedResult {
  const today = getLocalStartOfDay();
  const seededDates = new Set(readSeededDates());
  let created = 0;
  let skipped = 0;

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    const dateKey = formatDate(date);

    if (getDayEntry(dateKey)) {
      skipped += 1;
      continue;
    }

    saveDayEntry(createDevEntry(date, index));
    seededDates.add(dateKey);
    created += 1;
  }

  writeSeededDates([...seededDates].sort());
  notifyBulkSeedUpdate();

  return { created, skipped };
}

export function clearDevSeedData(): number {
  const seededDates = readSeededDates();

  seededDates.forEach((date) => {
    deleteDayEntry(date);
  });

  if (typeof window !== "undefined") {
    localStorage.removeItem(DEV_SEED_DATES_KEY);
  }

  notifyBulkSeedUpdate();
  return seededDates.length;
}
