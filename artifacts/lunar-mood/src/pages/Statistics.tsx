import { useTranslation } from "@/lib/i18n";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, getLocalStartOfDay } from "../data/calendar";
import { isDevFallbackEnabled } from "../data/devFallbacks";
import { getDisplayMoonPhase, getMoonPhaseChangeDates } from "../data/moon";
import {
  METRIC_COLORS,
  metricColorWithAlpha,
  type MetricKey,
} from "../data/metricTheme";
import { getEntriesForDates } from "../data/storage";
import { useLocalDataVersion } from "../hooks/use-local-data-version";
import { useToday } from "../hooks/use-today";
import { MOON_PHASE_ASSETS } from "../services/lunarEngine";
import type { MomentEntry, MoonPhase } from "../data/day-entry.types";

type ChartMetric = keyof MomentEntry;

type SevenDayPoint = {
  date: string;
  label: string;
  emotion: number | null;
  energy: number | null;
  consumption: number | null;
  moonPhase: MoonPhase;
  showMoonMarker: boolean;
};

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

function getSevenDayDates(today: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return getLocalStartOfDay(date);
  });
}

function getAverageMetric(
  moments: Partial<Record<string, MomentEntry>> | undefined,
  key: ChartMetric,
): number | null {
  if (!moments) return null;

  const values = Object.values(moments)
    .map((moment) => moment?.[key] ?? null)
    .filter((value): value is number => value !== null);

  if (!values.length) return null;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getMetricAverage(
  data: SevenDayPoint[],
  key: ChartMetric,
): number | null {
  const values = data
    .map((point) => point[key])
    .filter((value): value is number => value !== null);

  if (!values.length) return null;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getDailyComposite(point: SevenDayPoint): number | null {
  const values = [point.emotion, point.energy, point.consumption].filter(
    (value): value is number => value !== null,
  );

  if (!values.length) return null;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getTrendKey(data: SevenDayPoint[]): string {
  const valid = data
    .map(getDailyComposite)
    .filter((value): value is number => value !== null);

  if (valid.length < 2) return "notEnoughData";

  const midpoint = Math.ceil(valid.length / 2);
  const firstHalf = valid.slice(0, midpoint);
  const secondHalf = valid.slice(midpoint);

  if (!secondHalf.length) return "notEnoughData";

  const firstAverage =
    firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
  const secondAverage =
    secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
  const difference = secondAverage - firstAverage;

  if (difference >= 5) return "trendRising";
  if (difference <= -5) return "trendFalling";
  return "trendStable";
}

function formatAverage(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function getMoonPhaseLabel(
  t: (key: string) => string,
  moonPhase: MoonPhase,
): string {
  return t(PHASE_LABEL_KEYS[moonPhase]);
}

function metricCardStyle(
  metric: MetricKey,
  borderAlpha: number,
  backgroundAlpha: number,
  shadowAlpha: number,
) {
  return {
    borderColor: metricColorWithAlpha(metric, borderAlpha),
    backgroundColor: metricColorWithAlpha(metric, backgroundAlpha),
    boxShadow: `0 0 16px ${metricColorWithAlpha(metric, shadowAlpha)}`,
  };
}

type LunarAxisTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value?: string;
  };
  data: SevenDayPoint[];
  getPhaseLabel: (moonPhase: MoonPhase) => string;
};

function LunarAxisTick({
  x = 0,
  y = 0,
  payload,
  data,
  getPhaseLabel,
}: LunarAxisTickProps) {
  const point = data.find((item) => item.date === payload?.value);

  if (!point) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize={11}>
        {point.label}
      </text>
      {point.showMoonMarker && (
        <image
          href={MOON_PHASE_ASSETS[point.moonPhase]}
          x={-7}
          y={16}
          width={14}
          height={14}
          opacity={0.9}>
          <title>{getPhaseLabel(point.moonPhase)}</title>
        </image>
      )}
    </g>
  );
}

export default function Statistics() {
  const { t, language } = useTranslation();
  useLocalDataVersion();
  const today = useToday();
  const forceEmptyStatistics = isDevFallbackEnabled("empty_statistics");
  const locale = language === "fr" ? "fr-CA" : "en-US";
  const dates = getSevenDayDates(today);
  const dateKeys = dates.map(formatDate);
  const entriesByDate = getEntriesForDates(dateKeys);
  const moonPhaseChangeDates = getMoonPhaseChangeDates(dates);

  const chartData: SevenDayPoint[] = dates.map((date) => {
    const dateKey = formatDate(date);
    const entry = entriesByDate[dateKey];
    const moonPhase = getDisplayMoonPhase(date, entry);

    return {
      date: dateKey,
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      emotion: forceEmptyStatistics
        ? null
        : getAverageMetric(entry?.moments, "emotion"),
      energy: forceEmptyStatistics
        ? null
        : getAverageMetric(entry?.moments, "energy"),
      consumption: forceEmptyStatistics
        ? null
        : getAverageMetric(entry?.moments, "consumption"),
      moonPhase,
      showMoonMarker: moonPhaseChangeDates.has(dateKey),
    };
  });

  const hasData = chartData.some((point) =>
    [point.emotion, point.energy, point.consumption].some(
      (value) => value !== null,
    ),
  );

  const moodAverage = getMetricAverage(chartData, "emotion");
  const energyAverage = getMetricAverage(chartData, "energy");
  const consumptionAverage = getMetricAverage(chartData, "consumption");
  const trendKey = getTrendKey(chartData);

  if (!hasData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
        <p className="text-xl">{t("noDataYet")}</p>
        <p className="text-sm">{t("startLoggingMoods")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col p-4 text-foreground md:max-w-4xl md:px-2 md:py-6 xl:max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold md:text-[2rem]">{t("statistics")}</h1>
      <p className="mb-6 text-muted-foreground md:mb-7">{t("sevenDayReport")}</p>

      <div className="lunar-card w-full rounded-2xl p-5 md:p-6 xl:p-7">
        <div className="mb-4 grid grid-cols-3 gap-2 text-xs md:mb-6 md:gap-3">
          <div
            className="flex min-h-14 items-center justify-center rounded-full border px-3 py-3 text-center"
            style={metricCardStyle("emotion", 0.3, 0.06, 0.12)}>
            <span className="font-medium text-foreground/88">{t("emotion")}</span>
          </div>
          <div
            className="flex min-h-14 items-center justify-center rounded-full border px-3 py-3 text-center"
            style={metricCardStyle("energy", 0.3, 0.06, 0.12)}>
            <span className="font-medium text-foreground/88">{t("energy")}</span>
          </div>
          <div
            className="flex min-h-14 items-center justify-center rounded-full border px-3 py-3 text-center"
            style={metricCardStyle("consumption", 0.32, 0.1, 0.12)}>
            <span
              className="font-medium"
              style={{ color: METRIC_COLORS.consumption }}>
              {t("consumption")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:gap-6 xl:grid xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.85fr)] xl:items-start xl:gap-6">
          <div className="w-full md:px-1 xl:px-0">
            <div className="h-[220px] w-full md:h-[270px] lg:h-[300px] xl:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 6, bottom: 18, left: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    height={44}
                    interval={0}
                    tick={
                      <LunarAxisTick
                        data={chartData}
                        getPhaseLabel={(moonPhase) =>
                          getMoonPhaseLabel(t, moonPhase)
                        }
                      />
                    }
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    width={28}
                  />
                  <Tooltip
                    cursor={{ stroke: "hsl(var(--border))" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value, name, item) => {
                      return [`${value}%`, name];
                    }}
                    labelFormatter={(dateKey) => {
                      const point = chartData.find((item) => item.date === dateKey);
                      return point
                        ? `${point.label} · ${getMoonPhaseLabel(t, point.moonPhase)}`
                        : dateKey;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="emotion"
                    stroke={METRIC_COLORS.emotion}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    name={t("emotion")}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke={METRIC_COLORS.energy}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    name={t("energy")}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    stroke={METRIC_COLORS.consumption}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    name={t("consumption")}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-5 xl:min-h-full xl:justify-between">
            <div className="grid grid-cols-3 gap-2 text-center md:gap-3 xl:grid-cols-1">
              <div
                className="rounded-xl border p-3 md:p-4"
                style={metricCardStyle("emotion", 0.2, 0.1, 0.08)}>
                <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                  {t("averageMood")}
                </p>
                <p
                  className="mt-1 text-lg font-bold md:text-xl"
                  style={{ color: METRIC_COLORS.emotion }}>
                  {formatAverage(moodAverage)}
                </p>
              </div>
              <div
                className="rounded-xl border p-3 md:p-4"
                style={metricCardStyle("energy", 0.2, 0.1, 0.08)}>
                <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                  {t("averageEnergy")}
                </p>
                <p
                  className="mt-1 text-lg font-bold md:text-xl"
                  style={{ color: METRIC_COLORS.energy }}>
                  {formatAverage(energyAverage)}
                </p>
              </div>
              <div
                className="rounded-xl border p-3 md:p-4"
                style={metricCardStyle("consumption", 0.24, 0.1, 0.1)}>
                <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                  {t("averageConsumption")}
                </p>
                <p
                  className="mt-1 text-lg font-bold md:text-xl"
                  style={{ color: METRIC_COLORS.consumption }}>
                  {formatAverage(consumptionAverage)}
                </p>
              </div>
            </div>

            <p className="rounded-xl border border-border bg-muted p-3 text-sm leading-relaxed text-foreground/80 md:p-4">
              {t(trendKey)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
