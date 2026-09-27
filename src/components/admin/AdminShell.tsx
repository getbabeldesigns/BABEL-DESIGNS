import type { ReactNode } from "react";
import { LayoutGrid, LogOut, TrendingUp, Briefcase } from "lucide-react";

export type AdminTab = "overview" | "sales" | "execution";

const NAV_ITEMS: { value: AdminTab; label: string; icon: typeof LayoutGrid }[] = [
  { value: "overview", label: "Overview", icon: LayoutGrid },
  { value: "sales", label: "Sales", icon: TrendingUp },
  { value: "execution", label: "Execution", icon: Briefcase },
];

const initialsFrom = (email: string) => email.slice(0, 2).toUpperCase();

// The admin shell: a dark icon sidebar + a light content pane with a
// greeting header, replacing the old flat top-tab-bar layout. Kept as its
// own component (rather than inlined in Admin.tsx) so the chrome — sidebar,
// header, tab switching — stays separate from the data-fetching and
// mutation logic that still lives in Admin.tsx.
const AdminShell = ({
  tab,
  onTabChange,
  userEmail,
  onSignOut,
  children,
}: {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  userEmail: string;
  onSignOut: () => void;
  children: ReactNode;
}) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center justify-between bg-[hsl(var(--charcoal))] py-8 md:flex">
        <div className="flex flex-col items-center gap-2">
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--clay))] font-serif text-lg text-[hsl(var(--charcoal))]">
            B
          </div>
          {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              title={label}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                tab === value
                  ? "bg-[hsl(var(--sand))] text-[hsl(var(--charcoal))]"
                  : "text-[hsl(var(--sand))]/60 hover:bg-white/5 hover:text-[hsl(var(--sand))]"
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
            </button>
          ))}
        </div>
        <button
          onClick={onSignOut}
          title="Sign out"
          className="flex h-12 w-12 items-center justify-center rounded-xl text-[hsl(var(--sand))]/60 transition-colors hover:bg-white/5 hover:text-[hsl(var(--sand))]"
        >
          <LogOut size={20} strokeWidth={1.75} />
        </button>
      </aside>

      {/* Content */}
      <div className="flex-1">
        {/* Mobile tab bar (sidebar is hidden below md) */}
        <div className="flex items-center gap-1 border-b border-border bg-card px-4 py-3 md:hidden">
          {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] uppercase tracking-[0.15em] ${
                tab === value ? "bg-[hsl(var(--sand))]/40 text-[hsl(var(--wood))]" : "text-muted-foreground"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-6 md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {NAV_ITEMS.find((n) => n.value === tab)?.label}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{userEmail}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--sand))] text-xs font-medium text-[hsl(var(--charcoal))]">
              {initialsFrom(userEmail)}
            </div>
          </div>
        </div>

        <div className="px-6 pb-16 md:px-10">{children}</div>
      </div>
    </div>
  );
};

export default AdminShell;
