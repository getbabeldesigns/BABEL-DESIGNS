import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { imageZoomInVariants, heroHeadingVariants } from '@/lib/animations';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import { useEffect, useState } from 'react';




const Philosophy = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const { scrollY } = useScroll();
  const enableHeroMotion = !prefersReducedMotion && !isCoarsePointer;
  const heroOffset = useTransform(scrollY, [0, 500], enableHeroMotion ? [0, 70] : [0, 0]);

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const sync = () => setIsCoarsePointer(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const materialPalette = [
    { name: 'Linen Stone', tone: 'bg-[hsl(var(--linen))]' },
    { name: 'Warm Sand', tone: 'bg-[hsl(var(--sand))]' },
    { name: 'Muted Clay', tone: 'bg-[hsl(var(--clay))]' },
    { name: 'Aged Wood', tone: 'bg-[hsl(var(--wood))]' },
  ];

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden mb-20 section-transition">
        <motion.div
          variants={enableHeroMotion ? imageZoomInVariants : undefined}
          initial={enableHeroMotion ? "hidden" : false}
          animate={enableHeroMotion ? "visible" : false}
          className="absolute inset-0"
          style={{ y: heroOffset }}
        >
          <img
            src={philosophyHero}
            alt="Tower of Babel reimagined"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 text-center px-6"
        >
          <motion.h1
            variants={heroHeadingVariants}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground mb-6"
          >
            Our Philosophy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="font-serif text-lg md:text-xl text-primary-foreground/90"
          >
            Design that transcends
          </motion.p>
        </motion.div>
      </section>

      {/* What Babel Stands For */}
      <section className="section-padding section-transition">
        <div className="container-editorial">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                What We Believe
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8 leading-tight">
                Design has no language,<br />
                no boundaries, no culture.
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                At Babel Designs, we believe that true design speaks universally. It doesn't require 
                translation, explanation, or context. When a form is honest and a material is respected, 
                the result transcends boundaries.
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                We create furniture that feels equally at home in Tokyo, Lagos, São Paulo, or Stockholm. 
                Not because we design for everywhere, but because we design for everyone — 
                honoring the shared human appreciation for craft, proportion, and material truth.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Muted Luxury */}
      <section className="section-padding bg-card section-transition">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Muted Luxury
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8 leading-tight">
                Luxury without shine.
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                We reject the notion that luxury must announce itself. Our pieces don't seek attention — 
                they earn it. Through exceptional materials, meticulous craftsmanship, and timeless form.
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                A Babel piece grows more beautiful with age. The leather softens, the bronze develops 
                patina, the wood tells stories. This is luxury that improves, not depreciates.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="aspect-square bg-secondary/30 flex items-center justify-center p-12">
                <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed text-center">
                  "Craft without ornament.<br />
                  Presence without pretense."
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Material Palette */}
      <section className="section-padding section-transition">
        <div className="container-editorial">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="section-overline mb-4">Material Palette</p>
            <h2 className="section-title mb-6">A restrained spectrum</h2>
            <p className="section-copy">
              We work within a narrow tonal family so texture and proportion lead the conversation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {materialPalette.map((item) => (
              <div key={item.name} className="group card-hover-lift">
                <div className={`h-40 border border-border ${item.tone}`} />
                <p className="mt-4 font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimalism Through Integration */}
      <section className="section-padding section-transition">
        <div className="container-editorial">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Our Approach
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8 leading-tight">
                Minimalism through integration,<br />
                not removal.
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                Many confuse minimalism with emptiness — stripping away until nothing remains. 
                We take the opposite approach. We absorb complexity, integrate function, 
                and achieve simplicity through thoughtful inclusion.
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                A Babel dining table isn't simple because it lacks features. It's simple because 
                every element — the joinery, the grain direction, the edge profile — has been 
                considered and resolved. Complexity integrated, simplicity achieved.
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                This is minimalism that feels complete, not lacking. Minimal in expression, 
                maximal in consideration.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Tower of Babel */}
      <section className="section-padding bg-foreground text-primary-foreground section-transition">
        <div className="container-editorial">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary-foreground/70 mb-6">
                The Tower of Babel — Reimagined
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-8 leading-tight">
                What divided us then<br />
                unites us now.
              </h2>
              <p className="font-sans text-primary-foreground/80 leading-relaxed mb-6">
                The ancient Tower of Babel story speaks of division — humanity scattered, 
                languages confused, understanding lost. Our brand reimagines this narrative.
              </p>
              <p className="font-sans text-primary-foreground/80 leading-relaxed mb-6">
                We believe design can be the universal language that the tower builders sought. 
                A chair crafted from honest materials and true proportion needs no translation. 
                A table that gathers families speaks in every tongue.
              </p>
              <p className="font-serif text-xl md:text-2xl mt-12">
                "Design that unites all diversities."
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding section-transition">
        <div className="container-editorial text-center">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">
              Ready to begin?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/collections"
                data-cursor="Explore"
                className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-foreground border border-foreground/30 px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Explore Collections
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/consultancy"
                data-cursor="Book"
                className="inline-flex items-center gap-3 font-sans text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
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

