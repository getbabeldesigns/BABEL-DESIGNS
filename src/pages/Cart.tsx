import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AnimatedSection from '@/components/AnimatedSection';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { formatINR } from '@/lib/currency';
import { handleImageError } from '@/lib/image';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 md:pt-40">
        <section className="section-padding">
          <div className="container-editorial text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Your Cart
              </p>
              <h1 className="mb-8 font-serif text-4xl font-light text-foreground md:text-5xl">
                Your cart is empty
              </h1>
              <p className="mb-12 font-sans text-muted-foreground">
                Explore our collections to find pieces that speak to you.
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center gap-3 border border-foreground/30 bg-foreground px-8 py-4 font-sans text-sm uppercase tracking-widest text-background transition-all duration-300 hover:bg-foreground/90"
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
    <div className="relative min-h-screen overflow-hidden bg-background pt-32 md:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-16 h-56 w-56 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute right-0 top-64 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Your Cart
            </p>
            <h1 className="font-serif text-4xl font-light text-foreground md:text-5xl">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
            <motion.div
              className="space-y-8 lg:col-span-2"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.material ?? ''}`}
                  variants={staggerItemVariants}
                  layout
                >
                  <div className="flex gap-6 rounded-2xl border border-border/70 bg-card/75 p-5">
                    <motion.div
                      className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-border/40 bg-secondary/35"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                      />
                    </motion.div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-serif text-lg font-light text-foreground">
                          {item.name}
                        </h3>
                        <motion.button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={18} />
                        </motion.button>
                      </div>

                      {item.material && (
                        <p className="mb-4 font-sans text-sm text-muted-foreground">
                          {item.material}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center border border-border bg-background transition-colors hover:bg-secondary"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={14} />
                          </motion.button>
                          <span className="w-8 text-center font-sans text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center border border-border bg-background transition-colors hover:bg-secondary"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>

                        <span className="font-sans text-lg text-foreground">
                          {formatINR(item.price * item.quantity)}
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
              className="sticky top-32 rounded-2xl border border-border/70 bg-card/80 p-8 backdrop-blur-sm"
            >
              <h3 className="mb-8 font-serif text-xl font-light text-foreground">
                Order Summary
              </h3>

              <div className="mb-8 space-y-4">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>
              </div>

              <div className="mb-8 border-t border-border pt-4">
                <div className="flex justify-between font-sans">
                  <span className="text-foreground">Total</span>
                  <span className="text-lg text-foreground">{formatINR(totalPrice)}</span>
                </div>
              </div>

              <motion.button
                onClick={() => navigate('/checkout')}
                className="mb-4 w-full bg-foreground py-4 font-sans text-sm uppercase tracking-widest text-background transition-colors hover:bg-foreground/90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceed to Checkout
              </motion.button>

              <p className="text-center font-sans text-xs text-muted-foreground">
                Made to order - 8-12 weeks delivery
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/70">
        <div className="container-editorial text-center">
          <AnimatedSection>
            <p className="mb-6 font-serif text-xl text-muted-foreground">
              Continue exploring our collections
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center gap-3 border-b border-foreground/30 pb-2 font-sans text-sm uppercase tracking-widest text-foreground transition-colors hover:border-foreground"
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
