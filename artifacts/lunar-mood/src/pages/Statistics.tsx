import { useTranslation } from "@/lib/i18n";
import { getMonthEntries } from "../data/storage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PHASES = [
  { key: "new_moon", emoji: "🌑", label: "Nouvelle Lune" },
  { key: "waxing_crescent", emoji: "🌒", label: "Croissant" },
  { key: "first_quarter", emoji: "🌓", label: "1er Quartier" },
  { key: "waxing_gibbous", emoji: "🌔", label: "Gibbeuse +" },
  { key: "full_moon", emoji: "🌕", label: "Pleine Lune" },
  { key: "waning_gibbous", emoji: "🌖", label: "Gibbeuse -" },
  { key: "last_quarter", emoji: "🌗", label: "Der. Quartier" },
  { key: "waning_crescent", emoji: "🌘", label: "Décroissant" },
];

export default function Statistics() {
  const { t } = useTranslation();
  const today = new Date();
  const entries = getMonthEntries(today.getFullYear(), today.getMonth());

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center text-white/50">
        <p className="text-xl">{t("noDataYet")}</p>
        <p className="text-sm">{t("startLoggingMoods")}</p>
      </div>
    );
  }

  const phaseData = PHASES.map((p) => {
    const phaseEntries = entries.filter((e) => e.moonPhase === p.key);
    if (!phaseEntries.length)
      return { name: p.emoji, emotion: 0, energy: 0, conso: 0 };

    const avg = (key: "emotion" | "energy" | "consumption") => {
      const vals = phaseEntries.flatMap((e) =>
        Object.values(e.moments)
          .map((m) => (m as any)?.[key] ?? null)
          .filter((v): v is number => v !== null),
      );
      return vals.length
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : 0;
    };

    return {
      name: p.emoji,
      emotion: avg("emotion"),
      energy: avg("energy"),
      conso: avg("consumption"),
    };
  });

  return (
    <div className="p-4 text-white">
      <h1 className="mb-1 text-2xl font-bold">{t("statistics")}</h1>
      <p className="mb-6 text-white/50">
        {entries.length} {t("entriesThisMonth")}
      </p>

      <div className="mb-4 rounded-2xl border border-white/8 bg-bg-surface p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <p className="mb-4 text-sm text-white/70">{t("emotionByPhase")}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={phaseData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 14 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              domain={[0, 5]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Bar dataKey="emotion" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-white/8 bg-bg-surface p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <p className="mb-4 text-sm text-white/70">{t("energyByPhase")}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={phaseData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 14 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              domain={[0, 5]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Bar dataKey="energy" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
