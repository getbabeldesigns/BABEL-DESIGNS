import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { fetchCustomerOrders, type CustomerOrder } from "@/integrations/supabase/orders";
import { formatINR } from "@/lib/currency";
import { handleImageError } from "@/lib/image";

const STATUS_LABELS: Record<string, string> = {
  created: "Order Received",
  payment_pending: "Payment Pending",
  paid: "Payment Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const TrackOrder = () => {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the email you used at checkout.");
      return;
    }

    setIsSearching(true);
    try {
      const result = await fetchCustomerOrders({ email: email.trim(), orderId: orderId.trim() || undefined });
      setOrders(result);
      setHasSearched(true);
      if (result.length === 0) {
        toast.error("No orders found for that email and reference.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to look up orders";
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 md:pt-52">
      <section className="section-padding section-transition pt-0 pb-12">
        <div className="container-editorial max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Track Order
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
              Check your order status.
            </h1>
            <p className="font-sans text-muted-foreground leading-relaxed max-w-xl">
              Enter the email you used at checkout to see the status of your order. Add a specific order reference
              if you have it, or leave it blank to see your full order history with us.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding section-transition pt-0">
        <div className="container-editorial max-w-2xl">
          <form onSubmit={handleSearch} className="border border-border/70 bg-card/70 p-6 md:p-8 mb-10">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="track-email" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Email *
                </label>
                <input
                  id="track-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                />
              </div>
              <div>
                <label htmlFor="track-order-id" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Order Reference (optional)
                </label>
                <input
                  id="track-order-id"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. a1b2c3d4"
                  className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="mt-6 w-full border border-foreground/35 bg-foreground py-3 font-sans text-sm uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Find My Orders"}
            </button>
          </form>

          {hasSearched && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-border bg-card p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">Reference</p>
                      <p className="font-mono text-lg">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="border border-border/70 px-3 py-1 font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="border border-border/70 px-3 py-1 font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {order.payment_status ? `Payment: ${order.payment_status}` : "Payment: pending"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={`${item.product_id}-${index}`} className="flex items-center gap-3 border-b border-border/60 pb-2">
                        {item.image_url && (
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40">
                            <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" onError={handleImageError} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-sans text-sm">{item.product_name}</p>
                          <p className="font-sans text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <p className="font-sans text-sm">{formatINR(item.unit_price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between font-sans text-sm">
                    <span className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="font-serif text-lg">{formatINR(order.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TrackOrder;
