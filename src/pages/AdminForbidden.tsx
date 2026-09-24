import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, signOutUser } from "@/integrations/supabase/auth";

// Reached only when there IS a valid, verified Supabase session but that
// user's id isn't in admin_users (a real "forbidden", not a session hiccup —
// see the AdminAuthError handling in src/pages/Admin.tsx for how the two are
// told apart). Kept as its own route/page rather than an inline block on
// /admin so a rejected sign-in attempt gets a clear, dedicated screen with a
// way back out, instead of being left sitting on /admin.
const AdminForbidden = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((user) => {
        if (mounted) setEmail(user?.email ?? null);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

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
    <div className="relative min-h-[70vh] overflow-hidden px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[16%] h-40 w-40 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute right-[12%] bottom-[18%] h-32 w-32 rounded-full bg-muted-foreground/20 blur-2xl" />
      </div>

      <div className="container-editorial relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl border border-border/60 bg-card/70 p-8 text-center backdrop-blur-sm md:p-12"
        >
          <div className="mb-5 flex justify-center text-muted-foreground">
            <ShieldAlert size={36} strokeWidth={1.25} />
          </div>

          <p className="mb-5 font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
            access restricted
          </p>

          <h1 className="mb-4 font-serif text-4xl font-light leading-tight text-foreground sm:text-5xl">
            You're not authorized.
          </h1>

          <p className="mx-auto mb-8 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
            {email ? (
              <>
                You're signed in as <span className="text-foreground">{email}</span>, but this
                account doesn't have admin access. Ask an existing admin to add your account, or
                sign in with a different one.
              </>
            ) : (
              "This account doesn't have admin access."
            )}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-foreground/35 px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ArrowLeft size={14} />
              Go Home
            </Link>
            <button
              onClick={handleSignOut}
              className="border border-border px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminForbidden;
