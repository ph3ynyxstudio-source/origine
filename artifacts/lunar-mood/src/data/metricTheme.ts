import type { MomentEntry } from "./day-entry.types";

export type MetricKey = Extract<
  keyof MomentEntry,
  "emotion" | "energy" | "consumption"
>;

export const METRIC_COLORS: Record<MetricKey, string> = {
  emotion: "#EC4899",
  energy: "#22D3EE",
  consumption: "#7C3AED",
};

export const METRIC_GLOW_CLASSES: Record<MetricKey, string> = {
  emotion: "shadow-[0_0_18px_rgba(236,72,153,0.16)]",
  energy: "shadow-[0_0_18px_rgba(34,211,238,0.16)]",
  consumption: "shadow-[0_0_18px_rgba(124,58,237,0.18)]",
};

const METRIC_RGB: Record<MetricKey, string> = {
  emotion: "236,72,153",
  energy: "34,211,238",
  consumption: "124,58,237",
};

export function metricColorWithAlpha(
  metric: MetricKey,
  alpha: number,
): string {
  return `rgba(${METRIC_RGB[metric]},${alpha})`;
}
