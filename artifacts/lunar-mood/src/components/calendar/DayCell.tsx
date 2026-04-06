import { MoonPhase, MetricValue } from "../../data/day-entry.types";

export type DayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  moonPhase: MoonPhase;
  indicators: {
    emotion: MetricValue;
    energy: MetricValue;
    consumption: MetricValue;
  };
  onOpen: () => void;
};

function getMoonEmoji(phase: MoonPhase): string {
  const map: Record<MoonPhase, string> = {
    new_moon: "🌑",
    waxing_crescent: "🌒",
    first_quarter: "🌓",
    waxing_gibbous: "🌔",
    full_moon: "🌕",
    waning_gibbous: "🌖",
    last_quarter: "🌗",
    waning_crescent: "🌘",
  };
  return map[phase];
}

function getDotColor(value: MetricValue): string {
  if (!value) return "#333";
  if (value >= 4) return "#a78bfa";
  if (value >= 2) return "#60a5fa";
  return "#f87171";
}

export function DayCell({
  date,
  isCurrentMonth,
  moonPhase,
  indicators,
  onOpen,
}: DayCellProps) {
  return (
    <div
      onClick={onOpen}
      style={{
        opacity: isCurrentMonth ? 1 : 0.3,
        cursor: "pointer",
        padding: "6px 4px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        background: "rgba(255, 255, 255, 0.07)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        minHeight: "60px",
        justifyContent: "space-between",
      }}
    >
      <div>{date.getDate()}</div>
      <div>{getMoonEmoji(moonPhase)}</div>
      <div style={{ display: "flex", gap: "2px" }}>
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: getDotColor(indicators.emotion),
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: getDotColor(indicators.energy),
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: getDotColor(indicators.consumption),
          }}
        />
      </div>
    </div>
  );
}
