export const DEV_FALLBACKS_UPDATED_EVENT = "lun4rmood:dev-fallbacks-updated";

export type DevFallbackKey =
  | "unknown_lunar_phase"
  | "missing_local_data"
  | "corrupted_local_data"
  | "storage_write_failure"
  | "empty_statistics";

export const DEV_FALLBACK_KEYS: DevFallbackKey[] = [
  "unknown_lunar_phase",
  "missing_local_data",
  "corrupted_local_data",
  "storage_write_failure",
  "empty_statistics",
];

type DevFallbackState = Partial<Record<DevFallbackKey, boolean>>;

type DevFallbackSession = {
  dayKey: string;
  state: DevFallbackState;
};

let devFallbackSession: DevFallbackSession | null = null;

function getCurrentLocalDayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function notifyDevFallbacksUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DEV_FALLBACKS_UPDATED_EVENT));
}

function readDevFallbackState(): DevFallbackState {
  if (typeof window === "undefined" || !import.meta.env.DEV) return {};

  const currentDayKey = getCurrentLocalDayKey();

  if (!devFallbackSession || devFallbackSession.dayKey !== currentDayKey) {
    devFallbackSession = {
      dayKey: currentDayKey,
      state: {},
    };
  }

  return devFallbackSession.state;
}

function writeDevFallbackState(state: DevFallbackState) {
  if (typeof window === "undefined" || !import.meta.env.DEV) return;
  devFallbackSession = {
    dayKey: getCurrentLocalDayKey(),
    state,
  };
  notifyDevFallbacksUpdated();
}

export function isDevFallbackEnabled(key: DevFallbackKey): boolean {
  return readDevFallbackState()[key] === true;
}

export function getDevFallbackState(): DevFallbackState {
  return readDevFallbackState();
}

export function setDevFallback(key: DevFallbackKey, enabled: boolean): void {
  const state = readDevFallbackState();
  state[key] = enabled;
  writeDevFallbackState(state);
}

export function resetDevFallbacks(): void {
  if (typeof window === "undefined" || !import.meta.env.DEV) return;
  devFallbackSession = {
    dayKey: getCurrentLocalDayKey(),
    state: {},
  };
  notifyDevFallbacksUpdated();
}
