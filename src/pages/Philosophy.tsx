import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';

const principles = [
  {
    id: '01',
    title: 'Universal Form',
    copy: 'We shape objects that read clearly across cultures through proportion, clarity, and calm presence.',
  },
  {
    id: '02',
    title: 'Material Truth',
    copy: 'Stone should feel grounded, wood should feel alive, and metal should age with character.',
  },
  {
    id: '03',
    title: 'Quiet Precision',
    copy: 'Luxury is measured by restraint, alignment, and the confidence to remove visual noise.',
  },
  {
    id: '04',
    title: 'Longevity',
    copy: 'Every detail is designed to improve through use, not fade after the first season.',
  },
];

const chapters = [
  {
    title: 'Stone as anchor',
    copy: 'A monolithic silhouette stabilizes the room and gives architecture a place to rest.',
    image: monolithCollectionImg,
  },
  {
    title: 'Softness as balance',
    copy: 'Textiles and timber introduce warmth, absorb sound, and slow the rhythm of movement.',
    image: stillnessCollectionImg,
  },
  {
    title: 'Raw as clarity',
    copy: 'Honest texture and visible structure keep each piece direct, legible, and timeless.',
    image: originCollectionImg,
  },
];

const Philosophy = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen pt-28 md:pt-36">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden border border-border/60 bg-background"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative lg:col-span-7">
                <img src={philosophyHero} alt="Babel philosophy" className="h-full min-h-[420px] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/55 via-foreground/28 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                  <p className="font-sans text-xs uppercase tracking-[0.3em] text-primary-foreground/80">Babel Philosophy</p>
                  <h1 className="mt-3 max-w-3xl font-serif text-4xl font-light leading-tight text-primary-foreground md:text-6xl">
                    Design that translates without words.
                  </h1>
                </div>
              </div>

              <div className="relative border-t border-border/60 bg-background/90 p-8 lg:col-span-5 lg:border-l lg:border-t-0 md:p-10">
                <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Manifesto</p>
                <p className="mt-5 font-sans text-sm leading-relaxed text-muted-foreground">
                  Our work is guided by one belief: design should feel intelligible to anyone, anywhere.
                  Not because it is generic, but because it is honest.
                </p>
                <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
                  We reject spectacle as strategy. We focus on durable forms, calibrated scale, and materials
                  that deepen with time.
                </p>
                <div className="mt-8 border-l border-foreground/30 pl-4">
                  <p className="font-serif text-2xl font-light text-foreground">"Craft without noise."</p>
                  <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Core Position
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card/70">
        <div className="container-editorial">
          <AnimatedSection>
            <div className="mb-10 flex items-end justify-between gap-6 border-b border-border/60 pb-5">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Principles</p>
                <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-4xl">How we decide</h2>
              </div>
              <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">04 Foundations</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {principles.map((item, index) => (
              <AnimatedSection key={item.id} delay={index * 0.08}>
                <article className="group relative overflow-hidden border border-border/70 bg-background p-6 transition-transform hover:-translate-y-1">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_35%_30%,hsl(var(--foreground)/0.08),transparent_68%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <p className="font-sans text-[10px] uppercase tracking-[0.26em] text-muted-foreground">{item.id}</p>
                  <h3 className="mt-3 font-serif text-2xl font-light text-foreground">{item.title}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial">
          <AnimatedSection>
            <div className="mb-10 text-center">
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Material Chapters</p>
              <h2 className="mt-4 font-serif text-3xl font-light text-foreground md:text-4xl">A restrained spectrum</h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {chapters.map((chapter, index) => (
              <AnimatedSection key={chapter.title} delay={index * 0.1}>
                <article className="group overflow-hidden border border-border/70 bg-card/70">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={chapter.image}
                      alt={chapter.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-2xl font-light text-foreground">{chapter.title}</h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">{chapter.copy}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-foreground text-primary-foreground">
        <div className="container-editorial">
          <AnimatedSection>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-sans text-xs uppercase tracking-[0.28em] text-primary-foreground/70">Closing Note</p>
              <h2 className="mt-4 font-serif text-3xl font-light leading-tight md:text-5xl">
                What once divided us can now be connected through design.
              </h2>
              <p className="mt-6 font-sans text-sm leading-relaxed text-primary-foreground/80">
                A well-resolved object does not ask where you are from. It asks how you live. That is the
                language we continue to build.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial text-center">
          <AnimatedSection>
            <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">Continue the journey</h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/collections"
                className="inline-flex items-center gap-3 border border-foreground/35 px-8 py-4 font-sans text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Explore Collections
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/consultancy"
                className="inline-flex items-center gap-3 border border-border/70 px-8 py-4 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                Book Consultancy
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
