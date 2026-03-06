import PocketBase from "pocketbase";

const rawPocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL?.trim() ?? "";

const isLocalHostName = (value: string) => value === "127.0.0.1" || value === "localhost";

const resolvePocketBaseUrl = (value: string) => {
  if (!value) return "";
  if (typeof window === "undefined") return value;

  try {
    const parsed = new URL(value);
    const currentHost = window.location.hostname;
    if (isLocalHostName(parsed.hostname) && currentHost && !isLocalHostName(currentHost)) {
      parsed.hostname = currentHost;
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return value;
  }
};

const pocketBaseUrl = resolvePocketBaseUrl(rawPocketBaseUrl);

export const isPocketBaseConfigured = Boolean(pocketBaseUrl);
export const isPocketBaseLocalhostConfigured = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(rawPocketBaseUrl);

export const pocketbase = isPocketBaseConfigured ? new PocketBase(pocketBaseUrl) : null;

if (pocketbase) {
  pocketbase.autoCancellation(false);
}

export const getPocketBaseClient = () => {
  if (!pocketbase) {
    throw new Error("PocketBase is not configured. Set VITE_POCKETBASE_URL.");
  }

  return pocketbase;
};
