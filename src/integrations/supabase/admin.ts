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

const adminHeaders = (adminToken: string) => ({
  "x-admin-token": adminToken,
});

export const fetchAdminDashboard = async (adminToken: string): Promise<AdminDashboardResponse> => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-dashboard", {
    headers: adminHeaders(adminToken),
  });
  if (error) throw error;
  return data as AdminDashboardResponse;
};

export const updateAdminOrderStatus = async (
  adminToken: string,
  orderId: string,
  status: string,
  paymentStatus?: string | null,
) => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-update-order-status", {
    headers: adminHeaders(adminToken),
    body: {
      orderId,
      status,
      paymentStatus,
    },
  });

  if (error) throw error;
  return data as { success: boolean };
};

export const updateAdminCollection = async (
  adminToken: string,
  input: { collectionId: string; tagline: string; description: string; heroImageUrl: string },
) => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-manage-catalog", {
    headers: adminHeaders(adminToken),
    body: {
      action: "update_collection",
      ...input,
    },
  });

  if (error) throw error;
  return data as { success: boolean };
};

export const updateAdminProduct = async (
  adminToken: string,
  input: { productId: string; active: boolean; imageUrl: string },
) => {
  const { data, error } = await getSupabaseClient().functions.invoke("admin-manage-catalog", {
    headers: adminHeaders(adminToken),
    body: {
      action: "update_product",
      ...input,
    },
  });

  if (error) throw error;
  return data as { success: boolean };
};
