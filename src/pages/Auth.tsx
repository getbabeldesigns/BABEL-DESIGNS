import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AppUser } from "@/integrations/pocketbase/auth";
import { toast } from "sonner";
import { isPocketBaseConfigured } from "@/integrations/pocketbase/client";
import { getCurrentUser, onAuthChange, signOutUser, startOAuthSignIn } from "@/integrations/pocketbase/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<"google" | null>(null);

  useEffect(() => {
    if (!isPocketBaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Failed to load account");
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

  const handleOAuth = async () => {
    setIsSubmitting("google");
    try {
      await startOAuthSignIn("google");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start sign in";
      toast.error(message);
      setIsSubmitting(null);
    }
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
          <div className="grid overflow-hidden border border-border/70 bg-card/70 backdrop-blur-sm md:grid-cols-[1.15fr_1fr]">
            <div className="relative border-b border-border/60 p-8 md:border-b-0 md:border-r md:p-12">
              <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full border border-border/50" />
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Member Access</p>
              <h1 className="mb-4 font-serif text-4xl font-light md:text-5xl">Studio Access</h1>
              <p className="max-w-md font-sans leading-relaxed text-muted-foreground">
                Sign in to sync your cart, saved pieces, and preferences across devices.
              </p>

              <div className="mt-10 space-y-3 border border-border/60 bg-background/60 p-5">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">With account</p>
                <p className="font-sans text-sm text-foreground/90">Persistent cart across sessions</p>
                <p className="font-sans text-sm text-foreground/90">Faster checkout details</p>
                <p className="font-sans text-sm text-foreground/90">Saved selections for later</p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {!isPocketBaseConfigured && (
                <div className="mb-6 border border-destructive/40 bg-background p-4">
                  <p className="font-sans text-sm text-destructive">
                    PocketBase is not configured. Add `VITE_POCKETBASE_URL`.
                  </p>
                </div>
              )}

              {isPocketBaseConfigured && isLoading && (
                <div className="space-y-3">
                  <div className="h-10 w-full animate-pulse bg-muted" />
                  <div className="h-10 w-full animate-pulse bg-muted" />
                </div>
              )}

              {isPocketBaseConfigured && !isLoading && !user && (
                <div className="space-y-4">
                  <button
                    onClick={handleOAuth}
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
                </div>
              )}

              {isPocketBaseConfigured && !isLoading && user && (
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
                      to="/collections"
                      className="border border-foreground/20 px-5 py-2 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Explore collections
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
