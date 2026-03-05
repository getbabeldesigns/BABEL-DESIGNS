import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/context/CartContext';
import AnimatedSection from '@/components/AnimatedSection';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { fetchProductById, fetchProducts } from '@/integrations/pocketbase/catalog';
import { trackEvent } from '@/lib/analytics';

const recentKey = 'babel_recent_products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id || ''),
    enabled: Boolean(id),
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    if (!product) return;
    const recentRaw = localStorage.getItem(recentKey);
    const recent = recentRaw ? (JSON.parse(recentRaw) as string[]) : [];
    const updated = [product.id, ...recent.filter((entry) => entry !== product.id)].slice(0, 6);
    localStorage.setItem(recentKey, JSON.stringify(updated));
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((candidate) => candidate.id !== product.id && candidate.collectionSlug === product.collectionSlug)
      .slice(0, 3);
  }, [allProducts, product]);

  const recentlyViewed = useMemo(() => {
    if (!product) return [];
    const recentRaw = localStorage.getItem(recentKey);
    const recent = recentRaw ? (JSON.parse(recentRaw) as string[]) : [];
    return recent
      .filter((entry) => entry !== product.id)
      .map((entry) => allProducts.find((candidate) => candidate.id === entry))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 3);
  }, [allProducts, product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <h1 className="font-serif text-2xl">Loading product...</h1>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <h1 className="font-serif text-2xl">Product not found</h1>
        <Link to="/collections" className="text-muted-foreground hover:text-foreground mt-4 inline-block">
          Return to Collections
        </Link>
      </div>
    );
  }

  const galleryImages = product.images?.length ? product.images : [product.image, product.image, product.image];

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to={`/collections/${product.collectionSlug}`}
              className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12"
            >
              <ArrowLeft size={14} />
              Back to {product.collection}
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="aspect-square bg-secondary/30 mb-4 overflow-hidden"
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </motion.div>
              <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainerVariants} initial="hidden" animate="visible">
                {galleryImages.slice(0, 3).map((image, i) => (
                  <motion.div
                    key={`${product.id}-${i}`}
                    className="aspect-square bg-secondary/20 overflow-hidden"
                    variants={staggerItemVariants}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:pl-8"
            >
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">{product.collection}</p>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">{product.name}</h1>
              <p className="font-sans text-xl text-foreground mb-8">{formatPrice(product.price)}</p>

              <p className="font-sans text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              <div className="border-t border-border pt-6 mb-6">
                <h3 className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-3">Materials</h3>
                <p className="font-sans text-foreground">{product.materials.join(' � ')}</p>
              </div>

              <div className="border-t border-border pt-6 mb-6">
                <h3 className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-3">Dimensions</h3>
                <p className="font-sans text-foreground">{product.dimensions}</p>
              </div>

              <div className="border-t border-border pt-6 mb-8">
                <h3 className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-3">Philosophy</h3>
                <p className="font-serif text-foreground leading-relaxed">"{product.philosophy}"</p>
              </div>

              <button
                onClick={() => {
                  trackEvent({ event: 'add_to_cart', source: 'product_detail', product_id: product.id });
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    material: product.materials[0],
                  });
                }}
                className="w-full font-sans text-sm tracking-widest uppercase bg-foreground text-background py-4 hover:bg-foreground/90 transition-colors"
              >
                Add to Cart
              </button>

              <p className="font-sans text-xs text-muted-foreground text-center mt-4">Made to order � 8-12 weeks delivery</p>
            </motion.div>
          </div>
        </div>
      </section>

      {(relatedProducts.length > 0 || recentlyViewed.length > 0) && (
        <section className="section-padding bg-card mt-20">
          <div className="container-editorial">
            {relatedProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 font-serif text-3xl font-light">Related Products</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {relatedProducts.map((item) => (
                    <Link key={item.id} to={`/product/${item.id}`} className="border border-border bg-background p-4">
                      <div className="mb-3 aspect-square overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      </div>
                      <p className="font-serif text-xl">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.materials.join(' � ')}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recentlyViewed.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-3xl font-light">Recently Viewed</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {recentlyViewed.map((item) => (
                    <Link key={item.id} to={`/product/${item.id}`} className="border border-border bg-background p-4">
                      <div className="mb-3 aspect-square overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      </div>
                      <p className="font-serif text-xl">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.materials.join(' � ')}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <AnimatedSection>
        <section className="section-padding bg-card mt-20">
          <div className="container-editorial text-center max-w-3xl">
            <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
              Each piece is crafted with intention, designed to age gracefully and
              become more beautiful with time.
            </p>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};

export default ProductDetail;

