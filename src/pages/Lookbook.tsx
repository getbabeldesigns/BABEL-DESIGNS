import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/integrations/supabase/catalog';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { formatINR } from '@/lib/currency';
import { handleImageError } from '@/lib/image';

const sectionCopy = [
  {
    id: 'arrival',
    eyebrow: 'Chapter I',
    title: 'Arrival',
    text: 'A threshold of stone and brushed metal. Strong silhouettes create the first impression of calm authority.',
    collection: 'monolith',
  },
  {
    id: 'pause',
    eyebrow: 'Chapter II',
    title: 'Pause',
    text: 'Soft materials and rounded forms compose a slower rhythm for reading, conversation, and evening light.',
    collection: 'stillness',
  },
  {
    id: 'ritual',
    eyebrow: 'Chapter III',
    title: 'Ritual',
    text: 'Daily gestures become ceremonial when every object in the room carries intention and material truth.',
    collection: 'origin',
  },
];

const Lookbook = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Editorial Lookbook</p>
            <h1 className="mb-6 font-serif text-4xl font-light md:text-6xl">Stories You Can Live In</h1>
            <p className="text-muted-foreground">
              A sequential narrative of space. Each chapter pairs atmosphere with pieces you can shop directly.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card/60">
        <div className="container-editorial space-y-20">
          {sectionCopy.map((section) => {
            const picks = products.filter((product) => product.collectionSlug === section.collection).slice(0, 2);
            return (
              <motion.article key={section.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: 0.7 }}>
                <div className="mb-8 max-w-2xl">
                  <p className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{section.eyebrow}</p>
                  <h2 className="mb-3 font-serif text-3xl font-light">{section.title}</h2>
                  <p className="text-muted-foreground">{section.text}</p>
                </div>

                <motion.div variants={staggerContainerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {(isLoading ? Array.from({ length: 2 }) : picks).map((item, index) =>
                    isLoading ? (
                      <div key={`${section.id}-${index}`} className="overflow-hidden border border-border/70 bg-background p-4">
                        <div className="mb-4 aspect-[4/3] animate-pulse bg-muted" />
                        <div className="h-5 w-2/3 animate-pulse bg-muted" />
                      </div>
                    ) : (
                      <motion.div key={item.id} variants={staggerItemVariants} className="overflow-hidden border border-border/70 bg-background p-4">
                        <Link to={`/product/${item.id}`} className="group block">
                          <div className="mb-4 aspect-[4/3] overflow-hidden bg-secondary/40">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" onError={handleImageError} />
                          </div>
                          <p className="font-serif text-2xl font-light">{item.name}</p>
                          <p className="mb-3 text-sm text-muted-foreground">{item.materials.join(' / ')}</p>
                          <p className="text-xs uppercase tracking-[0.2em]">{formatINR(item.price)}</p>
                        </Link>
                      </motion.div>
                    ),
                  )}
                </motion.div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Lookbook;

