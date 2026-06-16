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

export function toMetricScore(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;

  const clampedValue = Math.min(100, Math.max(0, numericValue));
  return Math.round((clampedValue / 10) * 10) / 10;
}

export function formatMetricScoreValue(
  score: number | null | undefined,
): string {
  if (score === null || score === undefined) return "—";

  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return "—";

  const clampedScore = Math.min(10, Math.max(0, numericScore));
  const roundedScore = Math.round(clampedScore * 10) / 10;
  const formattedScore = Number.isInteger(roundedScore)
    ? String(roundedScore)
    : roundedScore.toFixed(1);

  return `${formattedScore} / 10`;
}

export function formatMetricScore(
  value: number | null | undefined,
): string {
  return formatMetricScoreValue(toMetricScore(value));
}

export function formatMetricPercent(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) return "—";

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "—";

  const clampedValue = Math.min(100, Math.max(0, numericValue));
  const roundedValue = Math.round(clampedValue * 10) / 10;
  const formattedValue = Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(1);

  return `${formattedValue}%`;
}
