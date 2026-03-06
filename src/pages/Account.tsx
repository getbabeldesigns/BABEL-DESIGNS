import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Check, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCurrentUser,
  signOutUser,
  type AppUser,
  updateCurrentUserProfile,
} from "@/integrations/pocketbase/auth";

const initialsFrom = (user: AppUser | null) => {
  const source = user?.name || user?.email || "";
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        setName(currentUser.name ?? "");
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

  const accountImage = useMemo(() => previewUrl ?? user?.avatarUrl ?? null, [previewUrl, user?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updated = await updateCurrentUserProfile({
        name,
        avatarFile,
      });
      setUser(updated);
      setAvatarFile(null);
      setPreviewUrl(null);
      toast.success("Profile updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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
            <h1 className="font-serif text-4xl font-light md:text-5xl">Profile Atelier</h1>
            <p className="mt-4 max-w-2xl font-sans text-sm text-muted-foreground">
              Personalize your Babel identity and keep your account details current.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr]">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-8 backdrop-blur-sm">
              <div className="relative mx-auto mb-6 w-fit">
                <Avatar className="h-32 w-32 border border-border/70 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)]">
                  <AvatarImage src={accountImage ?? undefined} alt={user.name ?? user.email ?? "Account avatar"} />
                  <AvatarFallback className="text-2xl font-serif">{initialsFrom(user)}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="account-avatar-upload"
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-background"
                  title="Change avatar"
                >
                  <Camera size={16} />
                </label>
                <input id="account-avatar-upload" type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </div>

              <p className="text-center font-serif text-2xl">{user.name || "Babel Collector"}</p>
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
              <p className="mb-6 font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Manage Profile</p>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Display name</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                  <input value={user.email ?? ""} disabled className="w-full border border-border bg-muted/50 px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="mb-8 rounded-2xl border border-border/60 bg-background/60 p-5">
                <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">What this section controls</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-foreground" />
                    Account name shown in your profile
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-foreground" />
                    Profile image used in top-right account entry
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 border border-foreground/35 px-6 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-60"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
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
