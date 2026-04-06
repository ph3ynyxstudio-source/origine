import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getMoonPhase } from "../data/moon";
import { getDayEntry } from "../data/storage";
import { formatDate } from "../data/calendar";

const MOON_EMOJIS: Record<string, string> = {
  new_moon: "🌑",
  waxing_crescent: "🌒",
  first_quarter: "🌓",
  waxing_gibbous: "🌔",
  full_moon: "🌕",
  waning_gibbous: "🌖",
  last_quarter: "🌗",
  waning_crescent: "🌘",
};

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

export default function Dashboard() {
  const { language } = useTranslation();
  const today = new Date();
  const dateStr = formatDate(today);
  const moonPhase = getMoonPhase(today);
  const entry = getDayEntry(dateStr);

  const periods = [
    { key: "morning", label: "Matin", color: "#f59e0b" },
    { key: "midday", label: "Midi", color: "#60a5fa" },
    { key: "evening", label: "Soir", color: "#a78bfa" },
  ];

  return (
    <AppLayout>
      <div style={{ padding: "16px", color: "white" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}
        >
          Bonjour 🌙
        </h1>
        <p style={{ opacity: 0.6, marginBottom: "24px" }}>
          {format(today, "EEEE, d MMMM", {
            locale: language === "fr" ? fr : undefined,
          })}
        </p>

        {/* Phase lunaire */}
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "64px" }}>{MOON_EMOJIS[moonPhase]}</span>
          <p
            style={{
              fontSize: "11px",
              opacity: 0.6,
              letterSpacing: "2px",
              marginTop: "8px",
            }}
          >
            PHASE ACTUELLE
          </p>
          <p style={{ fontSize: "22px", fontWeight: "bold", marginTop: "4px" }}>
            {PHASE_LABELS[moonPhase]}
          </p>
        </div>

        {/* Aujourd'hui */}
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "12px" }}>
            L'ORBITE D'AUJOURD'HUI
          </p>
          {periods.map((p) => {
            const moment =
              entry?.moments?.[p.key as "morning" | "midday" | "evening"];
            return (
              <div
                key={p.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: p.color,
                    }}
                  />
                  <span>{p.label}</span>
                </div>
                <span style={{ opacity: 0.5, fontSize: "13px" }}>
                  {moment ? `😊 ${moment.emotion ?? "-"}` : "Non enregistré"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
