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
    <div className="min-h-screen pt-24 md:pt-28">
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/loginpage_bg.png"
          alt="Babel tower bridging human and divine"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/45 to-foreground/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-background/85 via-background/35 to-transparent md:w-[48%]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[18%] h-56 w-56 rounded-full bg-background/35 blur-3xl" />
          <div className="absolute left-[18%] bottom-[12%] h-64 w-64 rounded-full bg-background/25 blur-3xl" />
          <div className="absolute right-[10%] top-[22%] h-72 w-72 rounded-full bg-background/40 blur-[64px]" />
        </div>

        <div className="relative z-10 section-padding">
          <div className="container-editorial max-w-6xl">
            <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div className="text-primary-foreground">
                <p className="mb-4 font-sans text-xs uppercase tracking-[0.32em] text-primary-foreground/75">
                  Studio Access
                </p>
                <h1 className="mb-6 font-serif text-4xl font-light leading-tight sm:text-5xl md:text-6xl">
                  The bridge between human intention and the eternal.
                </h1>
                <p className="max-w-xl font-sans text-base leading-relaxed text-primary-foreground/85">
                  Babel Designs curates objects that reconcile the earthly and the divine - the hand, the
                  material, the ritual. Step into a space where form becomes prayer, and design becomes
                  a mediator.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    { title: "Origins", copy: "A shared language of form and light." },
                    { title: "Ascent", copy: "Objects that elevate daily ritual." },
                    { title: "Union", copy: "Spaces that bring us closer to meaning." },
                  ].map((item) => (
                    <div key={item.title} className="border border-primary-foreground/20 bg-background/10 p-4 backdrop-blur-[2px]">
                      <p className="font-sans text-[11px] uppercase tracking-[0.26em] text-primary-foreground/70">
                        {item.title}
                      </p>
                      <p className="mt-2 font-serif text-base text-primary-foreground">{item.copy}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-l border-primary-foreground/40 pl-5">
                  <p className="font-serif text-lg text-primary-foreground/90">
                    “Design that unites all diversities.”
                  </p>
                  <p className="mt-2 font-sans text-xs uppercase tracking-[0.22em] text-primary-foreground/60">
                    The Babel Philosophy
                  </p>
                </div>
              </div>

              <div className="text-foreground">
              {!isSupabaseConfigured && (
                <div className="mb-6 border border-destructive/40 bg-background/80 p-4">
                  <p className="font-sans text-sm text-destructive">
                    Supabase is not configured. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`).
                  </p>
                </div>
              )}

              {isSupabaseConfigured && isLoading && (
                <div className="space-y-3">
                  <div className="h-12 w-full animate-pulse bg-muted/70" />
                  <div className="h-12 w-full animate-pulse bg-muted/70" />
                </div>
              )}

              {isSupabaseConfigured && !isLoading && !user && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={isSubmitting !== null}
                    className="group w-full border border-foreground/35 bg-background/70 px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.26em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-60"
                  >
                    {isSubmitting === "google" ? "Connecting to Google..." : "Continue with Google"}
                  </button>
                  <button
                    onClick={handleContinueAsGuest}
                    className="w-full border border-foreground/20 bg-background/40 px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    Continue as guest
                  </button>
                  <p className="pt-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    We recommend using Google for the best experience, but you can continue as a guest if you prefer not to sign in.
                  </p>
                </div>
              )}

              {isSupabaseConfigured && !isLoading && user && (
                <div className="border border-border bg-background/80 p-6">
                  <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Signed in as</p>
                  <p className="mt-2 font-serif text-2xl">{user.email}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleSignOut}
                      className="border border-foreground/40 px-5 py-2 font-sans text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
                    >
                      Sign out
                    </button>
                    <Link
                      to="/account"
                      className="border border-foreground/20 px-5 py-2 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Manage account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;

