import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AnimatedSection from '@/components/AnimatedSection';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { toast } from 'sonner';
import { createOrder } from '@/integrations/supabase/orders';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { createRazorpayOrder, markPaymentFailed, verifyRazorpayPayment } from '@/integrations/supabase/payments';
import { openRazorpayCheckout } from '@/integrations/razorpay/checkout';
import { trackEvent } from '@/lib/analytics';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const startPaymentForOrder = async (localOrderId: string) => {
    const razorpayOrder = await createRazorpayOrder({ localOrderId });

    await new Promise<void>((resolve, reject) => {
      openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Babel Designs',
        description: 'Furniture order payment',
        order_id: razorpayOrder.razorpayOrderId,
        notes: {
          local_order_id: localOrderId,
        },
        theme: {
          color: '#2f2922',
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
            setPendingOrderId(null);
            trackEvent({ event: 'checkout_success', order_id: localOrderId });
            toast.success(`Payment successful. Reference: ${localOrderId.slice(0, 8).toUpperCase()}`);
            navigate(`/order/success/${localOrderId}`);
            resolve();
          } catch (error) {
            await markPaymentFailed({ localOrderId, reason: 'verify_failed' }).catch(() => undefined);
            setPendingOrderId(localOrderId);
            reject(error);
          }
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailed({ localOrderId, reason: 'cancelled' }).catch(() => undefined);
            setPendingOrderId(localOrderId);
            trackEvent({ event: 'checkout_cancelled', order_id: localOrderId });
            reject(new Error('Payment cancelled'));
          },
        },
      }).catch(reject);
    });
  };

  const handleCheckout = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).');
      return;
    }
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      toast.error('Razorpay is not configured yet. Add VITE_RAZORPAY_KEY_ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      trackEvent({ event: 'checkout_started', cart_items: items.length, total_amount: totalPrice });
      const localOrder = await createOrder({ items, currency: 'INR' });
      await startPaymentForOrder(localOrder.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit order request';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!pendingOrderId) return;

    setIsSubmitting(true);
    try {
      trackEvent({ event: 'checkout_retry', order_id: pendingOrderId });
      await startPaymentForOrder(pendingOrderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retry payment';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding">
          <div className="container-editorial text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Your Cart
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-8">
                Your cart is empty
              </h1>
              <p className="font-sans text-muted-foreground mb-12">
                Explore our collections to find pieces that speak to you.
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-foreground border border-foreground/30 px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Explore Collections
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Your Cart
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div 
              className="lg:col-span-2 space-y-8"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={staggerItemVariants}
                  layout
                >
                  <div className="flex gap-6 pb-8 border-b border-border">
                    <motion.div 
                      className="w-32 h-32 bg-secondary/30 flex-shrink-0 overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-lg font-light text-foreground">
                          {item.name}
                        </h3>
                        <motion.button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={18} />
                        </motion.button>
                      </div>

                      {item.material && (
                        <p className="font-sans text-sm text-muted-foreground mb-4">
                          {item.material}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={14} />
                          </motion.button>
                          <span className="font-sans text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>

                        <span className="font-sans text-lg text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-card p-8 sticky top-32"
            >
              <h3 className="font-serif text-xl font-light text-foreground mb-8">
                Order Summary
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-8">
                <div className="flex justify-between font-sans">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground text-lg">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <motion.button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full font-sans text-sm tracking-widest uppercase bg-foreground text-background py-4 hover:bg-foreground/90 transition-colors mb-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Submitting...' : 'Proceed to Checkout'}
              </motion.button>

              {pendingOrderId && (
                <button
                  onClick={handleRetryPayment}
                  disabled={isSubmitting}
                  className="mb-4 w-full border border-foreground/30 py-3 text-xs uppercase tracking-[0.22em] hover:bg-foreground hover:text-background transition-colors"
                >
                  Retry Last Payment
                </button>
              )}

              <p className="font-sans text-xs text-muted-foreground text-center">
                Made to order · 8-12 weeks delivery
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-editorial text-center">
          <AnimatedSection>
            <p className="font-serif text-xl text-muted-foreground mb-6">
              Continue exploring our collections
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-foreground border-b border-foreground/30 pb-2 hover:border-foreground transition-colors"
            >
              View Collections
              <ArrowRight size={14} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Cart;

