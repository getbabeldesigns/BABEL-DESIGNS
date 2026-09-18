import type { CartItem } from "@/context/CartContext";
import { getSupabaseClient } from "./client";

export interface CreateOrderInput {
  fullName?: string;
  email?: string;
  notes?: string;
  items: CartItem[];
  currency?: string;
}

export interface CreatedOrder {
  id: string;
  totalAmount: number;
  currency: string;
}

export interface CustomerOrderItem {
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  material: string | null;
  image_url: string | null;
}

export interface CustomerOrder {
  id: string;
  full_name: string | null;
  email: string | null;
  notes: string | null;
  status: string;
  payment_status: string | null;
  payment_provider: string | null;
  currency: string;
  total_amount: number;
  created_at: string;
  items: CustomerOrderItem[];
}

export const createOrder = async (input: CreateOrderInput): Promise<CreatedOrder> => {
  const supabase = getSupabaseClient();

  const totalAmount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = input.currency ?? "INR";
  const orderId = crypto.randomUUID();

  const { error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      full_name: input.fullName ?? null,
      email: input.email ?? null,
      notes: input.notes ?? null,
      total_amount: totalAmount,
      currency,
      status: "created",
      payment_provider: "razorpay",
      payment_status: "created",
    });

  if (orderError) throw orderError;

  const orderItems = input.items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    product_name: item.name,
    unit_price: item.price,
    quantity: item.quantity,
    material: item.material ?? null,
    image_url: item.image,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;

  return {
    id: orderId,
    totalAmount,
    currency,
  };
};

// Looks up orders by the customer's email (guest checkouts never create an
// account, so email is the only stable handle we have for them). Pass
// orderId to narrow to a single order — used right after checkout, where we
// already know exactly which order we're confirming. Omit it to list a
// customer's full order history — used on the Track Order page and the
// signed-in Account "Order History" tab (with the account's own email).
export const fetchCustomerOrders = async (input: { email: string; orderId?: string }): Promise<CustomerOrder[]> => {
  const { data, error } = await getSupabaseClient().functions.invoke("customer-orders", {
    body: { email: input.email, orderId: input.orderId },
  });

  if (error) throw error;
  return ((data as { orders?: CustomerOrder[] } | null)?.orders) ?? [];
};
