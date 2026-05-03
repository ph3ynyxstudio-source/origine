import { AppLayout } from "@/components/layout/AppLayout";
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
      <AppLayout>
        <div
          style={{
            padding: "32px",
            color: "white",
            textAlign: "center",
            opacity: 0.5,
          }}
        >
          <p style={{ fontSize: "20px" }}>{t("noDataYet")}</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            {t("startLoggingMoods")}
          </p>
        </div>
      </AppLayout>
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
    <AppLayout>
      <div style={{ padding: "16px", color: "white" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}
        >
          {t("statistics")}
        </h1>
        <p style={{ opacity: 0.5, marginBottom: "24px" }}>
          {entries.length} {t("entriesThisMonth")}
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <p style={{ marginBottom: "16px", opacity: 0.7 }}>
            {t("emotionByPhase")}
          </p>
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

        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <p style={{ marginBottom: "16px", opacity: 0.7 }}>
            {t("energyByPhase")}
          </p>
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
    </AppLayout>
  );
}
