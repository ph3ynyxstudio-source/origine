import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getMoonPhase } from "../data/moon";
import { getDayEntry } from "../data/storage";
import { formatDate } from "../data/calendar";
import { getMoonPhaseIcon } from "@/components/getMoonPhaseIcon";
import { analyzeHistory } from "@/core/crystaph3y/engine";

type MetricKey = "emotion" | "energy" | "consumption";

const PHASE_LABELS: Record<string, string> = {
  new_moon: "Nouvelle Lune",
  waxing_crescent: "Croissant Naissant",
  first_quarter: "Premier Quartier",
  waxing_gibbous: "Gibbeuse Croissante",
  full_moon: "Pleine Lune",
  waning_gibbous: "Gibbeuse Décroissante",
  last_quarter: "Dernier Quartier",
  waning_crescent: "Croissant Décroissant",
};

function metricToPercent(value: number | null): number {
  if (value === null) return 0;
  return value * 20;
}

function getAverageMetric(
  entry: ReturnType<typeof getDayEntry>,
  key: MetricKey,
): number | null {
  if (!entry) return null;

  const values = Object.values(entry.moments)
    .map((moment) => moment?.[key] ?? null)
    .filter((value) => value !== null) as number[];

  if (!values.length) return null;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  ) as 1 | 2 | 3 | 4 | 5;
}

function getEmotionLabel(value: number | null): string {
  if (value === null) return "Non enregistré";
  if (value <= 1) return "Très bas";
  if (value <= 2) return "Bas";
  if (value <= 3) return "Stable";
  if (value <= 4) return "Bien";
  return "Très bien";
}

function getEnergyLabel(value: number | null): string {
  if (value === null) return "Non enregistré";
  if (value <= 1) return "Très faible";
  if (value <= 2) return "Faible";
  if (value <= 3) return "Douce";
  if (value <= 4) return "Bonne";
  return "Élevée";
}

const cardStyle: React.CSSProperties = {
  background: "rgba(26,35,74,0.12)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(126,235,255,0.08)",
  borderRadius: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
};

const progressTrackStyle: React.CSSProperties = {
  width: "100%",
  height: "10px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
  marginTop: "12px",
};

export default function Dashboard() {
  const { language } = useTranslation();
  const today = new Date();
  const dateStr = formatDate(today);
  const moonPhase = getMoonPhase(today);
  const entry = getDayEntry(dateStr);

  const MoonIcon = getMoonPhaseIcon(moonPhase);

  const emotionValue = getAverageMetric(entry, "emotion");
  const energyValue = getAverageMetric(entry, "energy");
  // 🧠 crystaph3y (version simple)
  const result = analyzeHistory(
    entry
      ? [
          {
            date: dateStr,
            mood: emotionValue ? emotionValue * 20 : 50,
            consumption: 2,
            tags: [],
          },
        ]
      : [],
    {
      mood: emotionValue ? emotionValue * 20 : 50,
      consumption: 2,
      tags: [],
      date: dateStr,
    },
  );

  const emotionLabel = getEmotionLabel(emotionValue);
  const energyLabel = getEnergyLabel(energyValue);

  return (
    <AppLayout>
      <div style={{ padding: "16px", color: "#EAF4FF" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}>
          Bonjour
        </h1>

        <p style={{ opacity: 0.6, marginBottom: "24px" }}>
          {format(today, "EEEE, d MMMM", {
            locale: language === "fr" ? fr : undefined,
          })}
        </p>

        <div
          style={{
            ...cardStyle,
            padding: "24px",
            textAlign: "center",
            marginBottom: "16px",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "8px",
              filter: "drop-shadow(0 0 4px rgba(126, 235, 255, 0.001))",
            }}>
            <MoonIcon className="w-20 h-20 text-[#ddebfa75]" />
          </div>

          <p
            style={{
              fontSize: "11px",
              opacity: 0.6,
              letterSpacing: "2px",
              marginTop: "8px",
              marginBottom: "4px",
            }}>
            PHASE ACTUELLE
          </p>

          <p
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginTop: "4px",
            }}>
            {PHASE_LABELS[moonPhase]}
          </p>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: "20px",
            marginBottom: "16px",
          }}>
          <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "6px" }}>
            HUMEUR DU JOUR
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
            {emotionValue !== null ? `${metricToPercent(emotionValue)}%` : "--"}
          </p>
          <p style={{ opacity: 0.7, marginTop: "4px", marginBottom: 0 }}>
            {emotionLabel}
          </p>

          <div style={progressTrackStyle}>
            <div
              style={{
                width: `${metricToPercent(emotionValue)}%`,
                height: "100%",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: "20px",
            marginBottom: "16px",
          }}>
          <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "6px" }}>
            ÉNERGIE
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
            {energyValue !== null ? `${metricToPercent(energyValue)}%` : "--"}
          </p>
          <p style={{ opacity: 0.7, marginTop: "4px", marginBottom: 0 }}>
            {energyLabel}
          </p>

          <div style={progressTrackStyle}>
            <div
              style={{
                width: `${metricToPercent(energyValue)}%`,
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #7EEBFF 0%, #B78CFF 100%)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: "20px",
          }}>
          <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "10px" }}>
            INSIGHT
          </p>
          <p
            style={{
              margin: 0,
              lineHeight: 1.6,
              color: "rgba(234,244,255,0.88)",
            }}>
            {result.insight}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
