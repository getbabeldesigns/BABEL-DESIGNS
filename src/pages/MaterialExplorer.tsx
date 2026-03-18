import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/integrations/supabase/catalog';
import { handleImageError } from '@/lib/image';
import monolithImg from '@/assets/monolith-collection.jpg';
import stillnessImg from '@/assets/stillness-collection.jpg';
import originImg from '@/assets/origin-collection.jpg';

type MaterialNote = {
  name: string;
  mood: string;
  care: string;
  detail: string;
  tintClass: string;
  query: string;
  tags: string[];
  sampleImage: string;
};

const materialNotes: MaterialNote[] = [
  {
    name: 'Stone',
    mood: 'Grounded, cool, architectural.',
    care: 'Use pH-neutral cleaner, avoid acidic spills, seal every 8-12 months.',
    detail: 'Best for anchors: coffee tables, consoles, and sculptural side pieces.',
    tintClass: 'from-stone-300/35 via-zinc-200/20 to-transparent',
    query: 'travertine limestone marble stone',
    tags: ['travertine', 'limestone', 'marble', 'stone', 'granite'],
    sampleImage: monolithImg,
  },
  {
    name: 'Wood',
    mood: 'Warm, quiet, and tactile.',
    care: 'Dust with dry cloth, avoid direct sunlight, oil natural finishes quarterly.',
    detail: 'Perfect for daily-use surfaces where comfort and texture matter most.',
    tintClass: 'from-amber-300/35 via-yellow-200/20 to-transparent',
    query: 'oak walnut ash wood',
    tags: ['oak', 'walnut', 'ash', 'teak', 'wood'],
    sampleImage: stillnessImg,
  },
  {
    name: 'Metal',
    mood: 'Precise structure with soft reflections.',
    care: 'Wipe with microfiber, keep dry, use wax polish for bronze/brass patina control.',
    detail: 'Use in accents and frames to sharpen silhouettes without visual noise.',
    tintClass: 'from-slate-300/30 via-zinc-300/15 to-transparent',
    query: 'bronze brass steel metal',
    tags: ['bronze', 'brass', 'steel', 'metal', 'iron'],
    sampleImage: originImg,
  },
  {
    name: 'Textiles',
    mood: 'Comfort and acoustic softness.',
    care: 'Vacuum gently each week, spot clean quickly, rotate cushions monthly.',
    detail: 'Brings calm layering into living rooms, lounges, and intimate corners.',
    tintClass: 'from-neutral-300/35 via-stone-200/20 to-transparent',
    query: 'linen cotton textile upholstery',
    tags: ['linen', 'cotton', 'textile', 'upholstery', 'wool'],
    sampleImage: stillnessImg,
  },
];

const matchesMaterial = (productMaterial: string, tags: string[]) => {
  const normalized = productMaterial.toLowerCase();
  return tags.some((tag) => normalized.includes(tag));
};

const MaterialExplorer = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  return (
    <div className="min-h-screen pt-28 md:pt-36">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/75 p-8 backdrop-blur-sm md:p-12"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--foreground)/0.09),transparent_35%),radial-gradient(circle_at_85%_15%,hsl(var(--sand)/0.18),transparent_34%)]"
            />
            <div className="relative grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Material Explorer</p>
                <h1 className="mb-6 font-serif text-4xl font-light leading-tight md:text-6xl">Touch, Tone, and Care</h1>
                <p className="max-w-2xl text-muted-foreground">
                  Compare key materials, learn practical care rituals, and move directly into related pieces without guessing.
                </p>
              </div>
              <div className="lg:col-span-4">
                <div className="space-y-4 border border-border/50 bg-background/70 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">At a glance</p>
                  <p className="font-serif text-4xl font-light">{materialNotes.length}</p>
                  <p className="text-sm text-muted-foreground">Core material families curated with mood, maintenance, and real product shortcuts.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-editorial grid grid-cols-1 gap-6 md:grid-cols-2">
          {materialNotes.map((material) => {
            const product = products.find((item) => item.materials.some((entry) => matchesMaterial(entry, material.tags)));

            return (
              <motion.article
                key={material.name}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-background shadow-[0_26px_60px_-52px_hsl(var(--foreground)/0.75)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${material.tintClass} z-10`} />
                  <img
                    src={product?.image || material.sampleImage}
                    alt={product?.name ?? `${material.name} material reference`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.materialFallback === 'true') {
                        handleImageError(event);
                        return;
                      }
                      image.dataset.materialFallback = 'true';
                      image.src = material.sampleImage;
                    }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background/90 to-transparent p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Material</p>
                    <h2 className="mt-2 font-serif text-3xl font-light text-foreground">{material.name}</h2>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <p className="text-sm text-muted-foreground">{material.mood}</p>
                  <p className="text-sm leading-relaxed">{material.detail}</p>
                  <p className="border-l border-border/70 pl-4 text-sm text-muted-foreground">{material.care}</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      to={`/collections?q=${encodeURIComponent(material.query)}`}
                      className="border border-foreground/35 px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
                    >
                      Explore in collections
                    </Link>
                    {product && (
                      <Link
                        to={`/product/${product.id}`}
                        className="border border-border/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground/45 hover:text-foreground"
                      >
                        View match: {product.name}
                      </Link>
                    )}
                  </div>
                  {!product && (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      No direct product match yet, browse collections by material query.
                    </p>
                  )}
                </div>
                {product && (
                  <Link to={`/product/${product.id}`} className="block border-t border-border/60 bg-secondary/20 px-6 py-4">
                    <p className="font-serif text-lg">{product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{product.materials.join(' / ')}</p>
                  </Link>
                )}
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default MaterialExplorer;
