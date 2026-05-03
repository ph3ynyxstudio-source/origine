import { useState, type CSSProperties } from "react";
import { useTranslation } from "@/lib/i18n";

import { getDayEntry, saveDayEntry } from "../data/storage";
import { getMoonPhase } from "../data/moon";
import { parseLocalDate } from "../data/calendar";
import type {
  MomentKey,
  MetricValue,
  DayEntry,
  NormalizedSignal,
} from "../data/day-entry.types";

type Props = {
  date: string;
  onClose: () => void;
};

const MOMENTS: MomentKey[] = ["morning", "midday", "evening"];

export function MoodDialog({ date, onClose }: Props) {
  const { t } = useTranslation();

  const existing = getDayEntry(date);

  const [activeMoment, setActiveMoment] = useState<MomentKey>("morning");
  const [moments, setMoments] = useState(existing?.moments ?? {});
  const [note, setNote] = useState(existing?.note ?? "");

  const current = moments[activeMoment] ?? {
    emotion: null,
    energy: null,
    consumption: null,
  };

  function setMetric(key: keyof typeof current, value: MetricValue) {
    setMoments((prev) => ({
      ...prev,
      [activeMoment]: {
        ...(prev[activeMoment] ?? {}),
        ...current,
        [key]: value,
      },
    }));
  }

  // 🔥 NORMALIZATION SIMPLE (TON SYSTÈME MVP)
  function normalizeNote(note: string): NormalizedSignal[] {
    const normalized: NormalizedSignal[] = [];

    const lower = note.toLowerCase();

    if (lower.includes("café")) normalized.push("caffeine");
    if (lower.includes("coffee")) normalized.push("caffeine");

    if (lower.includes("sucre")) normalized.push("sugar");
    if (lower.includes("gâteau")) normalized.push("sugar");
    if (lower.includes("cake")) normalized.push("sugar");

    return normalized;
  }

  function handleSave() {
    const normalized = normalizeNote(note);

    const entry: DayEntry = {
      date,
      moonPhase: existing?.moonPhase ?? getMoonPhase(parseLocalDate(date)),
      note,
      moments,
      normalized, // 🔥 ajouté
      updatedAt: Date.now(),
    };

    saveDayEntry(entry);
    onClose();
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <h2>{date}</h2>
          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        {/* MOMENTS */}
        <div style={row}>
          {MOMENTS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMoment(m)}
              style={{
                ...pill,
                background:
                  activeMoment === m ? "#7c3aed" : "rgba(255,255,255,0.1)",
              }}>
              {t(m)}
            </button>
          ))}
        </div>

        {/* EMOTION */}
        <div style={section}>
          <label>{t("emotion")}</label>

          <input
            type="range"
            min="0"
            max="100"
            value={current.emotion ?? 50}
            onChange={(e) =>
              setMetric("emotion", Number(e.target.value) as MetricValue)
            }
            style={slider}
          />

          <strong>{current.emotion ?? 50}%</strong>
        </div>

        {/* ENERGY */}
        <div style={section}>
          <label>{t("energy")}</label>

          <input
            type="range"
            min="0"
            max="100"
            value={current.energy ?? 50}
            onChange={(e) =>
              setMetric("energy", Number(e.target.value) as MetricValue)
            }
            style={slider}
          />

          <strong>{current.energy ?? 50}%</strong>
        </div>

        {/* CONSUMPTION */}
        <div style={section}>
          <label>{t("consumption")}</label>

          <input
            type="range"
            min="0"
            max="100"
            value={current.consumption ?? 50}
            onChange={(e) =>
              setMetric("consumption", Number(e.target.value) as MetricValue)
            }
            style={slider}
          />

          <strong>{current.consumption ?? 50}%</strong>
        </div>

        {/* NOTE */}
        <div style={section}>
          <label>{t("note")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={textarea}
          />
        </div>

        {/* ACTIONS */}
        <div style={row}>
          <button onClick={onClose} style={btnSecondary}>
            {t("cancel")}
          </button>

          <button onClick={handleSave} style={btnPrimary}>
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* styles (inchangés) */
const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const modal: CSSProperties = {
  width: "90%",
  maxWidth: "400px",
  maxHeight: "85vh",
  overflowY: "auto",
  background: "#1a1a2e",
  borderRadius: "16px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};
const header: CSSProperties = { display: "flex", justifyContent: "space-between" };
const row: CSSProperties = { display: "flex", gap: "8px" };
const section: CSSProperties = { display: "flex", flexDirection: "column", gap: "8px" };
const pill: CSSProperties = {
  flex: 1,
  padding: "8px",
  borderRadius: "8px",
  border: "none",
  color: "white",
};
const slider: CSSProperties = { width: "100%", cursor: "pointer" };
const textarea: CSSProperties = { width: "100%", padding: "8px", borderRadius: "8px" };
const btnPrimary: CSSProperties = {
  flex: 1,
  background: "#7c3aed",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  color: "white",
};
const btnSecondary: CSSProperties = {
  flex: 1,
  background: "rgba(255,255,255,0.1)",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  color: "white",
};
const closeBtn: CSSProperties = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "20px",
};
