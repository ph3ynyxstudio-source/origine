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
import { getExactMoonEventPhase, getMoonPhase } from "../data/moon";
import { getEntriesForDates } from "../data/storage";
import { useLocalDataVersion } from "../hooks/use-local-data-version";
import { useToday } from "../hooks/use-today";
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
  moonPhase: MoonPhase;
  moonPhaseScore: number;
};

const CONSUMPTION_COLOR = "#7C3AED";
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

export default function Statistics() {
  const { t, language } = useTranslation();
  useLocalDataVersion();
  const today = useToday();
  const locale = language === "fr" ? "fr-CA" : "en-US";
  const dates = getSevenDayDates(today);
  const dateKeys = dates.map(formatDate);
  const entriesByDate = getEntriesForDates(dateKeys);

  const chartData: SevenDayPoint[] = dates.map((date) => {
    const dateKey = formatDate(date);
    const entry = entriesByDate[dateKey];
    const moonPhase =
      getExactMoonEventPhase(date) ?? entry?.moonPhase ?? getMoonPhase(date);

    return {
      date: dateKey,
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      emotion: getAverageMetric(entry?.moments, "emotion"),
      energy: getAverageMetric(entry?.moments, "energy"),
      consumption: getAverageMetric(entry?.moments, "consumption"),
      moonPhase,
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
    <div className="mx-auto flex w-full max-w-md flex-col p-4 text-foreground md:max-w-4xl md:px-2 md:py-6 xl:max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold md:text-[2rem]">{t("statistics")}</h1>
      <p className="mb-6 text-muted-foreground md:mb-7">{t("sevenDayReport")}</p>

      <div className="lunar-card w-full rounded-2xl p-5 md:p-6 xl:p-7">
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 md:mb-6 md:gap-3">
          <div className="flex min-h-14 items-center justify-center rounded-full border border-[#EC4899]/30 bg-[#EC4899]/6 px-3 py-3 text-center shadow-[0_0_14px_rgba(236,72,153,0.12)]">
            <span className="font-medium text-foreground/88">{t("emotion")}</span>
          </div>
          <div className="flex min-h-14 items-center justify-center rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/6 px-3 py-3 text-center shadow-[0_0_14px_rgba(34,211,238,0.12)]">
            <span className="font-medium text-foreground/88">{t("energy")}</span>
          </div>
          <div className="flex min-h-14 items-center justify-center rounded-full border border-[#7C3AED]/32 bg-[#7C3AED]/10 px-3 py-3 text-center shadow-[0_0_14px_rgba(124,58,237,0.12)]">
            <span className="font-medium text-[#C4B5FD]">{t("consumption")}</span>
          </div>
          <div className="flex min-h-14 items-center justify-center rounded-full border border-foreground/20 bg-white/4 px-3 py-3 text-center shadow-[0_0_14px_rgba(226,232,240,0.1)]">
            <span className="font-medium text-foreground/88">{t("currentPhase")}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:gap-6 xl:grid xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.95fr)] xl:items-start xl:gap-6">
          <div className="mx-auto w-full max-w-[220px] sm:max-w-[320px] md:max-w-none md:px-2 xl:mx-0 xl:px-0">
            <div className="h-[195px] w-full md:h-[250px] lg:h-[280px] xl:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 6, bottom: 0, left: 0 }}>
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
                      if (item.dataKey === "moonPhaseScore") {
                        return [
                          getMoonPhaseLabel(t, item.payload.moonPhase),
                          t("currentPhase"),
                        ];
                      }

                      return [`${value}%`, name];
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
                    stroke={CONSUMPTION_COLOR}
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
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-5 xl:min-h-full xl:justify-between">
            <div className="grid grid-cols-3 gap-2 text-center md:gap-3 xl:grid-cols-1">
              <div className="rounded-xl border border-[#EC4899]/20 bg-[#EC4899]/10 p-3 shadow-[0_0_16px_rgba(236,72,153,0.08)] md:p-4">
                <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                  {t("averageMood")}
                </p>
                <p className="mt-1 text-lg font-bold text-[#EC4899] md:text-xl">
                  {formatAverage(moodAverage)}
                </p>
              </div>
              <div className="rounded-xl border border-[#22D3EE]/20 bg-[#22D3EE]/10 p-3 shadow-[0_0_16px_rgba(34,211,238,0.08)] md:p-4">
                <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                  {t("averageEnergy")}
                </p>
                <p className="mt-1 text-lg font-bold text-[#22D3EE] md:text-xl">
                  {formatAverage(energyAverage)}
                </p>
              </div>
              <div className="rounded-xl border border-[#7C3AED]/24 bg-[#7C3AED]/10 p-3 shadow-[0_0_18px_rgba(124,58,237,0.1)] md:p-4">
                <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                  {t("averageConsumption")}
                </p>
                <p className="mt-1 text-lg font-bold text-[#C4B5FD] md:text-xl">
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
