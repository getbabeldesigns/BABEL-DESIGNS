import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';
import heroBgImg from '@/assets/hero-bg.jpg';
import homepageBgImg from '@/assets/homepagebg.jpeg';

const timeline = [
  {
    year: 'c. 3100 BCE',
    title: 'Origins Of Built Ritual',
    text: 'From river-valley settlements to early courts, furniture began as architecture in miniature: raised platforms, carved stools, and ceremonial tables.',
  },
  {
    year: 'c. 1600 BCE',
    title: 'Craft As Civic Language',
    text: 'Material and form became social symbols. Joinery, stone carving, and bronze casting carried both function and cultural memory.',
  },
  {
    year: 'c. 600 BCE',
    title: 'Proportion As Philosophy',
    text: 'Classical builders translated geometry into daily objects. Balance, rhythm, and measured proportion became ethical as well as aesthetic choices.',
  },
  {
    year: 'Now',
    title: 'Babel Reframed',
    text: 'We inherit this long tradition and distill it into contemporary forms that remain timeless in posture, texture, and use.',
  },
];

const chapters = [
  {
    title: 'The Tower Reimagined',
    image: philosophyHero,
    copy: 'The historic Babel story is often told as a story of separation. We reinterpret it as a call to rebuild shared language through design: tangible, calm, and human.',
  },
  {
    title: 'Stone And Permanence',
    image: monolithCollectionImg,
    copy: 'Ancient monuments taught us that mass can communicate dignity. Our stone vocabulary keeps that lesson, translating permanence into contemporary interiors.',
  },
  {
    title: 'Timber And Domestic Warmth',
    image: stillnessCollectionImg,
    copy: 'Across eras, wood has carried domestic life: shelter, continuity, and touch. We use timber for warmth, softness, and visual stillness.',
  },
  {
    title: 'Raw Geometry',
    image: originCollectionImg,
    copy: 'Historic craft left traces of hand and tool. We preserve that honesty with clear silhouettes, visible material behavior, and disciplined detailing.',
  },
];

const Philosophy = () => {
  return (
    <div className="min-h-screen pt-28 md:pt-36">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden border border-border/70 bg-background"
          >
            <img src={philosophyHero} alt="Historic philosophy" className="h-[72vh] w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--foreground)/0.72)_8%,hsl(var(--foreground)/0.38)_52%,hsl(var(--foreground)/0.62)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--sand)/0.2),transparent_35%),radial-gradient(circle_at_80%_80%,hsl(var(--clay)/0.18),transparent_42%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
              <p className="font-sans text-xs uppercase tracking-[0.34em] text-primary-foreground/85">Historic Philosophy</p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
                A living archive of craft, memory, and material truth.
              </h1>
              <p className="mt-5 max-w-2xl font-sans text-sm leading-relaxed text-primary-foreground/80">
                Our philosophy begins in ancient craft traditions and moves into contemporary life without losing depth, restraint, or human scale.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card/80">
        <div className="container-editorial">
          <AnimatedSection>
            <div className="mb-10 border-b border-border/70 pb-6">
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Chronicle</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-5xl">The long history behind our forms</h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {timeline.map((item, index) => (
              <AnimatedSection key={item.year} delay={index * 0.08}>
                <article className="relative overflow-hidden border border-border/70 bg-background p-6">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--foreground)/0.08),transparent_70%)]" />
                  <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{item.year}</p>
                  <h3 className="mt-3 font-serif text-2xl font-light text-foreground">{item.title}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">{item.text}</p>
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
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">Historic Gallery</p>
              <h2 className="mt-4 font-serif text-3xl font-light text-foreground md:text-5xl">Image chapters and design arts</h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {chapters.map((chapter, index) => (
              <AnimatedSection key={chapter.title} delay={index * 0.1}>
                <article className="group overflow-hidden border border-border/70 bg-card/70">
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <img
                      src={chapter.image}
                      alt={chapter.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-3xl font-light text-foreground">{chapter.title}</h3>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">{chapter.copy}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-foreground text-primary-foreground">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <AnimatedSection className="lg:col-span-7">
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-primary-foreground/70">Declaration</p>
              <h2 className="mt-4 font-serif text-3xl font-light leading-tight md:text-5xl">
                What history divided,
                <br />
                design can reunite.
              </h2>
              <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-primary-foreground/80">
                We believe furniture is not only utility. It is continuity. It carries inherited wisdom from stone halls,
                old workshops, and lived domestic rituals into present-day homes.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.15} className="lg:col-span-5">
              <div className="overflow-hidden border border-primary-foreground/30">
                <img src={heroBgImg} alt="Historic interior" className="h-full w-full object-cover" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <AnimatedSection>
              <div className="overflow-hidden border border-border/70">
                <img src={homepageBgImg} alt="Babel historic art" className="h-full w-full object-cover" />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Continue</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-4xl">Explore the collection archive</h2>
              <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
                Step from philosophy into objects. Each piece extends this historical dialogue through material, proportion, and use.
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
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
