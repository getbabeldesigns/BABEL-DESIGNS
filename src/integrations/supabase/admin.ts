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
    subscribers: number;
  };
  orders: AdminOrder[];
  consultancyRequests: AdminConsultancy[];
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
