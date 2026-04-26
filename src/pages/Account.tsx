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
      <div className="min-h-screen bg-[#faf9f8] pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-10 w-48 mb-12 animate-pulse bg-[#eaeaea] rounded" />
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-64 shrink-0 space-y-4">
               <div className="h-12 w-full animate-pulse bg-[#eaeaea] rounded" />
               <div className="h-12 w-full animate-pulse bg-[#eaeaea] rounded" />
               <div className="h-12 w-full animate-pulse bg-[#eaeaea] rounded" />
            </div>
            <div className="flex-1 space-y-6">
               <div className="h-48 w-full animate-pulse bg-[#eaeaea] rounded-xl" />
               <div className="h-64 w-full animate-pulse bg-[#eaeaea] rounded-xl" />
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
    <div className="min-h-screen bg-[#faf9f8] text-[#333] pt-32 pb-24 font-sans selection:bg-[#111] selection:text-white">
      <div className="mx-auto max-w-[1100px] px-6 md:px-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#888] mb-4">Account</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-[#111]">My Profile</h1>
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
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-4 px-4 py-4 text-left transition-all duration-300 rounded-lg
                      ${isActive ? 'text-[#111] bg-white shadow-sm border border-[#eaeaea]' : 'text-[#666] hover:text-[#111] hover:bg-[#f2f0ef]'}`}
                  >
                    <Icon size={16} className={`transition-colors ${isActive ? 'text-[#111]' : 'text-[#888] group-hover:text-[#111]'}`} />
                    <span className="text-xs uppercase tracking-[0.14em] font-light">{tab.label}</span>
                  </button>
                );
              })}
              
              <div className="my-6 h-[1px] w-full bg-[#eaeaea]" />
              
              <button
                onClick={onSignOut}
                className="group flex items-center gap-4 px-4 py-4 text-left text-[#666] transition-all duration-300 hover:text-red-800 rounded-lg hover:bg-red-50/50"
              >
                <LogOut size={16} />
                <span className="text-xs uppercase tracking-[0.14em] font-light">Sign Out</span>
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
                  className="space-y-10"
                >
                  {/* Digital Identity Card */}
                  <section className="p-8 md:p-10 border border-[#eaeaea] rounded-2xl bg-white flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <Avatar className="h-28 w-28 border border-[#eaeaea] shrink-0 bg-[#faf9f8]">
                      <AvatarImage src={accountImage ?? undefined} alt={user.email ?? "Avatar"} />
                      <AvatarFallback className="font-serif text-3xl text-[#555]">{initialsFrom(user)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-3 pt-2">
                      <h2 className="font-serif text-3xl font-light tracking-wide text-[#111]">{accountName}</h2>
                      <p className="text-[#666] text-sm font-light tracking-wide">{user.email}</p>
                      <div className="pt-4 flex items-center justify-center sm:justify-start gap-4 text-[10px] text-[#888] uppercase tracking-[0.2em]">
                        <span>Joined {joinedDate}</span>
                      </div>
                    </div>
                  </section>

                  {/* Quick Actions */}
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-6 pl-1">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Link
                        to="/collections"
                        className="group flex flex-col justify-between p-6 border border-[#eaeaea] rounded-2xl bg-white hover:border-[#ccc] hover:shadow-md transition-all duration-300 h-36"
                      >
                        <Package size={20} className="text-[#888] group-hover:text-[#111] transition-colors" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] uppercase tracking-[0.15em] text-[#555] group-hover:text-[#111]">Explore Collections</span>
                          <ArrowUpRight size={16} className="text-[#888] group-hover:text-[#111] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                      <Link
                        to="/consultancy"
                        className="group flex flex-col justify-between p-6 border border-[#eaeaea] rounded-2xl bg-white hover:border-[#ccc] hover:shadow-md transition-all duration-300 h-36"
                      >
                        <Clock size={20} className="text-[#888] group-hover:text-[#111] transition-colors" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] uppercase tracking-[0.15em] text-[#555] group-hover:text-[#111]">Start Brief</span>
                          <ArrowUpRight size={16} className="text-[#888] group-hover:text-[#111] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
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
                  <h2 className="font-serif text-2xl font-light mb-6 text-[#111]">Order History</h2>
                  <div className="border border-[#eaeaea] bg-white rounded-2xl p-16 text-center flex flex-col items-center justify-center h-[350px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <ShoppingBag size={28} className="text-[#aaa] mb-6" />
                    <p className="text-sm font-light text-[#666] mb-8">Your collection is currently empty.</p>
                    <Link
                      to="/collections"
                      className="inline-flex items-center justify-center bg-[#1c1c1c] text-[#fcfcfc] rounded-xl px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all hover:bg-[#333] active:scale-[0.98] shadow-sm"
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
                  <h2 className="font-serif text-2xl font-light mb-6 text-[#111]">Account Settings</h2>
                  
                  <div className="space-y-5">
                    <div className="border border-[#eaeaea] bg-white rounded-2xl p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-[#888] mb-2 font-light">Primary Email</p>
                        <p className="text-sm text-[#333] tracking-wide">{user.email}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-[#f5f5f5] border border-[#e5e5e5] text-[#555] rounded-full">Active</span>
                    </div>

                    <div className="border border-[#eaeaea] bg-white rounded-2xl p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-[#888] mb-2 font-light">Network ID</p>
                        <p className="font-mono text-xs text-[#666] break-all">{user.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <p className="text-xs font-light text-[#777] leading-loose max-w-2xl border-l-[2px] border-[#eaeaea] pl-5">
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
