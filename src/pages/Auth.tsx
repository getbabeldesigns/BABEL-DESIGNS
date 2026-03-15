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
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="min-h-screen bg-background">
        <div className="grid min-h-screen md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden md:block">
            <img
              src="/loginpage_bg.png"
              alt="Babel tower bridging human and divine"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/65 via-foreground/40 to-foreground/75" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="absolute inset-0 flex flex-col justify-end p-12">
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.32em] text-primary-foreground/80">
                Studio Access
              </p>
              <h1 className="mb-4 font-serif text-4xl font-light leading-tight text-primary-foreground lg:text-5xl">
                The bridge between human intention and the eternal.
              </h1>
              <p className="max-w-xl font-sans text-sm leading-relaxed text-primary-foreground/85 lg:text-base">
                Babel Designs curates objects that reconcile the earthly and the divine - the hand, the
                material, the ritual. Step into a space where form becomes prayer, and design becomes
                a mediator.
              </p>
              <div className="mt-6 border-l border-primary-foreground/40 pl-5">
                <p className="font-serif text-lg text-primary-foreground/90">
                  "Design that unites all diversities."
                </p>
                <p className="mt-2 font-sans text-xs uppercase tracking-[0.22em] text-primary-foreground/60">
                  The Babel Philosophy
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="relative h-[40vh] overflow-hidden md:hidden">
              <img
                src="/loginpage_bg.png"
                alt="Babel tower bridging human and divine"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/65 via-foreground/40 to-foreground/80" />
              <div className="absolute inset-0 flex items-end p-6">
                <div>
                  <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.32em] text-primary-foreground/80">
                    Studio Access
                  </p>
                  <h1 className="font-serif text-3xl font-light text-primary-foreground">
                    The bridge between human intention and the eternal.
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-center">
              <div className="mx-auto w-full max-w-lg px-6 py-12 sm:px-10 md:px-12">
                <p className="mb-3 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground md:hidden">
                  Studio Access
                </p>
                <p className="mb-6 font-sans text-sm text-muted-foreground md:hidden">
                  Babel Designs curates objects that reconcile the earthly and the divine - the hand, the
                  material, the ritual. Step into a space where form becomes prayer, and design becomes
                  a mediator.
                </p>

                <div className="mb-8 grid gap-4 sm:grid-cols-3 md:hidden">
                  {[
                    { title: "Origins", copy: "A shared language of form and light." },
                    { title: "Ascent", copy: "Objects that elevate daily ritual." },
                    { title: "Union", copy: "Spaces that bring us closer to meaning." },
                  ].map((item) => (
                    <div key={item.title} className="border border-border/60 bg-card/70 p-4">
                      <p className="font-sans text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="mt-2 font-serif text-base text-foreground">{item.copy}</p>
                    </div>
                  ))}
                </div>

                {!isSupabaseConfigured && (
                  <div className="mb-6 border border-destructive/40 bg-background p-4">
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
                      className="group w-full border border-foreground/35 bg-background px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.26em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-60"
                    >
                      {isSubmitting === "google" ? "Connecting to Google..." : "Continue with Google"}
                    </button>
                    <button
                      onClick={handleContinueAsGuest}
                      className="w-full border border-foreground/20 bg-background px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Continue as guest
                    </button>
                    <p className="pt-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Your choices help us curate a more precise collection.
                    </p>
                  </div>
                )}

                {isSupabaseConfigured && !isLoading && user && (
                  <div className="border border-border bg-background p-6">
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
