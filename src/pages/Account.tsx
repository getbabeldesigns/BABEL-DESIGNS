import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { 
  ArrowUpRight, 
  LogOut, 
  User as UserIcon, 
  ShoppingBag, 
  Settings, 
  Package,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, signOutUser } from "@/integrations/supabase/auth";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");

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
      "Collector"
    );
  }, [user]);

  const joinedDate = useMemo(() => {
    if (!user?.created_at) return "Recently";
    return new Date(user.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [user]);

  const onSignOut = async () => {
    await signOutUser();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-10 w-48 mb-12 animate-pulse bg-muted/60 rounded" />
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-64 shrink-0 space-y-4">
               <div className="h-12 w-full animate-pulse bg-muted/60 rounded" />
               <div className="h-12 w-full animate-pulse bg-muted/60 rounded" />
               <div className="h-12 w-full animate-pulse bg-muted/60 rounded" />
            </div>
            <div className="flex-1 space-y-6">
               <div className="h-48 w-full animate-pulse bg-muted/60 rounded-xl" />
               <div className="h-64 w-full animate-pulse bg-muted/60 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const slideVariants = {
    initial: { opacity: 0, y: 15 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-24 font-sans selection:bg-foreground selection:text-background">
      <div className="mx-auto max-w-[1100px] px-6 md:px-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Account</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light">My Profile</h1>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-56 shrink-0">
            <nav className="flex flex-col gap-1 relative">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group relative flex items-center gap-4 px-4 py-4 text-left transition-all duration-300
                      ${isActive ? 'text-foreground bg-muted/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute left-0 top-0 h-full w-[2px] bg-foreground"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 40 }}
                      />
                    )}
                    <Icon size={16} className={`transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span className="text-xs uppercase tracking-[0.14em]">{tab.label}</span>
                  </button>
                );
              })}
              
              <div className="my-6 h-[1px] w-full bg-border/40" />
              
              <button
                onClick={onSignOut}
                className="group flex items-center gap-4 px-4 py-4 text-left text-muted-foreground transition-all duration-300 hover:text-destructive"
              >
                <LogOut size={16} />
                <span className="text-xs uppercase tracking-[0.14em]">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  variants={slideVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="space-y-12"
                >
                  {/* Digital Identity Card */}
                  <section className="p-8 md:p-10 border border-border/60 bg-muted/5 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
                    <Avatar className="h-28 w-28 border border-border/70 shrink-0">
                      <AvatarImage src={accountImage ?? undefined} alt={user.email ?? "Avatar"} />
                      <AvatarFallback className="font-serif text-3xl bg-muted/30">{initialsFrom(user)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-3 pt-2">
                      <h2 className="font-serif text-3xl font-light tracking-wide">{accountName}</h2>
                      <p className="text-muted-foreground text-sm tracking-wide">{user.email}</p>
                      <div className="pt-4 flex items-center justify-center sm:justify-start gap-4 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                        <span>Joined {joinedDate}</span>
                      </div>
                    </div>
                  </section>

                  {/* Quick Actions */}
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Link
                        to="/collections"
                        className="group flex flex-col justify-between p-6 border border-border/50 bg-muted/5 hover:border-foreground/30 transition-all duration-300 h-36"
                      >
                        <Package size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] uppercase tracking-[0.15em] group-hover:text-foreground">Explore Collections</span>
                          <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                      <Link
                        to="/consultancy"
                        className="group flex flex-col justify-between p-6 border border-border/50 bg-muted/5 hover:border-foreground/30 transition-all duration-300 h-36"
                      >
                        <Clock size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] uppercase tracking-[0.15em] group-hover:text-foreground">Start Brief</span>
                          <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  variants={slideVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="space-y-8"
                >
                  <h2 className="font-serif text-2xl font-light mb-6">Order History</h2>
                  <div className="border border-border/50 bg-muted/5 p-16 text-center flex flex-col items-center justify-center h-[350px]">
                    <ShoppingBag size={28} className="text-muted-foreground/40 mb-6" />
                    <p className="text-sm text-muted-foreground mb-8">Your collection is currently empty.</p>
                    <Link
                      to="/collections"
                      className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] transition-all hover:bg-foreground/90 active:scale-[0.98]"
                    >
                      Browse Studio
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  variants={slideVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="space-y-10"
                >
                  <h2 className="font-serif text-2xl font-light mb-6">Account Settings</h2>
                  
                  <div className="space-y-5">
                    <div className="border border-border/50 bg-muted/5 p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Primary Email</p>
                        <p className="text-sm">{user.email}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-muted border border-border/50 text-foreground">Active</span>
                    </div>

                    <div className="border border-border/50 bg-muted/5 p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Network ID</p>
                        <p className="font-mono text-xs text-muted-foreground break-all">{user.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <p className="text-xs text-muted-foreground leading-loose max-w-2xl border-l-[2px] border-border/50 pl-5">
                      Note: Your identity footprint is synced securely via your authentication provider ({(user?.app_metadata?.provider || 'oauth').toUpperCase()}). To adjust your avatar or primary credentials, please administer modifications directly through your provider's platform.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;
