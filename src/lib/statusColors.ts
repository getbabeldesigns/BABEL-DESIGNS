// Shared muted accent-color roles for the admin dashboard (project stages,
// lead status, and generic stat tiles). Deliberately five roles, not a
// distinct hue per stage — 11 project stages would be unreadable as 11
// colors, so they group into the same "where does this stand" bands a
// person already reads a status by: not started yet, actively moving,
// needs attention, done, or dead. Every use pairs the color with a text
// label (the stage/status name itself), so color is never the only signal.
//
// IMPORTANT: every class name below is written out as a complete, literal
// string in a lookup table (never assembled with `${role}` at the Tailwind
// class position) — Tailwind's build-time scanner finds classes by regex
// over the raw source text, not by executing this code, so a
// template-interpolated class name like `text-accent-${role}` would never
// actually get generated in the shipped CSS.
export type AccentRole = "neutral" | "progress" | "caution" | "success" | "critical";

const TEXT: Record<AccentRole, string> = {
  neutral: "text-accent-neutral",
  progress: "text-accent-progress",
  caution: "text-accent-caution",
  success: "text-accent-success",
  critical: "text-destructive",
};

const BORDER_40: Record<AccentRole, string> = {
  neutral: "border-accent-neutral/40",
  progress: "border-accent-progress/40",
  caution: "border-accent-caution/40",
  success: "border-accent-success/40",
  critical: "border-destructive/40",
};

const TOP_BAR: Record<AccentRole, string> = {
  neutral: "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:content-[''] before:bg-accent-neutral",
  progress: "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:content-[''] before:bg-accent-progress",
  caution: "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:content-[''] before:bg-accent-caution",
  success: "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:content-[''] before:bg-accent-success",
  critical: "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:content-[''] before:bg-destructive",
};

export const accentText = (role: AccentRole) => TEXT[role];
export const accentBorder = (role: AccentRole) => BORDER_40[role];
// A 3px top accent bar for a stat tile — combine with "relative overflow-hidden"
// on the tile's own container.
export const accentTopBar = (role: AccentRole) => TOP_BAR[role];

export const projectStageAccent = (stage: string): AccentRole => {
  switch (stage) {
    case "just_started":
    case "planning":
      return "neutral";
    case "executed":
    case "production":
    case "near_completing":
      return "progress";
    case "on_hold":
    case "settlement_pending":
    case "retention_pending":
    case "jms_pending":
      return "caution";
    case "settled_closed":
      return "success";
    case "cancelled":
      return "critical";
    default:
      return "neutral";
  }
};

export const leadStatusAccent = (status: "open" | "converted" | "lost"): AccentRole => {
  if (status === "converted") return "success";
  if (status === "lost") return "critical";
  return "progress";
};
