import { useState } from "react";
import { getDayEntry, saveDayEntry } from "../data/storage";
import { getMoonPhase } from "../data/moon";
import type { MomentKey, MetricValue, DayEntry } from "../data/day-entry.types";

type Props = {
  date: string;
  onClose: () => void;
};

const MOMENTS: MomentKey[] = ["morning", "midday", "evening"];

const MOMENT_LABELS: Record<MomentKey, string> = {
  morning: "Matin",
  midday: "Midi",
  evening: "Soir",
};

function metricLabel(value: number): string {
  return `${value * 20}%`;
}
function metricToPercent(value: number | null): number {
  if (value === null) return 0;
  return value * 20;
}

function percentToMetric(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 20) return 1;
  if (value <= 40) return 2;
  if (value <= 60) return 3;
  if (value <= 80) return 4;
  return 5;
}

const newLocal = "}";
export function MoodDialog({ date, onClose }: Props) {
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
      [activeMoment]: { ...current, [key]: value },
    }));
  }

  function handleSave() {
    const entry: DayEntry = {
      date,
      moonPhase: existing?.moonPhase ?? getMoonPhase(new Date(date)),
      note,
      moments,
      updatedAt: Date.now(),
    };

    saveDayEntry(entry);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        padding: "16px",
        boxSizing: "border-box",
      }}>
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "16px",
          padding: "28px",
          boxSizing: "border-box",
          width: "90%",
          maxWidth: "400px",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "white",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}>
          <h2 style={{ fontSize: "18px", margin: 0 }}>{date}</h2>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
            }}>
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {MOMENTS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMoment(m)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background:
                  activeMoment === m ? "#7c3aed" : "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: activeMoment === m ? "bold" : "normal",
              }}>
              {MOMENT_LABELS[m]}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Émotion</p>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px", opacity: 0.7 }}>Émotion</p>

            <input
              type="range"
              min="0"
              max="100"
              value={current.emotion !== null ? current.emotion * 25 : 50}
              onChange={(e) =>
                setMetric(
                  "emotion",
                  Math.round(Number(e.target.value) / 25) as MetricValue,
                )
              }
              style={{
                width: "100%",
                accentColor: "#7EEBFF",
                cursor: "pointer",
              }}
            />

            <p style={{ marginTop: "8px", fontWeight: "bold", color: "white" }}>
              {current.emotion !== null ? current.emotion * 25 : 50}%
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Énergie</p>

          <input
            type="range"
            min="20"
            max="100"
            step="20"
            value={metricToPercent(current.energy)}
            onChange={(e) =>
              setMetric("energy", percentToMetric(Number(e.target.value)))
            }
            style={{
              width: "100%",
              accentColor: "#7EEBFF",
              cursor: "pointer",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              fontSize: "12px",
              opacity: 0.7,
            }}>
            <span>20%</span>
            <span>60%</span>
            <span>100%</span>
          </div>

          <p style={{ marginTop: "8px", fontWeight: "bold" }}>
            {current.energy !== null
              ? `${metricToPercent(current.energy)}%`
              : "--"}
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Consommation</p>

          <input
            type="range"
            min="20"
            max="100"
            step="20"
            value={metricToPercent(current.consumption)}
            onChange={(e) =>
              setMetric("consumption", percentToMetric(Number(e.target.value)))
            }
            style={{
              width: "100%",
              accentColor: "#B78CFF",
              cursor: "pointer",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              fontSize: "12px",
              opacity: 0.7,
            }}>
            <span>20%</span>
            <span>60%</span>
            <span>100%</span>
          </div>

          <p style={{ marginTop: "8px", fontWeight: "bold" }}>
            {current.consumption !== null
              ? `${metricToPercent(current.consumption)}%`
              : "--"}
          </p>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Note</p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="..."
            style={{
              width: "100%",
              borderRadius: "8px",
              padding: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              resize: "none",
              height: "60px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}>
            Annuler
          </button>

          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              background: "#7c3aed",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
