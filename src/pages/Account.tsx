import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Compass, LogOut, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, signOutUser } from "@/integrations/supabase/auth";

const initialsFrom = (user: User | null) => {
  const metadataName = (user?.user_metadata?.full_name as string | undefined) || (user?.user_metadata?.name as string | undefined);
  const source = metadataName || user?.email || "";
  if (!source) return "BD";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!mounted) return;
        if (!currentUser) {
          navigate("/auth");
          return;
        }
        setUser(currentUser);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load account";
        toast.error(message);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const accountImage = useMemo(() => (user?.user_metadata?.avatar_url as string | undefined) ?? null, [user]);
  const accountName = useMemo(() => {
    return (user?.user_metadata?.full_name as string | undefined) || (user?.user_metadata?.name as string | undefined) || "Babel Collector";
  }, [user]);

  const joinedDate = useMemo(() => {
    if (!user?.created_at) return "Recently";
    return new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [user]);

  const onSignOut = async () => {
    await signOutUser();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <div className="h-12 w-72 animate-pulse bg-muted" />
          </div>
        </section>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-8 md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-border/60" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Babel Account Atelier</p>
            <h1 className="font-serif text-4xl font-light md:text-6xl">Your Design Identity</h1>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground">
              A personal command center for your taste profile, saved journeys, and collection discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-[2rem] border border-border/70 bg-card/70 p-8 backdrop-blur-sm">
              <div className="relative mx-auto mb-6 w-fit">
                <div className="pointer-events-none absolute -inset-4 rounded-full border border-border/50" />
                <Avatar className="h-32 w-32 border border-border/70 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)]">
                  <AvatarImage src={accountImage ?? undefined} alt={user.email ?? "Account avatar"} />
                  <AvatarFallback className="text-2xl font-serif">{initialsFrom(user)}</AvatarFallback>
                </Avatar>
              </div>

              <p className="text-center font-serif text-2xl leading-tight">{accountName}</p>
              <p className="mb-6 text-center font-sans text-sm text-muted-foreground">{user.email}</p>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="border border-border/60 bg-background/60 p-3 text-center">
                  <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Member Since</p>
                  <p className="mt-1 font-serif text-sm">{joinedDate}</p>
                </div>
                <div className="border border-border/60 bg-background/60 p-3 text-center">
                  <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <p className="mt-1 font-serif text-sm">Active</p>
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="flex w-full items-center justify-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </aside>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="group rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm transition-transform hover:-translate-y-1">
                  <Sparkles className="mb-4 h-5 w-5 text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Aesthetic Pulse</p>
                  <p className="mt-2 font-serif text-xl">Quiet Luxury</p>
                </div>
                <div className="group rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm transition-transform hover:-translate-y-1">
                  <Palette className="mb-4 h-5 w-5 text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Material Tone</p>
                  <p className="mt-2 font-serif text-xl">Stone / Timber</p>
                </div>
                <div className="group rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm transition-transform hover:-translate-y-1">
                  <ShieldCheck className="mb-4 h-5 w-5 text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Account Security</p>
                  <p className="mt-2 font-serif text-xl">Provider Verified</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card/70 p-8 backdrop-blur-sm md:p-10">
                <p className="mb-6 font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Identity Ledger</p>
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</label>
                    <input value={accountName} disabled className="w-full border border-border bg-muted/40 px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                    <input value={user.email ?? ""} disabled className="w-full border border-border bg-muted/40 px-4 py-3 text-sm" />
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Link
                    to="/collections"
                    className="group flex items-center justify-between border border-border px-5 py-4 text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <span className="inline-flex items-center gap-2"><Compass size={14} /> Explore collections</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/consultancy"
                    className="group flex items-center justify-between border border-border px-5 py-4 text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <span>Start a design brief</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <p className="font-sans text-xs text-muted-foreground">
                  Profile attributes are managed by your Google account. Update your Google profile image/name to sync changes here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;
