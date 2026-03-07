import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

export type OAuthProvider = "google";
const isSessionMissingError = (error: { message?: string } | null) =>
  error?.message?.toLowerCase().includes("auth session missing") === true;
const isMissingPkceVerifierError = (error: { message?: string } | null) =>
  error?.message?.toLowerCase().includes("code verifier not found") === true;

export const completeOAuthSignInFromUrl = async () => {
  if (!isSupabaseConfigured || typeof window === "undefined") return;

  const client = getSupabaseClient();
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");

  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error && !isMissingPkceVerifierError(error)) throw error;

    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    if (!error) return;
  }

  if (url.hash.startsWith("#")) {
    const hash = new URLSearchParams(url.hash.slice(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }
  }
};

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

  const client = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError && !isSessionMissingError(sessionError)) throw sessionError;
  return sessionData.session?.user ?? null;
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
  if (error && !isSessionMissingError(error)) throw error;
};
