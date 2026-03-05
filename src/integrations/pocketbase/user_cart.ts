import type { RecordModel } from "pocketbase";
import type { CartItem } from "@/context/CartContext";
import { getPocketBaseClient } from "./client";

type UserCartRecord = RecordModel & {
  items?: unknown;
};

type PocketBaseErrorLike = {
  status?: number;
};

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.quantity === "number"
  );
};

const normalizeCartItems = (value: unknown): CartItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isCartItem)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));
};

const getCartRecordByFilter = async (filter: string): Promise<UserCartRecord | null> => {
  try {
    return await getPocketBaseClient().collection("user_carts").getFirstListItem<UserCartRecord>(filter);
  } catch (error) {
    if ((error as PocketBaseErrorLike).status === 404) return null;
    throw error;
  }
};

const fetchCartRecord = async (userId: string) =>
  (await getCartRecordByFilter(`user="${userId}"`)) ?? (await getCartRecordByFilter(`user_id="${userId}"`));

const createOrUpdateWithField = async (recordId: string | null, userField: "user" | "user_id", userId: string, items: CartItem[]) => {
  const payload = {
    [userField]: userId,
    items,
    updated_at: new Date().toISOString(),
  };

  if (recordId) {
    await getPocketBaseClient().collection("user_carts").update(recordId, payload);
    return;
  }

  await getPocketBaseClient().collection("user_carts").create(payload);
};

export const fetchUserCartItems = async (userId: string): Promise<CartItem[]> => {
  const record = await fetchCartRecord(userId);
  return normalizeCartItems(record?.items ?? []);
};

export const saveUserCartItems = async (userId: string, items: CartItem[]) => {
  const sanitized = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: Math.max(1, Math.floor(item.quantity)),
    material: item.material ?? undefined,
  }));
  const existing = await fetchCartRecord(userId);

  try {
    await createOrUpdateWithField(existing?.id ?? null, "user", userId, sanitized);
  } catch {
    await createOrUpdateWithField(existing?.id ?? null, "user_id", userId, sanitized);
  }
};
