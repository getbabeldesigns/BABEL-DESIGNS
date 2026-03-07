import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
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
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <div className="mb-10 rounded-3xl border border-border/70 bg-gradient-to-br from-background via-card to-secondary/30 p-8 md:p-12">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Babel Account</p>
            <h1 className="font-serif text-4xl font-light md:text-5xl">Profile</h1>
            <p className="mt-4 max-w-2xl font-sans text-sm text-muted-foreground">
              Account details are managed by your sign-in provider.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr]">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-8 backdrop-blur-sm">
              <div className="relative mx-auto mb-6 w-fit">
                <Avatar className="h-32 w-32 border border-border/70 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)]">
                  <AvatarImage src={accountImage ?? undefined} alt={user.email ?? "Account avatar"} />
                  <AvatarFallback className="text-2xl font-serif">{initialsFrom(user)}</AvatarFallback>
                </Avatar>
              </div>

              <p className="text-center font-serif text-2xl">{accountName}</p>
              <p className="mb-6 text-center font-sans text-sm text-muted-foreground">{user.email}</p>

              <button
                onClick={onSignOut}
                className="flex w-full items-center justify-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/70 p-8 backdrop-blur-sm md:p-10">
              <p className="mb-6 font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Account Info</p>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</label>
                  <input value={accountName} disabled className="w-full border border-border bg-muted/50 px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                  <input value={user.email ?? ""} disabled className="w-full border border-border bg-muted/50 px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/collections"
                  className="border border-border px-6 py-3 text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  Continue Browsing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;
