import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  completeOAuthSignInFromUrl,
  getCurrentUser,
  onAuthChange,
  sendMagicLink,
  signOutUser,
} from "@/integrations/supabase/auth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { bootstrapClientPortal } from "@/integrations/supabase/clientPortal";
import { stageLabel } from "@/integrations/supabase/execution";
import ClientProjectView from "@/components/portal/ClientProjectView";

// The Client Portal: a client signs in with a magic link (no password to
// manage on their end) tied to whatever email the admin recorded on their
// project (projects.client_email). See client-portal/index.ts's
// autoLinkProjectsByEmail for how that email match turns into actual access
// the moment they sign in.
const Portal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    completeOAuthSignInFromUrl()
      .then(() => getCurrentUser())
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    const subscription = onAuthChange((nextUser) => {
      if (mounted) setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const { data, isLoading: projectsLoading } = useQuery({
    queryKey: ["client-portal-bootstrap", user?.id],
    queryFn: () => bootstrapClientPortal(),
    enabled: Boolean(user),
  });

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await sendMagicLink(email);
      setLinkSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send the link.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setSelectedProjectId(null);
    toast.success("Signed out.");
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#faf9f8] text-[#333] pt-48 md:pt-52 pb-24 font-sans">
      <div className="mx-auto max-w-4xl px-6">{children}</div>
    </div>
  );

  if (authLoading) {
    return shell(<p className="text-sm text-[#777]">Loading...</p>);
  }

  if (!user) {
    return shell(
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 font-serif text-3xl">Client Portal</h1>
        <p className="mb-8 text-sm text-[#777]">
          Sign in with the email your Babel Design consultant has on file to see your project's progress.
        </p>

        {linkSent ? (
          <div className="border border-[#eaeaea] bg-white p-5 text-sm">
            Check <strong>{email}</strong> for a sign-in link. You can close this tab.
          </div>
        ) : (
          <form onSubmit={handleSendLink}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-3 w-full border border-[#eaeaea] px-3 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-[#111] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send Sign-In Link"}
            </button>
          </form>
        )}
      </div>,
    );
  }

  if (selectedProjectId) {
    return shell(<ClientProjectView projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />);
  }

  return shell(
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Your Projects</h1>
        <button onClick={handleSignOut} className="text-xs uppercase tracking-[0.2em] text-[#888] hover:text-[#111]">
          Sign Out
        </button>
      </div>

      {projectsLoading && <p className="text-sm text-[#777]">Loading...</p>}

      {!projectsLoading && data && data.projects.length === 0 && (
        <p className="text-sm text-[#777]">
          No projects are linked to this account yet. If you're expecting to see one here, check with your Babel
          Design consultant that this is the email they have on file.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className="border border-[#eaeaea] bg-white p-5 text-left transition-colors hover:border-[#111]"
          >
            <p className="font-serif text-xl">{project.project_name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#888]">{stageLabel(project.stage)}</p>
          </button>
        ))}
      </div>
    </div>,
  );
};

export default Portal;
