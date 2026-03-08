import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/integrations/supabase/orders";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { createRazorpayOrder, markPaymentFailed, verifyRazorpayPayment } from "@/integrations/supabase/payments";
import { openRazorpayCheckout } from "@/integrations/razorpay/checkout";
import { trackEvent } from "@/lib/analytics";
import { formatINR } from "@/lib/currency";
import { handleImageError } from "@/lib/image";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    notes: "",
  });

  const canSubmit = useMemo(() => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.addressLine1.trim() &&
      formData.city.trim() &&
      formData.state.trim() &&
      formData.pincode.trim()
    );
  }, [formData]);

  const handleFieldChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startPaymentForOrder = async (localOrderId: string) => {
    const razorpayOrder = await createRazorpayOrder({ localOrderId });

    await new Promise<void>((resolve, reject) => {
      openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Babel Designs",
        description: "Furniture order payment",
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          local_order_id: localOrderId,
        },
        theme: {
          color: "#2f2922",
        },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              localOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            trackEvent({ event: "checkout_success", order_id: localOrderId });
            toast.success(`Payment successful. Reference: ${localOrderId.slice(0, 8).toUpperCase()}`);
            navigate(`/order/success/${localOrderId}`);
            resolve();
          } catch (error) {
            await markPaymentFailed({ localOrderId, reason: "verify_failed" }).catch(() => undefined);
            reject(error);
          }
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailed({ localOrderId, reason: "cancelled" }).catch(() => undefined);
            trackEvent({ event: "checkout_cancelled", order_id: localOrderId });
            reject(new Error("Payment cancelled"));
          },
        },
      }).catch(reject);
    });
  };

  const handlePayment = async () => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      navigate("/cart");
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      toast.error("Razorpay is not configured yet. Add VITE_RAZORPAY_KEY_ID.");
      return;
    }
    if (!canSubmit) {
      toast.error("Please complete all required checkout fields.");
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }

    setIsSubmitting(true);
    try {
      trackEvent({ event: "checkout_started", cart_items: items.length, total_amount: totalPrice });
      const orderNotes = [
        `Phone: ${formData.phone.trim()}`,
        `Address 1: ${formData.addressLine1.trim()}`,
        `Address 2: ${formData.addressLine2.trim() || "-"}`,
        `City: ${formData.city.trim()}`,
        `State: ${formData.state.trim()}`,
        `Pincode: ${formData.pincode.trim()}`,
        `Country: ${formData.country.trim() || "India"}`,
        formData.notes.trim() ? `Customer Note: ${formData.notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const localOrder = await createOrder({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        notes: orderNotes,
        items,
        currency: "INR",
      });
      await startPaymentForOrder(localOrder.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : "Failed to process checkout";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial text-center">
            <h1 className="font-serif text-4xl font-light">Your cart is empty</h1>
            <Link to="/collections" className="mt-8 inline-block border border-foreground/30 px-6 py-3 text-xs uppercase tracking-[0.2em]">
              Explore Collections
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <Link to="/cart" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} />
            Back to cart
          </Link>

          <div className="mb-10">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">Checkout</p>
            <h1 className="font-serif text-4xl font-light md:text-5xl">Shipping & Contact Details</h1>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
            <motion.div className="rounded-2xl border border-border/70 bg-card/70 p-6 md:p-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Full Name *</span>
                  <input value={formData.fullName} onChange={(e) => handleFieldChange("fullName", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Email *</span>
                  <input type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Contact Number *</span>
                  <input value={formData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Address Line 1 *</span>
                  <input value={formData.addressLine1} onChange={(e) => handleFieldChange("addressLine1", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Address Line 2</span>
                  <input value={formData.addressLine2} onChange={(e) => handleFieldChange("addressLine2", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">City *</span>
                  <input value={formData.city} onChange={(e) => handleFieldChange("city", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">State *</span>
                  <input value={formData.state} onChange={(e) => handleFieldChange("state", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Pincode *</span>
                  <input value={formData.pincode} onChange={(e) => handleFieldChange("pincode", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Country</span>
                  <input value={formData.country} onChange={(e) => handleFieldChange("country", e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Order Notes</span>
                  <textarea value={formData.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} rows={4} className="w-full resize-none border border-border bg-background px-4 py-3 text-sm" />
                </label>
              </div>
            </motion.div>

            <motion.aside className="h-fit rounded-2xl border border-border/70 bg-card/80 p-6">
              <h2 className="mb-5 font-serif text-2xl">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.material ?? ""}`} className="flex items-center gap-3 border-b border-border/60 pb-3">
                    <div className="h-14 w-14 overflow-hidden rounded-md bg-secondary/40">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" onError={handleImageError} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatINR(totalPrice)}</span>
                </div>
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="mb-5 flex items-center justify-between font-serif text-xl">
                  <span>Total</span>
                  <span>{formatINR(totalPrice)}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isSubmitting || !canSubmit}
                  className="w-full bg-foreground py-4 text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Processing..." : "Pay Securely"}
                </button>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
