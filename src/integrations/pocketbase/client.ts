import PocketBase from "pocketbase";

const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL;

export const isPocketBaseConfigured = Boolean(pocketBaseUrl);

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
