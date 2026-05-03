import type { JSX, ReactNode } from "react";

type MoonPhaseIconProps = {
  className?: string;
};

type BaseMoonProps = MoonPhaseIconProps & {
  children?: ReactNode;
};

function BaseMoon({ className, children }: BaseMoonProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true">
      <defs>
        <filter
          id="moon-neon-glow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%">
          <feGaussianBlur stdDeviation="1.52" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient
          id="moon-crystal-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%">
          <stop offset="0%" stopColor="#7EEBFF" />
          <stop offset="50%" stopColor="#7EEBFF" />
          <stop offset="50%" stopColor="#B78CFF" />
          <stop offset="100%" stopColor="#B78CFF" />
        </linearGradient>
      </defs>

      <g filter="url(#moon-neon-glow)">
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="url(#moon-crystal-gradient)"
          stroke="currentColor"
          strokeWidth="1.2"
          style={{ opacity: 0.8 }}
        />
        {children}
      </g>
    </svg>
  );
}

export function NewMoon({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <circle cx="12" cy="12" r="7" fill="currentColor" fillOpacity="0.1" />
    </BaseMoon>
  );
}

export function WaxingCrescent({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <path
        d="M12 5a7 7 0 1 0 0 14c-1.5-1.7-2.2-4.1-2.2-7s.7-5.3 2.2-7Z"
        fill="currentColor"
      />
    </BaseMoon>
  );
}

export function FirstQuarter({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <path d="M12 5a7 7 0 0 0 0 14V5Z" fill="currentColor" />
    </BaseMoon>
  );
}

export function WaxingGibbous({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <path
        d="M12 5a7 7 0 1 0 0 14c2-1.7 3.2-4.1 3.2-7s-1.2-5.3-3.2-7Z"
        fill="currentColor"
      />
      <ellipse cx="10.1" cy="12" rx="4.8" ry="7" fill="currentColor" />
    </BaseMoon>
  );
}

export function FullMoon({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <circle cx="12" cy="12" r="7" fill="currentColor" />
    </BaseMoon>
  );
}

export function WaningGibbous({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <path
        d="M12 5a7 7 0 1 1 0 14c-2-1.7-3.2-4.1-3.2-7s1.2-5.3 3.2-7Z"
        fill="currentColor"
      />
      <ellipse cx="13.9" cy="12" rx="4.8" ry="7" fill="currentColor" />
    </BaseMoon>
  );
}

export function ThirdQuarter({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <path d="M12 5a7 7 0 0 1 0 14V5Z" fill="currentColor" />
    </BaseMoon>
  );
}

export function WaningCrescent({ className }: MoonPhaseIconProps) {
  return (
    <BaseMoon className={className}>
      <path
        d="M12 5a7 7 0 1 1 0 14c1.5-1.7 2.2-4.1 2.2-7s-.7-5.3-2.2-7Z"
        fill="currentColor"
      />
    </BaseMoon>
  );
}

export type MoonPhaseIconComponent = (props: MoonPhaseIconProps) => JSX.Element;
export type { MoonPhaseIconProps };
