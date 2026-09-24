import { getSupabaseClient } from "./client";
import { getAccessToken } from "./auth";

export interface AdminOrder {
  id: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface AdminConsultancy {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  preferred_date: string | null;
  preferred_slot: string | null;
  consultation_format: string | null;
  created_at: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export interface AdminSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hero_image_url: string | null;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  image_url: string | null;
}

export interface AdminDashboardResponse {
  metrics: {
    orders: number;
    paidOrders: number;
    consultancyRequests: number;
    contactMessages: number;
    subscribers: number;
  };
  orders: AdminOrder[];
  consultancyRequests: AdminConsultancy[];
  contactMessages: AdminContactMessage[];
  subscribers: AdminSubscriber[];
  collections: AdminCollection[];
  products: AdminProduct[];
}

// Thrown instead of a raw supabase-js error whenever an admin edge function
// call fails for an auth reason, so the UI can tell two very different cases
// apart:
//  - "unauthenticated": there's no valid session at all (never signed in,
//    signed out, or the session expired) — the UI should just fall back to
//    the sign-in screen, not accuse the user of lacking admin access.
//  - "forbidden": there IS a valid, verified session, but this user's id
//    isn't in admin_users — a real "you don't have access" case.
export class AdminAuthError extends Error {
  readonly kind: "unauthenticated" | "forbidden";
  constructor(kind: "unauthenticated" | "forbidden", message: string) {
    super(message);
    this.name = "AdminAuthError";
    this.kind = kind;
  }
}

// Every admin edge function requires a real signed-in Supabase user whose id
// is in admin_users (see supabase/schema.sql) — being signed in isn't enough
// on its own. supabase-js's functions.invoke() can auto-attach an
// Authorization header from its own internal session cache, but that cache
// briefly lagging behind the rest of the app's session state (most visible
// right after a page reload) is exactly what let a genuine admin see a false
// "not authorized" until they retried. Fetching the access token ourselves
// with getAccessToken() and attaching it explicitly closes that gap: whatever
// session that call resolves to is exactly what gets sent, every time.
const invokeAdmin = async <T>(functionName: string, body?: Record<string, unknown>): Promise<T> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new AdminAuthError("unauthenticated", "You're not signed in.");
  }

  const { data, error } = await getSupabaseClient().functions.invoke(functionName, {
    headers: { Authorization: `Bearer ${accessToken}` },
    ...(body ? { body } : {}),
  });

  if (error) {
    const status = (error as { context?: { status?: number } })?.context?.status;
    if (status === 401) {
      throw new AdminAuthError("unauthenticated", "Your session has expired. Please sign in again.");
    }
    if (status === 403) {
      throw new AdminAuthError("forbidden", "This account doesn't have admin access.");
    }
    throw error;
  }

  return data as T;
};

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> =>
  invokeAdmin<AdminDashboardResponse>("admin-dashboard");

export const updateAdminOrderStatus = async (
  orderId: string,
  status: string,
  paymentStatus?: string | null,
) =>
  invokeAdmin<{ success: boolean }>("admin-update-order-status", {
    orderId,
    status,
    paymentStatus,
  });

export const updateAdminCollection = async (input: {
  collectionId: string;
  tagline: string;
  description: string;
  heroImageUrl: string;
}) =>
  invokeAdmin<{ success: boolean }>("admin-manage-catalog", {
    action: "update_collection",
    ...input,
  });

export const updateAdminProduct = async (input: {
  productId: string;
  active: boolean;
  imageUrl: string;
}) =>
  invokeAdmin<{ success: boolean }>("admin-manage-catalog", {
    action: "update_product",
    ...input,
  });

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file."));
        return;
      }
      // reader.result is a data: URL ("data:image/png;base64,AAAA..."); the
      // edge function only wants the base64 payload after the comma.
      const commaIndex = result.indexOf(",");
      resolve(commaIndex === -1 ? result : result.slice(commaIndex + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

// Uploads an admin-picked image file to Supabase Storage (via the
// admin-upload-image edge function, which is auth-gated the same way as
// admin-manage-catalog) and returns its public URL. This replaces the old
// "paste an image URL" text field in the admin dashboard.
export const uploadAdminImage = async (
  file: File,
  folder: "collections" | "products",
): Promise<string> => {
  const fileBase64 = await readFileAsBase64(file);

  const result = await invokeAdmin<{ success: boolean; publicUrl: string }>("admin-upload-image", {
    fileName: file.name,
    fileBase64,
    contentType: file.type,
    folder,
  });

  return result.publicUrl;
};
