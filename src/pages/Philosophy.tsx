import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';
import heroBgImg from '@/assets/hero-bg.jpg';
import homepageBgImg from '@/assets/homepagebg.jpeg';

const timeline = [
  {
    era: 'c. 3000 BCE',
    title: 'First Monuments, First Memory',
    copy: 'In early cities, stone and timber became cultural memory. Furniture was not decoration but structure, ritual, and shared civic life.',
  },
  {
    era: 'c. 1700 BCE',
    title: 'Babel As Mythic Turning Point',
    copy: 'The tower story speaks of broken language and fragmented understanding. Babel Designs takes this fracture as a design challenge for our age.',
  },
  {
    era: 'Classical Eras',
    title: 'Proportion Becomes Ethics',
    copy: 'Geometry, rhythm, and material restraint formed an ethical grammar. What is balanced looks calm, and what is calm invites human presence.',
  },
  {
    era: 'Industrial To Modern',
    title: 'Speed Versus Craft',
    copy: 'As production accelerated, many objects lost intimacy. Our position is a return to deliberate making where time is visible in the result.',
  },
  {
    era: 'Babel Today',
    title: 'A Shared Design Language',
    copy: 'We shape contemporary objects that carry historic discipline while remaining deeply livable in modern homes.',
  },
];

const chapters = [
  {
    image: monolithCollectionImg,
    heading: 'Stone: The Language Of Permanence',
    text: 'Ancient builders trusted mass to communicate dignity. We continue that lineage through grounded silhouettes, mineral textures, and structural calm.',
  },
  {
    image: stillnessCollectionImg,
    heading: 'Timber: The Language Of Warmth',
    text: 'Across centuries, wood has carried domestic ritual. It softens hard architecture and turns rooms into places people inhabit, not just pass through.',
  },
  {
    image: originCollectionImg,
    heading: 'Raw Form: The Language Of Truth',
    text: 'Historic craft left visible traces of process. We preserve that honesty: clear joints, disciplined geometry, and materials that are never over-styled.',
  },
];

const Philosophy = () => {
  const prefersReducedMotion = useReducedMotion();
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

  const heroImageY = useTransform(heroProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 120]);
  const heroTextY = useTransform(heroProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -60]);
  const manifestoImageY = useTransform(manifestoProgress, [0, 1], prefersReducedMotion ? [0, 0] : [60, -60]);

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-32">
      <section ref={heroRef} className="relative min-h-[85vh] overflow-hidden border-y border-border/60">
        <motion.img
          src={philosophyHero}
          alt="Historic Babel mood"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ y: heroImageY }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--foreground)/0.76)_10%,hsl(var(--foreground)/0.42)_55%,hsl(var(--foreground)/0.74)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,hsl(var(--sand)/0.22),transparent_38%),radial-gradient(circle_at_82%_80%,hsl(var(--clay)/0.2),transparent_44%)]" />

        <motion.div
          className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col justify-end px-6 pb-12 md:px-10 md:pb-16"
          style={{ y: heroTextY }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.34em] text-primary-foreground/80">Historic Philosophy</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
            The history of Babel,
            <br />
            retold through design.
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-sm leading-relaxed text-primary-foreground/82">
            Not a trend story. A civilizational one. From ancient monuments to contemporary interiors,
            this is the long arc behind our forms.
          </p>
        </motion.div>
      </section>

      <section className="section-padding">
        <div className="container-editorial">
          <div className="mx-auto max-w-4xl border-l border-foreground/30 pl-6 md:pl-10">
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Prologue</p>
            <p className="mt-6 font-serif text-3xl font-light leading-relaxed text-foreground md:text-5xl">
              The tower narrative was never only about height.
              It was about language, belonging, and the desire to build together.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-muted-foreground">
              Babel Designs reclaims that story by asking a simple question: what if objects could restore
              shared understanding? We believe furniture can do exactly that when proportion is clear,
              materials are honest, and craft remains visible.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/70">
        <div className="container-editorial">
          <p className="mb-8 font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">Chronology</p>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute left-0 top-0 h-full w-px bg-border/80 md:left-[170px]" />
            <div className="space-y-10">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.era}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, delay: index * 0.05 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-[150px_1fr] md:gap-8"
                >
                  <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground md:pt-1">{item.era}</p>
                  <div className="relative pb-4 md:pl-8">
                    <span className="absolute -left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-foreground md:left-[-33px]" />
                    <h3 className="font-serif text-2xl font-light text-foreground md:text-3xl">{item.title}</h3>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial space-y-14">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.heading}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.65 }}
              className="grid grid-cols-1 gap-6 border-y border-border/60 py-10 md:grid-cols-12 md:gap-8"
            >
              <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <img src={chapter.image} alt={chapter.heading} className="h-full min-h-[280px] w-full object-cover" />
              </div>
              <div className={`flex items-center md:col-span-5 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Material Chapter</p>
                  <h3 className="mt-3 font-serif text-3xl font-light leading-tight text-foreground md:text-4xl">{chapter.heading}</h3>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">{chapter.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section ref={manifestoRef} className="relative overflow-hidden border-y border-border/60 bg-foreground py-20 text-primary-foreground md:py-28">
        <motion.img
          src={heroBgImg}
          alt="Historic interior view"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          style={{ y: manifestoImageY }}
        />
        <div className="absolute inset-0 bg-foreground/75" />

        <div className="container-editorial relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-primary-foreground/70">Manifesto</p>
            <p className="mt-6 font-serif text-3xl font-light leading-tight md:text-5xl">
              What was once a story of division
              <br />
              becomes a practice of unity.
            </p>
            <p className="mx-auto mt-6 max-w-3xl font-sans text-sm leading-relaxed text-primary-foreground/82">
              We design for cultural translation without dilution. We keep form legible, texture truthful,
              and detail disciplined so each object can belong in different places while retaining its core integrity.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <img src={homepageBgImg} alt="Babel visual narrative" className="h-full min-h-[300px] w-full object-cover" />
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Epilogue</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-4xl">Continue the historical journey</h2>
              <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
                Explore collections that carry this philosophy into everyday living through material integrity,
                long-term relevance, and quiet architectural presence.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
