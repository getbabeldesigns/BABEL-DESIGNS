import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';
import heroBgImg from '@/assets/hero-bg.jpg';

const sequence = [
  {
    chapter: 'I',
    title: 'The Fracture',
    text: 'The Babel legend is often remembered as division: many tongues, scattered intentions, unfinished architecture. We begin there, where coherence collapsed.',
  },
  {
    chapter: 'II',
    title: 'The Material Oath',
    text: 'When language fails, material remains honest. Stone, timber, and metal still communicate weight, warmth, and precision without translation.',
  },
  {
    chapter: 'III',
    title: 'The Quiet Syntax',
    text: 'Proportion becomes grammar. Edges become punctuation. Light becomes rhythm. Design becomes the sentence that every culture can still read.',
  },
  {
    chapter: 'IV',
    title: 'The New Tower',
    text: 'We do not rebuild a monument to height. We build a daily architecture of belonging, one table, one chair, one room at a time.',
  },
];

const acts = [
  {
    heading: 'Stone Presence',
    body: 'In ancient cities, stone encoded memory. Today it anchors modern rooms with the same calm authority, reminding us that permanence can be intimate.',
    image: monolithCollectionImg,
    align: 'left',
  },
  {
    heading: 'Stillness In Timber',
    body: 'Wood carries human temperature. It softens hard geometry and turns architecture into habitat, restoring the domestic scale of design.',
    image: stillnessCollectionImg,
    align: 'right',
  },
  {
    heading: 'Origin Of Form',
    body: 'Raw geometry and visible structure return dignity to objects. We remove spectacle and keep only what remains meaningful over time.',
    image: originCollectionImg,
    align: 'left',
  },
];

const Philosophy = () => {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const manifestoRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const { scrollYProgress: manifestoProgress } = useScroll({
    target: manifestoRef,
    offset: ['start end', 'end start'],
  });

  const heroImageY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, 95]);
  const heroContentY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, -45]);
  const manifestoImageY = useTransform(manifestoProgress, [0, 1], reduceMotion ? [0, 0] : [55, -55]);

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-32">
      <section ref={heroRef} className="relative min-h-[88vh] overflow-hidden border-y border-border/60">
        <motion.img
          src={philosophyHero}
          alt="Babel philosophy atmosphere"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ y: heroImageY }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,hsl(var(--foreground)/0.78)_8%,hsl(var(--foreground)/0.46)_50%,hsl(var(--foreground)/0.75)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,hsl(var(--sand)/0.22),transparent_37%),radial-gradient(circle_at_84%_82%,hsl(var(--clay)/0.2),transparent_45%)]" />

        <motion.div
          className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-end px-6 pb-14 md:px-10 md:pb-20"
          style={{ y: heroContentY }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-primary-foreground/80">Babel Philosophy</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
            A story where design
            <br />
            becomes a shared language.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-primary-foreground/82">
            This page is not an overview. It is a narrative. A movement from fracture to form,
            from noise to clarity, from object to meaning.
          </p>
        </motion.div>
      </section>

      <section className="section-padding">
        <div className="container-editorial">
          <div className="mx-auto max-w-4xl">
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Opening Statement</p>
            <h2 className="mt-5 font-serif text-3xl font-light leading-tight text-foreground md:text-5xl">
              We design for what remains when trends disappear.
            </h2>
            <p className="mt-6 font-sans text-sm leading-relaxed text-muted-foreground">
              Babel Designs treats furniture as cultural architecture in miniature. Each piece is shaped to outlive novelty,
              hold emotional weight, and remain legible across geographies. We are not interested in fashionable signals.
              We are interested in lasting form.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/70">
        <div className="container-editorial">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-border/60 pb-5">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">Narrative Sequence</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-4xl">Four movements</h2>
            </div>
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">From myth to modernity</p>
          </div>

          <div className="space-y-10">
            {sequence.map((item, index) => (
              <motion.article
                key={item.chapter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-90px' }}
                transition={{ duration: 0.55, delay: index * 0.04 }}
                className="grid grid-cols-1 gap-4 border-l border-foreground/20 pl-5 md:grid-cols-[80px_1fr] md:pl-8"
              >
                <p className="font-serif text-3xl font-light text-foreground/35">{item.chapter}</p>
                <div>
                  <h3 className="font-serif text-2xl font-light text-foreground md:text-3xl">{item.title}</h3>
                  <p className="mt-3 max-w-3xl font-sans text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial space-y-16">
          {acts.map((act, index) => (
            <motion.section
              key={act.heading}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 gap-8 border-y border-border/60 py-10 md:grid-cols-12"
            >
              <div className={`md:col-span-7 ${act.align === 'right' ? 'md:order-2' : ''}`}>
                <div className="relative overflow-hidden border border-border/60">
                  <img src={act.image} alt={act.heading} className="h-full min-h-[320px] w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
              </div>
              <div className={`flex items-center md:col-span-5 ${act.align === 'right' ? 'md:order-1' : ''}`}>
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Act {index + 1}</p>
                  <h3 className="mt-3 font-serif text-3xl font-light leading-tight text-foreground md:text-4xl">{act.heading}</h3>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">{act.body}</p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </section>

      <section ref={manifestoRef} className="relative overflow-hidden border-y border-border/60 bg-foreground py-20 md:py-28">
        <motion.img
          src={heroBgImg}
          alt="Babel manifesto"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          style={{ y: manifestoImageY }}
        />
        <div className="absolute inset-0 bg-foreground/78" />

        <div className="container-editorial relative z-10 text-center">
          <p className="font-sans text-xs uppercase tracking-[0.33em] text-primary-foreground/70">Manifesto</p>
          <h2 className="mx-auto mt-5 max-w-4xl font-serif text-3xl font-light leading-tight text-primary-foreground md:text-5xl">
            Our work is a response to fragmentation.
            <br />
            We design so people can feel aligned again.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl font-sans text-sm leading-relaxed text-primary-foreground/82">
            Through disciplined proportion, restrained material palettes, and durable craft,
            we offer objects that do not demand attention yet continue to matter over time.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial text-center">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Continuation</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-light text-foreground md:text-4xl">
            Enter the collections to experience the philosophy in object form.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/collections"
              className="inline-flex items-center gap-3 border border-foreground/35 px-7 py-4 font-sans text-xs uppercase tracking-[0.24em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Explore Collections
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/consultancy"
              className="inline-flex items-center gap-3 border border-border/70 px-7 py-4 font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Book Consultancy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
