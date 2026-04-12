import { MoonPhase, MomentEntry } from "../../data/day-entry.types";

export type DayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  moonPhase: MoonPhase;
  moments?: {
    morning?: MomentEntry;
    midday?: MomentEntry;
    evening?: MomentEntry;
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

function hasMomentEntry(moment?: MomentEntry): boolean {
  if (!moment) return false;

  return (
    moment.emotion !== null ||
    moment.energy !== null ||
    moment.consumption !== null
  );
}

function getPresenceDotColor(hasEntry: boolean): string {
  return hasEntry ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)";
}

export function DayCell({
  date,
  isCurrentMonth,
  moonPhase,
  moments,
  onOpen,
}: DayCellProps) {
  const morningFilled = hasMomentEntry(moments?.morning);
  const middayFilled = hasMomentEntry(moments?.midday);
  const eveningFilled = hasMomentEntry(moments?.evening);

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

      <div style={{ display: "flex", gap: "3px" }}>
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: getPresenceDotColor(morningFilled),
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: getPresenceDotColor(middayFilled),
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: getPresenceDotColor(eveningFilled),
          }}
        />
      </div>
    </div>
  );
}
