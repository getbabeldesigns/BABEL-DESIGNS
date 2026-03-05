import type { RecordModel } from "pocketbase";
import { getPocketBaseClient, isPocketBaseConfigured } from "./client";

export type OAuthProvider = "google" | "github";

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  raw: RecordModel;
}

const toAppUser = (model: RecordModel | null): AppUser | null => {
  if (!model) return null;

  return {
    id: model.id,
    email: typeof model.email === "string" ? model.email : null,
    name: typeof model.name === "string" ? model.name : null,
    raw: model,
  };
};

export const startOAuthSignIn = async (provider: OAuthProvider) => {
  if (!isPocketBaseConfigured) {
    throw new Error("PocketBase is not configured. Set VITE_POCKETBASE_URL.");
  }

  const providers = await getOAuthProviders();
  if (!providers.includes(provider)) {
    throw new Error(`OAuth provider "${provider}" is not enabled in PocketBase.`);
  }

  await getPocketBaseClient().collection("users").authWithOAuth2({ provider });
};

export const getOAuthProviders = async (): Promise<OAuthProvider[]> => {
  if (!isPocketBaseConfigured) return [];

  const methods = await getPocketBaseClient().collection("users").listAuthMethods();
  const available = methods.oauth2.providers
    .map((provider) => provider.name)
    .filter((name): name is OAuthProvider => name === "google" || name === "github");
  return available;
};

export const getCurrentUser = async (): Promise<AppUser | null> => {
  if (!isPocketBaseConfigured) return null;

  const pb = getPocketBaseClient();
  if (!pb.authStore.isValid || !pb.authStore.model) return null;

  try {
    await pb.collection("users").authRefresh();
  } catch {
    pb.authStore.clear();
    return null;
  }

  return toAppUser(pb.authStore.model);
};

export const onAuthChange = (callback: (user: AppUser | null) => void) => {
  if (!isPocketBaseConfigured) {
    return { unsubscribe: () => undefined };
  }

  const remove = getPocketBaseClient().authStore.onChange((_token, model) => {
    callback(toAppUser(model));
  }, true);

  return {
    unsubscribe: () => remove(),
  };
};

export const signOutUser = async () => {
  if (!isPocketBaseConfigured) return;
  getPocketBaseClient().authStore.clear();
};
