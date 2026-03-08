import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/integrations/supabase/catalog';
import { handleImageError } from '@/lib/image';

type MaterialNote = {
  name: string;
  mood: string;
  care: string;
  motionClass: string;
  query: string;
};

const materialNotes: MaterialNote[] = [
  {
    name: 'Stone',
    mood: 'Grounded, cool, architectural.',
    care: 'Use pH-neutral cleaner, avoid acidic spills, seal every 8-12 months.',
    motionClass: 'animate-[pulse_7s_ease-in-out_infinite]',
    query: 'travertine limestone marble stone',
  },
  {
    name: 'Wood',
    mood: 'Warm, quiet, and tactile.',
    care: 'Dust with dry cloth, avoid direct sunlight, oil natural finishes quarterly.',
    motionClass: 'animate-[pulse_6s_ease-in-out_infinite]',
    query: 'oak walnut ash wood',
  },
  {
    name: 'Metal',
    mood: 'Precise structure with soft reflections.',
    care: 'Wipe with microfiber, keep dry, use wax polish for bronze/brass patina control.',
    motionClass: 'animate-[pulse_5s_ease-in-out_infinite]',
    query: 'bronze brass steel metal',
  },
  {
    name: 'Textiles',
    mood: 'Comfort and acoustic softness.',
    care: 'Vacuum gently each week, spot clean quickly, rotate cushions monthly.',
    motionClass: 'animate-[pulse_8s_ease-in-out_infinite]',
    query: 'linen cotton textile upholstery',
  },
];

const MaterialExplorer = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Material Explorer</p>
            <h1 className="mb-6 font-serif text-4xl font-light md:text-6xl">Touch, Tone, and Care</h1>
            <p className="text-muted-foreground">Compare key materials, understand maintenance, and jump straight into matching pieces.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card/70">
        <div className="container-editorial grid grid-cols-1 gap-6 md:grid-cols-2">
          {materialNotes.map((material) => {
            const product = products.find((item) => item.materials.join(' ').toLowerCase().match(new RegExp(material.query.split(' ').join('|'), 'i')));
            return (
              <motion.article key={material.name} whileHover={{ y: -6 }} className={`border border-border/70 bg-background p-6 ${material.motionClass}`}>
                <p className="mb-2 text-xs uppercase tracking-[0.23em] text-muted-foreground">Material</p>
                <h2 className="mb-3 font-serif text-3xl font-light">{material.name}</h2>
                <p className="mb-3 text-sm text-muted-foreground">{material.mood}</p>
                <p className="mb-6 text-sm">{material.care}</p>
                <Link to={`/collections?q=${encodeURIComponent(material.query)}`} className="text-xs uppercase tracking-[0.2em] underline underline-offset-4">
                  Explore in collections
                </Link>
                {product && (
                  <Link to={`/product/${product.id}`} className="mt-6 block border border-border/60 p-3">
                    <div className="mb-3 aspect-[4/3] overflow-hidden bg-secondary/30">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={handleImageError} />
                    </div>
                    <p className="font-serif text-lg">{product.name}</p>
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

