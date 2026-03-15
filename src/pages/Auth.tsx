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
import philosophyHero from "@/assets/philosophy-hero.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import monolithImg from "@/assets/monolith-collection.jpg";

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial max-w-5xl">
          <div className="grid overflow-hidden border border-border/70 bg-card/70 backdrop-blur-sm md:grid-cols-[1.2fr_1fr]">
            <div className="relative border-b border-border/60 p-8 md:border-b-0 md:border-r md:p-12">
              <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full border border-border/50" />
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio Access</p>
              <h1 className="mb-4 font-serif text-4xl font-light md:text-5xl">A Bridge of Form</h1>
              <p className="max-w-md font-sans leading-relaxed text-muted-foreground">
                Babel Designs connects the human and the eternal through material, proportion, and quiet intention.
                Continue to your curated space.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="group relative overflow-hidden border border-border/70 bg-background">
                  <img
                    src={philosophyHero}
                    alt="A contemplative architectural space"
                    className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-primary-foreground/80">
                      Human / Divine
                    </p>
                    <p className="font-serif text-lg text-primary-foreground">The shared language of form</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden border border-border/70 bg-background">
                  <img
                    src={heroBg}
                    alt="Light filtering through architectural surfaces"
                    className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-primary-foreground/80">
                      Babel Designs
                    </p>
                    <p className="font-serif text-lg text-primary-foreground">A mediator of spaces</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-border/60 bg-background/70 p-4">
                <p className="font-serif text-lg text-foreground/90">
                  “Design that unites all diversities.”
                </p>
                <p className="mt-2 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  The Babel Philosophy
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {!isSupabaseConfigured && (
                <div className="mb-6 border border-destructive/40 bg-background p-4">
                  <p className="font-sans text-sm text-destructive">
                    Supabase is not configured. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`).
                  </p>
                </div>
              )}

              {isSupabaseConfigured && isLoading && (
                <div className="space-y-3">
                  <div className="h-10 w-full animate-pulse bg-muted" />
                  <div className="h-10 w-full animate-pulse bg-muted" />
                </div>
              )}

              {isSupabaseConfigured && !isLoading && !user && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={isSubmitting !== null}
                    className="group w-full border border-foreground/35 px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.26em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-60"
                  >
                    {isSubmitting === "google" ? "Connecting to Google..." : "Continue with Google"}
                  </button>
                  <button
                    onClick={handleContinueAsGuest}
                    className="w-full border border-foreground/20 px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
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
      </section>
    </div>
  );
};

export default Auth;
