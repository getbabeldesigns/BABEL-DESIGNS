import type { LucideIcon } from "lucide-react";
import type { AccentRole } from "@/lib/statusColors";

const TEXT: Record<AccentRole, string> = {
  neutral: "text-accent-neutral",
  progress: "text-accent-progress",
  caution: "text-accent-caution",
  success: "text-accent-success",
  critical: "text-destructive",
};

const BG_SOFT: Record<AccentRole, string> = {
  neutral: "bg-accent-neutral/10",
  progress: "bg-accent-progress/10",
  caution: "bg-accent-caution/10",
  success: "bg-accent-success/10",
  critical: "bg-destructive/10",
};

// The rounded, icon-badge stat card used across Overview/Sales, replacing
// the old thin-border stat tiles. One card = one number; the icon badge
// carries the accent color so the number itself can stay in ink (per the
// dataviz skill: "text never wears the data color" — the colored badge is
// the mark, the number is a label).
const IconStatCard = ({ icon: Icon, label, value, role }: { icon: LucideIcon; label: string; value: number | string; role: AccentRole }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${BG_SOFT[role]}`}>
        <Icon size={18} strokeWidth={1.75} className={TEXT[role]} />
      </div>
      <p className="text-2xl font-serif">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
};

export default IconStatCard;
