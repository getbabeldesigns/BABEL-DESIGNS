import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerOrders } from "@/integrations/supabase/orders";
import { formatINR } from "@/lib/currency";
import { handleImageError } from "@/lib/image";

const STATUS_LABELS: Record<string, string> = {
  created: "Order Received",
  payment_pending: "Payment Pending",
  paid: "Payment Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const shortRef = orderId ? orderId.slice(0, 8).toUpperCase() : "-";

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const [manualEmail, setManualEmail] = useState("");

  const storedEmail = useMemo(() => {
    if (typeof window === "undefined" || !orderId) return null;
    try {
      return window.sessionStorage.getItem(`babel_order_email_${orderId}`);
    } catch {
      return null;
    }
  }, [orderId]);

  const email = stateEmail || storedEmail || manualEmail;

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["order-detail", orderId, email],
    queryFn: () => fetchCustomerOrders({ email, orderId }),
    enabled: Boolean(orderId && email),
  });

  const order = orders?.[0];

  return (
    <div className="min-h-screen pt-40 md:pt-52">
      <section className="section-padding pt-0">
        <div className="container-editorial max-w-3xl text-center">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            {order ? STATUS_LABELS[order.status] ?? order.status : "Payment Confirmed"}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-6">Thank you for your order</h1>
          <p className="font-sans text-muted-foreground mb-10">
            Your transaction was successful. Save your reference for support and delivery updates.
          </p>

          <div className="mx-auto mb-10 max-w-md border border-border bg-card p-6">
            <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Reference</p>
            <p className="font-mono text-2xl">{shortRef}</p>
          </div>

          {!email && (
            <div className="mx-auto mb-10 max-w-md border border-border bg-card/60 p-6 text-left">
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                View order details
              </p>
              <p className="mb-4 font-sans text-xs text-muted-foreground">
                Enter the email you used at checkout to see your order status and items.
              </p>
              <input
                type="email"
                value={manualEmail}
                onChange={(event) => setManualEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full border border-border bg-background px-4 py-3 font-sans text-sm outline-none focus:border-foreground/60"
              />
            </div>
          )}

          {email && isLoading && (
            <p className="mb-10 font-sans text-sm text-muted-foreground">Loading your order details...</p>
          )}

          {email && isError && (
            <p className="mb-10 font-sans text-sm text-destructive">
              We couldn't load your order details right now. Your payment was still recorded — contact us with your
              reference above if you need help.
            </p>
          )}

          {email && !isLoading && !isError && orders && orders.length === 0 && (
            <p className="mb-10 font-sans text-sm text-muted-foreground">
              We couldn't find an order matching that email and reference. Double-check the email you used at
              checkout, or contact us with your reference above.
            </p>
          )}

          {order && (
            <div className="mx-auto mb-10 max-w-xl border border-border bg-card p-6 text-left">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-serif text-lg">Order Summary</p>
                <span className="border border-border/70 px-3 py-1 font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {order.payment_status ? `Payment: ${order.payment_status}` : "Payment: pending"}
                </span>
              </div>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${item.product_id}-${index}`} className="flex items-center gap-3 border-b border-border/60 pb-3">
                    {item.image_url && (
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40">
                        <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" onError={handleImageError} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm">{item.product_name}</p>
                      <p className="font-sans text-xs text-muted-foreground">
                        Qty {item.quantity}
                        {item.material ? ` · ${item.material}` : ""}
                      </p>
                    </div>
                    <p className="font-sans text-sm">{formatINR(item.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between font-serif text-lg">
                <span>Total</span>
                <span>{formatINR(order.total_amount)}</span>
              </div>
              <p className="mt-4 font-sans text-xs text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}

          <p className="mb-10 font-sans text-xs text-muted-foreground">
            You can check this order's status anytime on our{" "}
            <Link to="/track-order" className="underline underline-offset-2 hover:text-foreground">
              Track Order
            </Link>{" "}
            page using your email and this reference.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/collections" className="border border-foreground/40 px-8 py-3 text-sm uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
              Continue Browsing
            </Link>
            <Link to="/consultancy" className="border border-foreground/20 px-8 py-3 text-sm uppercase tracking-[0.2em] hover:border-foreground transition-colors">
              Book Design Consultancy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderSuccess;
