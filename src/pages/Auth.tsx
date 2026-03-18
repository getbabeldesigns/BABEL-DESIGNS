import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  completeOAuthSignInFromUrl,
  getCurrentUser,
  onAuthChange,
  signOutUser,
  startOAuthSignIn,
  type OAuthProvider,
} from "@/integrations/supabase/auth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<OAuthProvider | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    completeOAuthSignInFromUrl()
      .then(() => getCurrentUser())
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load account";
        toast.error(message);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const subscription = onAuthChange((nextUser) => {
      if (mounted) setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleOAuth = (provider: OAuthProvider) => {
    setIsSubmitting(provider);
    startOAuthSignIn(provider)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to start sign in";
        toast.error(message);
      })
      .finally(() => {
        setIsSubmitting(null);
      });
  };

  const handleContinueAsGuest = () => {
    toast.success("Continuing as guest");
    navigate("/collections");
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success("Signed out.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign out";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <section className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-background">
        <img
          src="/loginpage_bg.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full origin-top scale-[1.08] object-cover object-[center_20%] opacity-55 blur-[1px] saturate-90"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--background))_0%,hsl(var(--background)/0.7)_40%,hsl(var(--foreground)/0.8)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--sand)/0.6),transparent_62%)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 right-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_40%_40%,hsl(var(--clay)/0.5),transparent_60%)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--foreground)/0.08),transparent_38%),radial-gradient(circle_at_85%_20%,hsl(var(--sand)/0.12),transparent_35%)] opacity-70"
        />

        <div className="container-editorial relative mx-auto grid min-h-[calc(100vh-4.5rem)] grid-cols-1 items-stretch gap-10 px-4 py-12 sm:px-6 md:px-12 lg:grid-cols-12 lg:gap-12 lg:px-20 lg:py-16">
          <div className="lg:col-span-6 lg:pr-4">
            <div className="max-w-2xl">
              <p className="section-overline">Studio access</p>
              <h1 className="display-title mt-4 text-balance">
                Where material becomes ritual, and design becomes a mediator.
              </h1>
              <p className="section-copy mt-5 max-w-xl text-balance">
                Enter Babel’s private studio space: a calmer way to collect, save, and return to pieces
                that speak to you. Sign in to refine your experience, or continue as guest.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Curate",
                  copy: "Shortlist objects with intention, not noise.",
                  index: "01",
                },
                {
                  title: "Return",
                  copy: "Pick up where you left off across devices.",
                  index: "02",
                },
                {
                  title: "Private",
                  copy: "Account tools that stay discreet and minimal.",
                  index: "03",
                },
                {
                  title: "Guest",
                  copy: "Browse freely—sign in only when you’re ready.",
                  index: "04",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden border border-foreground/15 bg-background/60 p-5 shadow-[0_18px_48px_-42px_hsl(var(--foreground)/0.55)] backdrop-blur-sm"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--foreground)/0.12),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <p className="font-sans text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
                    {item.index}
                  </p>
                  <p className="mt-3 font-serif text-xl font-light tracking-tight">{item.title}</p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 hidden max-w-2xl border-l border-foreground/25 pl-6 lg:block">
              <p className="font-serif text-2xl font-light text-foreground/90">
                “Design that unites all diversities.”
              </p>
              <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                The Babel Philosophy
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pl-2">
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto lg:mr-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 border border-foreground/20"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full border border-foreground/20"
              />

              <div className="relative overflow-hidden rounded-2xl border border-foreground/20 bg-background/70 shadow-[0_40px_110px_-80px_hsl(var(--foreground)/0.7)] backdrop-blur-md">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,hsl(var(--sand)/0.28),transparent_50%),radial-gradient(circle_at_80%_70%,hsl(var(--wood)/0.2),transparent_56%)]"
                />

                <div className="relative p-7 sm:p-9">
                  <div className="space-y-3 border-b border-foreground/15 pb-6">
                    <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                      Sign in
                    </p>
                    <p className="font-serif text-3xl font-light tracking-tight">
                      Enter the studio.
                    </p>
                    <p className="max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
                      Secure OAuth, no passwords. Keep your collections aligned wherever you return.
                    </p>
                  </div>

                  {!isSupabaseConfigured && (
                    <div className="mt-6 border border-destructive/40 bg-background/70 p-4">
                      <p className="font-sans text-sm text-destructive">
                        Supabase is not configured. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`).
                      </p>
                    </div>
                  )}

                  {isSupabaseConfigured && isLoading && (
                    <div className="mt-7 space-y-3">
                      <div className="h-12 w-full animate-pulse bg-muted/70" />
                      <div className="h-12 w-full animate-pulse bg-muted/70" />
                    </div>
                  )}

                  {isSupabaseConfigured && !isLoading && !user && (
                    <div className="mt-7 space-y-4">
                      <button
                        onClick={() => handleOAuth("google")}
                        disabled={isSubmitting !== null}
                        className="group w-full rounded-xl border border-foreground/35 bg-background/70 px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.28em] transition-[transform,background-color,color,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-foreground/60 hover:bg-foreground hover:text-background hover:shadow-[0_12px_30px_-18px_hsl(var(--foreground)/0.8)] disabled:transform-none disabled:opacity-60"
                      >
                        <span className="flex items-center justify-between gap-4">
                          <span>{isSubmitting === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
                          <span aria-hidden="true" className="text-[10px] tracking-[0.34em] opacity-70 group-hover:opacity-90">
                            ↗
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={handleContinueAsGuest}
                        className="w-full rounded-xl border border-foreground/20 bg-background/55 px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground transition-[transform,color,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-foreground/45 hover:bg-background/70 hover:text-foreground"
                      >
                        <span className="flex items-center justify-between gap-4">
                          <span>Continue as guest</span>
                          <span aria-hidden="true" className="text-[10px] tracking-[0.34em] opacity-70">
                            →
                          </span>
                        </span>
                      </button>
                      <div className="pt-2">
                        <p className="font-sans text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                          Your choices help us curate a more precise collection.
                        </p>
                      </div>
                    </div>
                  )}

                  {isSupabaseConfigured && !isLoading && user && (
                    <div className="mt-7 border border-foreground/15 bg-background/55 p-6">
                      <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                        Signed in as
                      </p>
                      <p className="mt-2 break-words font-serif text-2xl font-light tracking-tight">
                        {user.email}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={handleSignOut}
                          className="border border-foreground/40 bg-background/60 px-5 py-2 font-sans text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
                        >
                          Sign out
                        </button>
                        <Link
                          to="/account"
                          className="border border-foreground/20 bg-background/40 px-5 py-2 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground/45 hover:text-foreground"
                        >
                          Manage account
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
                <p className="font-sans text-[10px] uppercase tracking-[0.34em]">
                  Babel Designs · Muted luxury
                </p>
                <Link
                  to="/collections"
                  className="font-sans text-[10px] uppercase tracking-[0.34em] transition-colors hover:text-foreground"
                >
                  Browse collections
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;

