/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL?: string;
  readonly VITE_CRM_ACCESS_TOKEN?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_LAUNCH_GATE_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
