import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AnimatedSection from '@/components/AnimatedSection';
import { fetchCollectionBySlug, fetchProductsByCollectionSlug } from '@/integrations/supabase/catalog';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { formatINR } from '@/lib/currency';
import monolithImg from '@/assets/monolith-collection.jpg';
import stillnessImg from '@/assets/stillness-collection.jpg';
import originImg from '@/assets/origin-collection.jpg';

const CollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();

  const { data: collection, isLoading: isCollectionLoading, isError: isCollectionError } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => fetchCollectionBySlug(slug || ''),
    enabled: Boolean(slug),
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['collection-products', slug],
    queryFn: () => fetchProductsByCollectionSlug(slug || ''),
    enabled: Boolean(slug),
  });

  if (isCollectionLoading || isProductsLoading) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <h1 className="font-serif text-2xl">Loading collection...</h1>
      </div>
    );
  }

  if (isCollectionError || !collection) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <h1 className="font-serif text-2xl">Collection not found</h1>
        <Link to="/collections" className="text-muted-foreground hover:text-foreground mt-4 inline-block">
          Return to Collections
        </Link>
      </div>
    );
  }

  const normalizedSlug = (slug || '').toLowerCase();
  const resolvedCollectionVisual =
    (normalizedSlug.includes('monolith') && monolithImg) ||
    (normalizedSlug.includes('stillness') && stillnessImg) ||
    (normalizedSlug.includes('origin') && originImg) ||
    monolithImg;

  const collectionAccent =
    normalizedSlug.includes('monolith')
      ? 'from-stone-300/45 via-zinc-200/20 to-transparent'
      : normalizedSlug.includes('stillness')
        ? 'from-amber-200/45 via-orange-100/20 to-transparent'
        : 'from-neutral-300/45 via-stone-200/20 to-transparent';

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0 pb-12">
        <div className="container-editorial">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link
              to="/collections"
              className="mb-8 inline-block font-sans text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {'<-'} Back to Collections
            </Link>

            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/75 p-8 md:p-12">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${collectionAccent}`} />
              <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-end">
                <div className="lg:col-span-2">
                  <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">{collection.tagline}</p>
                  <h1 className="mb-6 font-serif text-4xl font-light text-foreground md:text-5xl">{collection.name}</h1>
                  <p className="max-w-2xl font-sans leading-relaxed text-muted-foreground">{collection.description}</p>
                </div>
                <div className="border border-border/60 bg-background/60 p-5">
                  <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Collection profile</p>
                  <p className="font-serif text-3xl font-light text-foreground">{products.length}</p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">Available pieces</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card/70">
        <div className="container-editorial">
          <AnimatedSection className="mb-12">
            <div className="flex items-center justify-between gap-6 border-y border-border/60 py-5">
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">{products.length} Pieces</p>
              <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Crafted for long-term living</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {products.map((product, index) => (
              <AnimatedSection key={product.id} delay={index * 0.08}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-6 shadow-[0_24px_56px_-48px_hsl(var(--foreground)/0.65)]">
                  <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${collectionAccent} blur-2xl`} />

                  <div className="relative mb-4 flex items-start justify-between gap-6">
                    <div>
                      <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                        Piece {String(index + 1).padStart(2, '0')}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-serif text-2xl font-light text-foreground transition-colors group-hover:text-muted-foreground">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <p className="font-sans text-sm uppercase tracking-[0.2em] text-foreground">{formatINR(product.price)}</p>
                  </div>

                  <div className="relative mb-5 flex flex-wrap gap-2">
                    {product.materials.slice(0, 3).map((material) => (
                      <span
                        key={material}
                        className="border border-border/70 bg-secondary/20 px-3 py-1 font-sans text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {material}
                      </span>
                    ))}
                  </div>

                  <p className="relative mb-6 font-sans text-sm leading-relaxed text-muted-foreground">{product.description}</p>

                  <div className="relative flex flex-wrap items-center gap-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="border border-border/70 px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        trackEvent({ event: 'add_to_cart', source: 'collection_detail', product_id: product.id });
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: resolvedCollectionVisual,
                          material: product.materials[0],
                        });
                      }}
                      className="border border-foreground/35 px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollectionDetail;
