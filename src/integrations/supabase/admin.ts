import { getSupabaseClient } from "./client";

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

// No token headers needed here: supabase-js's functions.invoke() automatically
// sends `Authorization: Bearer <current session's access token>` for a
// signed-in user, which is exactly what the admin edge functions now check
// (real Supabase auth + admin_users membership) instead of a shared secret.

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-dashboard");
  if (error) throw error;
  return data as AdminDashboardResponse;
};

export const updateAdminOrderStatus = async (
  orderId: string,
  status: string,
  paymentStatus?: string | null,
) => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-update-order-status", {
    body: {
      orderId,
      status,
      paymentStatus,
    },
  });

  if (error) throw error;
  return data as { success: boolean };
};

export const updateAdminCollection = async (input: {
  collectionId: string;
  tagline: string;
  description: string;
  heroImageUrl: string;
}) => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-manage-catalog", {
    body: {
      action: "update_collection",
      ...input,
    },
  });

  if (error) throw error;
  return data as { success: boolean };
};

export const updateAdminProduct = async (input: {
  productId: string;
  active: boolean;
  imageUrl: string;
}) => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-manage-catalog", {
    body: {
      action: "update_product",
      ...input,
    },
  });

  if (error) throw error;
  return data as { success: boolean };
};

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

  const { data, error } = await getSupabaseClient().functions.invoke("admin-upload-image", {
    body: {
      fileName: file.name,
      fileBase64,
      contentType: file.type,
      folder,
    },
  });

  if (error) throw error;

  const result = data as { success: boolean; publicUrl: string };
  return result.publicUrl;
};
