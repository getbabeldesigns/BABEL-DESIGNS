import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ArrowUpRight, Clock3, Compass, Gem, Layers3, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, signOutUser } from "@/integrations/supabase/auth";

const initialsFrom = (user: User | null) => {
  const metadataName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined);
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

  const accountImage = useMemo(
    () => (user?.user_metadata?.avatar_url as string | undefined) ?? null,
    [user],
  );

  const accountName = useMemo(() => {
    return (
      (user?.user_metadata?.full_name as string | undefined) ||
      (user?.user_metadata?.name as string | undefined) ||
      "Babel Collector"
    );
  }, [user]);

  const joinedDate = useMemo(() => {
    if (!user?.created_at) return "Recently";
    return new Date(user.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [user]);

  const providerLabel = useMemo(() => {
    const provider = user?.app_metadata?.provider;
    if (!provider) return "OAuth";
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [user]);

  const onSignOut = async () => {
    await signOutUser();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-28 md:pt-36">
        <section className="section-padding pt-0">
          <div className="container-editorial space-y-4">
            <div className="h-16 w-full animate-pulse bg-muted/70" />
            <div className="h-52 w-full animate-pulse bg-muted/70" />
            <div className="h-64 w-full animate-pulse bg-muted/70" />
          </div>
        </section>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-28 md:pt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_35%_30%,hsl(var(--sand)/0.46),transparent_68%)] blur-3xl" />
        <div className="absolute -right-14 top-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_40%_35%,hsl(var(--foreground)/0.12),transparent_70%)] blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10 space-y-10">
          <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-background/75 p-7 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--background))_0%,hsl(var(--background)/0.9)_52%,hsl(var(--foreground)/0.08)_100%)]" />
            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="mb-3 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Account Studio
                </p>
                <h1 className="font-serif text-4xl font-light leading-tight text-foreground md:text-6xl">
                  Your curated control room.
                </h1>
                <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground">
                  A redesigned space for profile identity, session trust, and fast pathways into your product world.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-border/70 bg-background/70 px-4 py-3">
                  <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Member Since</p>
                  <p className="mt-1 font-serif text-sm text-foreground">{joinedDate}</p>
                </div>
                <div className="border border-border/70 bg-background/70 px-4 py-3">
                  <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Provider</p>
                  <p className="mt-1 font-serif text-sm text-foreground">{providerLabel}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[360px_1fr]">
            <aside className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-7 backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-border/50" />
              <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_35%_30%,hsl(var(--clay)/0.38),transparent_72%)] blur-2xl" />

              <div className="relative mb-7 flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-border/70">
                  <AvatarImage src={accountImage ?? undefined} alt={user.email ?? "Account avatar"} />
                  <AvatarFallback className="font-serif text-lg">{initialsFrom(user)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-serif text-2xl font-light text-foreground">{accountName}</p>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Active profile</p>
                </div>
              </div>

              <div className="relative space-y-3">
                <div className="border border-border/60 bg-background/70 p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Email</p>
                  <p className="mt-2 break-all font-sans text-sm text-foreground">{user.email}</p>
                </div>
                <div className="border border-border/60 bg-background/70 p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Account ID</p>
                  <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{user.id}</p>
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="relative mt-6 flex w-full items-center justify-center gap-2 border border-foreground/35 bg-foreground px-4 py-3 font-sans text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </aside>

            <main className="space-y-8">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-border/70 bg-card/80 p-6">
                  <Sparkles className="mb-4 h-5 w-5 text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Style Pulse</p>
                  <p className="mt-2 font-serif text-2xl font-light text-foreground">Sculpted Minimal</p>
                </article>
                <article className="rounded-2xl border border-border/70 bg-card/80 p-6">
                  <Gem className="mb-4 h-5 w-5 text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Material Bias</p>
                  <p className="mt-2 font-serif text-2xl font-light text-foreground">Stone + Wood</p>
                </article>
                <article className="rounded-2xl border border-border/70 bg-card/80 p-6">
                  <ShieldCheck className="mb-4 h-5 w-5 text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Session Trust</p>
                  <p className="mt-2 font-serif text-2xl font-light text-foreground">Verified</p>
                </article>
              </section>

              <section className="rounded-3xl border border-border/70 bg-card/80 p-7 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Layers3 size={18} className="text-foreground" />
                  <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Navigation Deck</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Link
                    to="/collections"
                    className="group flex items-center justify-between border border-border/70 bg-background/70 px-5 py-4 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Compass size={14} />
                      Explore collections
                    </span>
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/consultancy"
                    className="group flex items-center justify-between border border-border/70 bg-background/70 px-5 py-4 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={14} />
                      Start design brief
                    </span>
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </section>

              <section className="rounded-3xl border border-border/70 bg-card/80 p-7 md:p-8">
                <p className="mb-4 font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Profile Note</p>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  Name and avatar are synced from your Google identity provider. Update those in Google to reflect changes here automatically.
                </p>
              </section>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;
