import type { MoonPhase } from "@/data/day-entry.types";
import {
  FirstQuarter,
  FullMoon,
  NewMoon,
  ThirdQuarter,
  WaningCrescent,
  WaningGibbous,
  WaxingCrescent,
  WaxingGibbous,
  type MoonPhaseIconComponent,
} from "@/components/moon-phases";

const phaseIconMap: Record<MoonPhase, MoonPhaseIconComponent> = {
  new_moon: NewMoon,
  waxing_crescent: WaxingCrescent,
  first_quarter: FirstQuarter,
  waxing_gibbous: WaxingGibbous,
  full_moon: FullMoon,
  waning_gibbous: WaningGibbous,
  last_quarter: ThirdQuarter,
  waning_crescent: WaningCrescent,
};

export function getMoonPhaseIcon(phase: string): MoonPhaseIconComponent {
  return phaseIconMap[phase as MoonPhase] ?? NewMoon;
}
