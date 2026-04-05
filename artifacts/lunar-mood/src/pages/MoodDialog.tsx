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
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "16px",
          padding: "24px",
          width: "90%",
          maxWidth: "400px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "18px" }}>{date}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs moments */}
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
              }}
            >
              {MOMENT_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Émotion */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Émotion</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {([1, 2, 3, 4, 5] as MetricValue[]).map((v) => (
              <button
                key={v}
                onClick={() => setMetric("emotion", v)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor:
                    current.emotion === v ? "#a78bfa" : "transparent",
                  background:
                    current.emotion === v
                      ? "rgba(167,139,250,0.2)"
                      : "rgba(255,255,255,0.05)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {["😞", "😕", "😐", "🙂", "😊"][v! - 1]}
              </button>
            ))}
          </div>
        </div>

        {/* Énergie */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Énergie</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {([1, 2, 3, 4, 5] as MetricValue[]).map((v) => (
              <button
                key={v}
                onClick={() => setMetric("energy", v)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: current.energy === v ? "#60a5fa" : "transparent",
                  background:
                    current.energy === v
                      ? "rgba(96,165,250,0.2)"
                      : "rgba(255,255,255,0.05)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Consommation */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px", opacity: 0.7 }}>Consommation</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {([1, 2, 3, 4, 5] as MetricValue[]).map((v) => (
              <button
                key={v}
                onClick={() => setMetric("consumption", v)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor:
                    current.consumption === v ? "#f472b6" : "transparent",
                  background:
                    current.consumption === v
                      ? "rgba(244,114,182,0.2)"
                      : "rgba(255,255,255,0.05)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
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
            }}
          />
        </div>

        {/* Actions */}
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
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "8px",
              background: "#7c3aed",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
