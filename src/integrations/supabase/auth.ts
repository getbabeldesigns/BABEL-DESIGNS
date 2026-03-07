import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

export type OAuthProvider = "google" | "github";

export const startOAuthSignIn = async (provider: OAuthProvider) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).");
  }

  const redirectTo = `${window.location.origin}/auth`;
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) throw error;
  return data.user;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => undefined };
  }

  const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return {
    unsubscribe: () => data.subscription.unsubscribe(),
  };
};

export const signOutUser = async () => {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
};
