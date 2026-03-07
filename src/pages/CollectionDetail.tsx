import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AnimatedSection from '@/components/AnimatedSection';
import { fetchCollectionBySlug, fetchProductsByCollectionSlug } from '@/integrations/supabase/catalog';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

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

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0 pb-12">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              to="/collections"
              className="font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
            >
              {'<-'} Back to Collections
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">{collection.tagline}</p>
                <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">{collection.name}</h1>
                <p className="font-sans text-muted-foreground leading-relaxed max-w-lg">{collection.description}</p>
              </div>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-editorial">
          <AnimatedSection className="mb-12">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground">{products.length} Pieces</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {products.map((product, index) => (
              <AnimatedSection key={product.id} delay={index * 0.1}>
                <div className="group">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-secondary/30 mb-6 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </Link>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-serif text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="font-sans text-sm text-muted-foreground mt-1">{product.materials.join(' · ')}</p>
                    </div>
                    <p className="font-sans text-sm text-foreground">{formatPrice(product.price)}</p>
                  </div>

                  <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

                  <button
                    onClick={() => {
                      trackEvent({ event: 'add_to_cart', source: 'collection_detail', product_id: product.id });
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        material: product.materials[0],
                      });
                    }}
                    className="font-sans text-xs tracking-widest uppercase text-foreground border border-foreground/30 px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    Add to Cart
                  </button>
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
