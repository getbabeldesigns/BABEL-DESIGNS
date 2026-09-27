import type { AccentRole } from "@/lib/statusColors";

const ROLE_VAR: Record<AccentRole, string> = {
  neutral: "--accent-neutral",
  progress: "--accent-progress",
  caution: "--accent-caution",
  success: "--accent-success",
  critical: "--destructive",
};

// A single-ratio "meter" (see the dataviz skill's Figures contract): the
// fill carries the value, the unfilled track is the same hue at low opacity
// so state still reads as one ramp. Used for things like "% of leads
// converted" or "% of orders paid" — one number, not a multi-series chart,
// so no legend is needed (the label beneath says what it is).
const RatioRing = ({
  value,
  total,
  label,
  role,
  size = 120,
}: {
  value: number;
  total: number;
  label: string;
  role: AccentRole;
  size?: number;
}) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const colorVar = `hsl(var(${ROLE_VAR[role]}))`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorVar}
            strokeOpacity={0.15}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorVar}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 600ms ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold">{pct}%</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
};

export default RatioRing;
