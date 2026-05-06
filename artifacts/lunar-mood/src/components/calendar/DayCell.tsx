import { MoonPhase, MomentEntry } from "../../data/day-entry.types";
import { MOON_PHASE_EMOJI_ASSETS } from "./moonPhaseEmojiAssets";

export type DayCellProps = {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  moonPhase: MoonPhase;
  moments?: {
    morning?: MomentEntry;
    midday?: MomentEntry;
    evening?: MomentEntry;
  };
  onOpen: () => void;
};

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

function shouldShowCalendarMoon(phase: MoonPhase): boolean {
  return phase === "new_moon" || phase === "full_moon";
}

export function DayCell({
  date,
  isSelected,
  isToday,
  isCurrentMonth,
  moonPhase,
  moments,
  onOpen,
}: DayCellProps) {
  const morningFilled = hasMomentEntry(moments?.morning);
  const middayFilled = hasMomentEntry(moments?.midday);
  const eveningFilled = hasMomentEntry(moments?.evening);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex min-h-16 cursor-pointer flex-col items-center justify-between gap-1 rounded-xl border bg-bg-surface p-1.5 text-(--text-primary) transition-colors hover:border-primary/25 hover:bg-white/[0.06] ${
        isSelected
          ? "border-cyan-200/45 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,0.24)]"
          : isToday
          ? "border-cyan-300/35 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
          : "border-white/8 shadow-[0_0_18px_rgba(0,0,0,0.28)]"
      } ${
        isCurrentMonth ? "opacity-100" : "opacity-30"
      }`}>
      <span
        className={`text-xs font-medium ${
          isSelected || isToday ? "text-(--color-primary)" : ""
        }`}>
        {date.getDate()}
      </span>
      {shouldShowCalendarMoon(moonPhase) ? (
        <img
          src={MOON_PHASE_EMOJI_ASSETS[moonPhase]}
          alt={moonPhase}
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
          decoding="async"
        />
      ) : (
        <div className="h-5 w-5" aria-hidden="true" />
      )}

      <div className="flex gap-1">
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
    </button>
  );
}
