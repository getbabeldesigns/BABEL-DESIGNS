import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import AnimatedSection from '@/components/AnimatedSection';
import {
  staggerContainerVariants,
  staggerItemVariants,
  heroHeadingVariants,
  heroSubheadingVariants,
  heroCTAVariants,
  imageZoomInVariants,
} from '@/lib/animations';
import heroBg from '@/assets/BENCH VIOLA.png';
import monolithImg from '@/assets/monolith-collection.jpg';
import stillnessImg from '@/assets/stillness-collection.jpg';
import originImg from '@/assets/origin-collection.jpg';
import { fetchCollections } from '@/integrations/pocketbase/catalog';
import { createStudioDispatchSubscription } from '@/integrations/pocketbase/studio_dispatch';
import { isPocketBaseConfigured } from '@/integrations/pocketbase/client';
import { trackEvent } from '@/lib/analytics';

const Index = () => {
  const { scrollY } = useScroll();
  const heroOffset = useTransform(scrollY, [0, 600], [0, 90]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
  });

  const fallbackCollections = [
    { slug: 'monolith', name: 'The Monolith Collection', tagline: 'Permanence in form', image: monolithImg },
    { slug: 'stillness', name: 'The Stillness Collection', tagline: 'Quiet refinement', image: stillnessImg },
    { slug: 'origin', name: 'The Origin Series', tagline: 'Return to essence', image: originImg },
  ];

  const previewCollections = collections.length > 0 ? collections : fallbackCollections;

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!trimmed || !isValidEmail) {
      toast.error('Enter a valid email address.');
      return;
    }

    if (!isPocketBaseConfigured) {
      toast.error('PocketBase is not configured yet. Add VITE_POCKETBASE_URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStudioDispatchSubscription({ email: trimmed });
      trackEvent({ event: 'subscribe_success', placement: 'homepage', email_domain: trimmed.split('@')[1] ?? 'unknown' });
      toast.success('Subscribed. Welcome.');
      setEmail('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe';
      trackEvent({ event: 'subscribe_failed', placement: 'homepage' });
      toast.error(message);
    } finally {
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden section-transition">
        <motion.div variants={imageZoomInVariants} initial="hidden" animate="visible" className="absolute inset-0" style={{ y: heroOffset }}>
          <img src={heroBg} alt="Babel Designs architectural interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/65" />
        </motion.div>

        <motion.div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6" variants={staggerContainerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={heroHeadingVariants} className="logo-title mb-3 text-3xl font-light tracking-[0.14em] text-primary-foreground sm:text-5xl sm:tracking-wide md:text-7xl lg:text-7xl">
            BABEL DESIGNS
          </motion.h1>

          <motion.p variants={heroSubheadingVariants} className="mx-auto mb-8 max-w-2xl font-sans text-xs uppercase leading-relaxed tracking-[0.22em] text-primary-foreground/80 sm:text-sm sm:tracking-[0.3em] md:text-base md:tracking-[0.35em]">
            Crafted for all, Owned by few.
          </motion.p>

          <motion.div variants={heroCTAVariants} className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <motion.div whileHover={{ scale: 0.9 }} whileTap={{ scale: 0.78 }} className="w-full sm:w-auto">
              <Link to="/collections" data-cursor="Explore" className="group flex w-full items-center justify-center gap-3 border border-primary-foreground/40 px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all duration-500 hover:bg-primary-foreground hover:text-foreground sm:w-auto sm:px-8 sm:py-4 sm:text-sm sm:tracking-widest">
                Explore Collections
                <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 0.9 }} whileTap={{ scale: 0.78 }} className="w-full sm:w-auto">
              <Link to="/consultancy" data-cursor="Book" className="group flex w-full items-center justify-center gap-3 border border-primary-foreground/40 px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all duration-500 hover:bg-primary-foreground hover:text-foreground sm:w-auto sm:px-8 sm:py-4 sm:text-sm sm:tracking-widest">
                Book Consultancy
                <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }} className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-px h-16 bg-gradient-to-b from-primary-foreground/50 to-transparent" />
        </motion.div>
      </section>

      <section className="section-padding section-transition">
        <div className="container-editorial">
          <motion.div variants={staggerContainerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {previewCollections.map((collection) => (
              <motion.div key={collection.slug} variants={staggerItemVariants}>
                <Link to={`/collections/${collection.slug}`} className="group block card-hover-lift" data-cursor="View">
                  <motion.div className="aspect-[4/5] overflow-hidden mb-6 relative">
                    <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </motion.div>
                  <div className="h-px w-0 bg-foreground/45 transition-all duration-500 group-hover:w-20 mb-4" />
                  <motion.h3 className="font-serif text-xl font-light text-foreground mb-2 group-hover:text-muted-foreground transition-colors" whileHover={{ x: 4 }}>
                    {collection.name}
                  </motion.h3>
                  <p className="font-sans text-sm text-muted-foreground">{collection.tagline}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <AnimatedSection className="text-center mt-16">
            <Link to="/collections" data-cursor="Browse" className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-foreground border-b border-foreground/30 pb-2 hover:border-foreground transition-colors">
              View All Collections
              <ArrowRight size={14} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding pt-6 section-transition">
        <div className="container-editorial">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-overline mb-3">Lookbook</p>
              <h2 className="section-title">Composed Spaces</h2>
            </div>
            <p className="section-copy max-w-xl">A visual study in proportion, texture, and atmosphere. Scroll horizontally to explore curated moments.</p>
          </div>

          <div className="lookbook-snap flex gap-6 overflow-x-auto pb-4">
            {[
              { img: monolithImg, title: 'Stone Presence' },
              { img: stillnessImg, title: 'Quiet Materiality' },
              { img: originImg, title: 'Raw Geometry' },
              { img: heroBg, title: 'Layered Interiors' },
            ].map((item) => (
              <div key={item.title} className="lookbook-item group relative min-w-[86vw] md:min-w-[48vw] lg:min-w-[36vw] card-hover-lift">
                <div className="aspect-[16/10] overflow-hidden border border-border/70 bg-card/50">
                  <img src={item.img} alt={item.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-serif text-xl text-foreground">{item.title}</p>
                  <span className="section-overline">Edition</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pt-8">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { title: 'Handcrafted Materials', copy: 'Solid wood, natural stone, and precision metalwork from trusted ateliers.' },
              { title: 'Made to Order', copy: 'Each piece is crafted per order for lasting quality and intentional detail.' },
              { title: 'Global Design Language', copy: 'Forms designed to fit diverse spaces while preserving a quiet luxury mood.' },
            ].map((item) => (
              <div key={item.title} className="border border-border/60 bg-card/60 p-6">
                <p className="mb-3 font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">{item.title}</p>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-card section-transition">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">Our Philosophy</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-8">
                Design has no language,<br />
                no boundaries, no culture.
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Inspired by the Tower of Babel, we believe in design that unites rather than divides.
                Each piece speaks a universal language of form, material, and intention -
                understood across all cultures and eras.
              </p>
              <Link to="/philosophy" data-cursor="Read" className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-foreground border-b border-foreground/30 pb-2 hover:border-foreground transition-colors">
                Read Our Philosophy
                <ArrowRight size={14} />
              </Link>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="relative">
              <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                <div className="text-center p-12">
                  <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
                    "Minimalism achieved through integration,<br />
                    not removal."
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/60">
        <div className="container-editorial">
          <div className="mb-10 text-center">
            <p className="section-overline mb-3">Client Notes</p>
            <h2 className="section-title">Trusted by private residences and boutique hospitality projects</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { quote: 'Every proportion felt intentional. The room became quieter and stronger at once.', author: 'Private Residence, Mumbai' },
              { quote: 'The consultancy translated our concept into a coherent furniture language.', author: 'Hospitality Studio, Dubai' },
              { quote: 'Material quality and finishing exceeded expectations. Delivery communication was excellent.', author: 'Collector, Bengaluru' },
            ].map((item) => (
              <div key={item.author} className="border border-border bg-background p-6">
                <p className="font-serif text-lg text-foreground leading-relaxed">"{item.quote}"</p>
                <p className="mt-4 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-foreground text-primary-foreground section-transition">
        <div className="container-editorial text-center">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light mb-8 leading-tight">
              Design that unites<br />
              all diversities.
            </h2>
            <p className="mx-auto mb-6 max-w-2xl font-sans text-sm uppercase tracking-[0.3em] text-primary-foreground/70">Subscribe for updates</p>
            <form onSubmit={handleSubscribe} className="mx-auto mb-8 flex max-w-xl flex-col gap-4 sm:flex-row">
              <label htmlFor="home-subscribe-email" className="sr-only">Email address</label>
              <input id="home-subscribe-email" type="email" placeholder="your@email.com" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 flex-1 border border-primary-foreground/30 bg-transparent px-4 font-sans text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground focus:outline-none" />
              <button type="submit" data-cursor="Join" disabled={isSubmitting} className="h-12 border border-primary-foreground/40 px-6 font-sans text-xs uppercase tracking-[0.25em] text-primary-foreground transition-all duration-500 hover:bg-primary-foreground hover:text-foreground disabled:opacity-60">
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            <Link to="/consultancy" data-cursor="Start" className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Prefer a direct project conversation
              <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <div className="px-4 pb-8 md:hidden">
        <div className="mx-auto max-w-md border border-foreground/20 bg-background/95 p-3 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Need a custom space plan?</p>
            <Link to="/consultancy" className="inline-flex items-center gap-1 border border-foreground/30 px-3 py-2 text-[10px] uppercase tracking-[0.14em] hover:bg-foreground hover:text-background transition-colors">
              Book Now
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
