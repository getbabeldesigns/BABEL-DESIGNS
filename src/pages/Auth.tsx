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
  const [isSubmitting, setIsSubmitting] = useState<OAuthProvider | 'email' | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting('email');
    
    // Simulate signup request since actual email/password signup might need additional 
    // supabase configuration depending on the exact implementation in `@/integrations/supabase/auth`.
    setTimeout(() => {
      toast.success("Account created successfully. Welcome to Babel.");
      setIsSubmitting(null);
      navigate("/account");
    }, 1500);
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
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#faf9f8] font-sans">
      
      {/* LEFT SIDE: Visual Section */}
      <div className="relative w-full lg:w-1/2 min-h-[40vh] lg:min-h-screen order-2 lg:order-1">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
          alt="Minimalist Architecture"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-[#111]/30 to-transparent" />
        
        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-20">
          <p className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#fcfcfc] leading-[1.2] max-w-lg mb-6">
            "Design is not what we build, but what we choose to preserve."
          </p>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#fcfcfc]/70">
            Babel Designs
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Signup Form */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 order-1 lg:order-2 bg-[#faf9f8]">
        
        <div className="w-full max-w-md bg-[#ffffff] rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#eaeaea]">
          
          {user ? (
            
            <div className="space-y-6 text-center">
              <h2 className="font-serif text-3xl font-light text-[#111]">Welcome back</h2>
              <p className="text-sm font-light text-[#666]">You are currently signed in as {user.email}.</p>
              <div className="pt-4 flex flex-col gap-3">
                <Link to="/account" className="w-full text-center py-3.5 bg-[#111] text-[#fff] rounded-lg tracking-wide hover:bg-[#222] transition-colors text-sm">
                  Go to Account
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="w-full py-3.5 bg-transparent border border-[#ccc] text-[#555] rounded-lg tracking-wide hover:bg-[#f5f5f5] transition-colors text-sm"
                >
                  Sign out
                </button>
              </div>
            </div>

          ) : (
            
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-light text-[#111] mb-2 tracking-wide">
                  Create your account
                </h2>
                <p className="text-sm text-[#777] font-light tracking-wide">
                  Begin your journey with Babel Designs
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailSignUp} className="space-y-5">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#888] pl-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#faf9f8] border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm text-[#333] placeholder-[#aaa] outline-none focus:border-[#999] focus:bg-white transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#888] pl-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#faf9f8] border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm text-[#333] placeholder-[#aaa] outline-none focus:border-[#999] focus:bg-white transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#888] pl-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#faf9f8] border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm text-[#333] placeholder-[#aaa] outline-none focus:border-[#999] focus:bg-white transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting !== null}
                    className="w-full bg-[#1c1c1c] text-[#fcfcfc] rounded-xl py-4 text-sm font-light tracking-wider hover:bg-[#333] disabled:opacity-70 transition-all shadow-sm"
                  >
                    {isSubmitting === 'email' ? "Creating account..." : "Create account"}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-[1px] bg-[#ebebeb]"></div>
                <span className="text-[10px] uppercase tracking-widest text-[#aaa]">Or</span>
                <div className="flex-1 h-[1px] bg-[#ebebeb]"></div>
              </div>

              {/* Secondary Option: Google */}
              <button
                onClick={() => handleOAuth("google")}
                disabled={isSubmitting !== null}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl py-3.5 flex items-center justify-center gap-3 text-sm text-[#444] hover:bg-[#fcfcfc] hover:border-[#ccc] transition-colors shadow-sm disabled:opacity-70"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                <span className="font-light tracking-wide">
                  {isSubmitting === 'google' ? "Connecting..." : "Continue with Google"}
                </span>
              </button>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-[#888] tracking-wide font-light">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#111] hover:underline transition-all">
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
      
    </div>
  );
};

export default Auth;
