import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const supabaseUrlRef = (() => {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
})();

const decodeJwtPayload = (token: string) => {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as { ref?: string };
  } catch {
    return null;
  }
};

const supabaseKeyRef = (() => {
  if (!supabaseAnonKey || !supabaseAnonKey.includes(".")) return null;
  return decodeJwtPayload(supabaseAnonKey)?.ref ?? null;
})();

export const supabaseDiagnostics = {
  url: supabaseUrl ?? null,
  urlRef: supabaseUrlRef,
  keyRef: supabaseKeyRef,
  keyLooksLikeJwt: Boolean(supabaseAnonKey?.includes(".")),
  keyUrlRefMismatch: Boolean(supabaseUrlRef && supabaseKeyRef && supabaseUrlRef !== supabaseKeyRef),
};

type SupabaseAuthLock = <T>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<T>,
) => Promise<T>;

const browserSafeAuthLock: SupabaseAuthLock = async (name, acquireTimeout, fn) => {
  if (typeof window === "undefined") {
    return fn();
  }

  if (typeof navigator === "undefined" || !("locks" in navigator) || !navigator.locks) {
    return fn();
  }

  try {
    return await navigator.locks.request(name, { mode: "exclusive" }, async () => fn());
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("timed out waiting")) {
      console.warn(
        `[supabase] auth lock timeout for "${name}" after ${acquireTimeout}ms; falling back to unlocked auth flow.`,
      );
      return fn();
    }

    throw error;
  }
};

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
        lock: browserSafeAuthLock,
      },
    })
  : null;

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return supabase;
};
