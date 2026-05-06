import { useTranslation } from "@/lib/i18n";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, getLocalStartOfDay } from "../data/calendar";
import { getMoonPhase } from "../data/moon";
import { getEntriesForDates } from "../data/storage";
import type { MomentEntry, MoonPhase } from "../data/day-entry.types";

const MOON_PHASE_INDEX: Record<MoonPhase, number> = {
  new_moon: 0,
  waxing_crescent: 1,
  first_quarter: 2,
  waxing_gibbous: 3,
  full_moon: 4,
  waning_gibbous: 5,
  last_quarter: 6,
  waning_crescent: 7,
};

type ChartMetric = keyof MomentEntry;

type SevenDayPoint = {
  date: string;
  label: string;
  emotion: number | null;
  energy: number | null;
  consumption: number | null;
  moonPhaseScore: number;
};

function getSevenDayDates(): Date[] {
  const today = getLocalStartOfDay();

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

export default function Statistics() {
  const { t, language } = useTranslation();
  const locale = language === "fr" ? "fr-CA" : "en-US";
  const dates = getSevenDayDates();
  const dateKeys = dates.map(formatDate);
  const entriesByDate = getEntriesForDates(dateKeys);

  const chartData: SevenDayPoint[] = dates.map((date) => {
    const dateKey = formatDate(date);
    const entry = entriesByDate[dateKey];
    const moonPhase = entry?.moonPhase ?? getMoonPhase(date);

    return {
      date: dateKey,
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      emotion: getAverageMetric(entry?.moments, "emotion"),
      energy: getAverageMetric(entry?.moments, "energy"),
      consumption: getAverageMetric(entry?.moments, "consumption"),
      moonPhaseScore: Math.round((MOON_PHASE_INDEX[moonPhase] / 7) * 100),
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
    <div className="p-4 text-foreground">
      <h1 className="mb-1 text-2xl font-bold">{t("statistics")}</h1>
      <p className="mb-6 text-muted-foreground">{t("sevenDayReport")}</p>

      <div className="lunar-card rounded-2xl p-5">
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#EC4899]" />
            <span className="text-muted-foreground">{t("emotion")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2">
            <span className="h-0.5 w-4 rounded-full bg-[#22D3EE]" />
            <span className="text-muted-foreground">{t("energy")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2">
            <span className="h-0.5 w-4 rounded-full bg-[#A855F7]" />
            <span className="text-muted-foreground">{t("consumption")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2">
            <span className="h-0.5 w-4 rounded-full bg-foreground/70" />
            <span className="text-muted-foreground">{t("currentPhase")}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Bar
              dataKey="emotion"
              fill="#EC4899"
              radius={[4, 4, 0, 0]}
              name={t("emotion")}
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#22D3EE"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name={t("energy")}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#A855F7"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name={t("consumption")}
            />
            <Line
              type="monotone"
              dataKey="moonPhaseScore"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              dot={false}
              name={t("currentPhase")}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-[#EC4899]/20 bg-[#EC4899]/10 p-3 shadow-[0_0_16px_rgba(236,72,153,0.08)]">
            <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
              {t("averageMood")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#EC4899]">
              {formatAverage(moodAverage)}
            </p>
          </div>
          <div className="rounded-xl border border-[#22D3EE]/20 bg-[#22D3EE]/10 p-3 shadow-[0_0_16px_rgba(34,211,238,0.08)]">
            <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
              {t("averageEnergy")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#22D3EE]">
              {formatAverage(energyAverage)}
            </p>
          </div>
          <div className="rounded-xl border border-[#A855F7]/20 bg-[#A855F7]/10 p-3 shadow-[0_0_16px_rgba(168,85,247,0.08)]">
            <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
              {t("averageConsumption")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#A855F7]">
              {formatAverage(consumptionAverage)}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-border bg-muted p-3 text-sm leading-relaxed text-foreground/80">
          {t(trendKey)}
        </p>
      </div>
    </div>
  );
}
