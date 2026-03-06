import type { RecordModel } from "pocketbase";
import { getPocketBaseClient, isPocketBaseConfigured } from "./client";

export type OAuthProvider = "google" | "github";

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  raw: RecordModel;
}

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const resolveAvatarUrl = (model: RecordModel): string | null => {
  const avatarValue = readString((model as Record<string, unknown>).avatar);
  if (!avatarValue) return null;
  if (/^https?:\/\//i.test(avatarValue)) return avatarValue;
  return getPocketBaseClient().files.getURL(model, avatarValue);
};

const toAppUser = (model: RecordModel | null): AppUser | null => {
  if (!model) return null;

  return {
    id: model.id,
    email: typeof model.email === "string" ? model.email : null,
    name: typeof model.name === "string" ? model.name : null,
    avatarUrl: resolveAvatarUrl(model),
    raw: model,
  };
};

export const startOAuthSignIn = async (provider: OAuthProvider) => {
  if (!isPocketBaseConfigured) {
    throw new Error("PocketBase is not configured. Set VITE_POCKETBASE_URL.");
  }

  await getPocketBaseClient().collection("users").authWithOAuth2({ provider });
};

export const getOAuthProviders = async (): Promise<OAuthProvider[]> => {
  if (!isPocketBaseConfigured) return [];

  try {
    const methods = await getPocketBaseClient().collection("users").listAuthMethods();
    const available = methods.oauth2.providers
      .map((provider) => provider.name)
      .filter((name): name is OAuthProvider => name === "google" || name === "github");
    return available;
  } catch {
    return [];
  }
};

export const isLocalPocketBaseUrl = () =>
  /127\.0\.0\.1|localhost/i.test(import.meta.env.VITE_POCKETBASE_URL ?? "");

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

export const updateCurrentUserProfile = async (input: { name?: string; avatarFile?: File | null }): Promise<AppUser> => {
  if (!isPocketBaseConfigured) {
    throw new Error("PocketBase is not configured. Set VITE_POCKETBASE_URL.");
  }

  const pb = getPocketBaseClient();
  const record = pb.authStore.record;
  if (!record) {
    throw new Error("No authenticated user.");
  }

  const payload = new FormData();
  if (typeof input.name === "string") payload.set("name", input.name.trim());
  if (input.avatarFile) payload.set("avatar", input.avatarFile);

  let updated: RecordModel;
  try {
    updated = await pb.collection("users").update(record.id, payload);
  } catch (error) {
    const details = (error as { response?: { data?: Record<string, { code?: string }> } }).response?.data;
    if (details?.avatar?.code === "validation_unknown_field") {
      throw new Error("Add an `avatar` file field to the PocketBase `users` collection to upload profile pictures.");
    }
    throw error;
  }
  pb.authStore.save(pb.authStore.token, updated);
  return toAppUser(updated)!;
};
