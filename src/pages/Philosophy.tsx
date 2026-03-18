import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';
import heroBgImg from '@/assets/hero-bg.jpg';

const Philosophy = () => {
  return (
    <div className="min-h-screen pt-24 md:pt-32">
      <section className="relative min-h-[88vh] overflow-hidden border-y border-border/60">
        <img src={philosophyHero} alt="Babel philosophy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--foreground)/0.84)_10%,hsl(var(--foreground)/0.45)_58%,hsl(var(--foreground)/0.82)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-sans text-xs uppercase tracking-[0.36em] text-primary-foreground/80"
          >
            The House Of Babel
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="mt-4 max-w-4xl font-serif text-4xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl"
          >
            Many voices.
            <br />
            One design language.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-primary-foreground/82"
          >
            This is not our brand statement. It is our origin story: why Babel exists, what it refuses,
            and the standard every piece must meet before it enters a home.
          </motion.p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-editorial grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4"
          >
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">Chapter 01</p>
            <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-4xl">Before Babel</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="space-y-5 lg:col-span-8"
          >
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              We began with a contradiction: the world has infinite styles yet homes increasingly look interchangeable.
              In chasing novelty, furniture became loud but shallow. Rooms lost rhythm. Materials lost dignity.
            </p>
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Babel was founded as a corrective. Not nostalgia. Not minimalism for its own sake.
              A return to disciplined craft where texture, proportion, and silence can coexist.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding border-y border-border/60 bg-card/60">
        <div className="container-editorial grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65 }}
          >
            <img src={monolithCollectionImg} alt="Stone philosophy" className="h-full min-h-[360px] w-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65 }}
          >
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">Chapter 02</p>
            <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-4xl">The Break</h2>
            <p className="mt-5 font-sans text-sm leading-relaxed text-muted-foreground">
              The tower myth is a warning about fragmentation: language divided, intention scattered.
              We treat that story as contemporary. Homes today are full of objects but short on coherence.
            </p>
            <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
              Our response is clear: every object must feel like part of a larger conversation.
              No visual shouting. No isolated statements. A room should read like composed music.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">Chapter 03</p>
            <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-5xl">The Method</h2>
            <p className="mt-6 font-sans text-sm leading-relaxed text-muted-foreground">
              We design with three tests: does it calm the room, does it age with character, and does it still feel true after repetition?
              If any answer is no, it is not ready.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[stillnessCollectionImg, originCollectionImg, heroBgImg].map((img, idx) => (
              <motion.img
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
                src={img}
                alt="Babel method"
                className="h-72 w-full object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding border-y border-border/60 bg-foreground text-primary-foreground">
        <div className="container-editorial grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65 }}
          >
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-primary-foreground/70">Chapter 04</p>
            <h2 className="mt-3 max-w-4xl font-serif text-3xl font-light leading-tight md:text-5xl">
              The Promise:
              <br />
              objects that unify, not compete.
            </h2>
            <p className="mt-6 max-w-3xl font-sans text-sm leading-relaxed text-primary-foreground/82">
              We are building a contemporary Babel where design restores shared clarity.
              A table should gather, not dominate. A chair should hold, not perform.
              A home should feel authored, not assembled.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="border border-primary-foreground/25 bg-primary-foreground/5 p-5"
          >
            <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-primary-foreground/70">Babel Line</p>
            <p className="mt-3 font-serif text-2xl font-light">"Design that brings many worlds into one room."</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-editorial text-center">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground"
          >
            Continue
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-light text-foreground md:text-4xl"
          >
            Experience the philosophy in the collection.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
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
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
