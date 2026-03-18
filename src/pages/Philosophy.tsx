import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import philosophyHero from '@/assets/philosophy-hero.jpg';
import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';
import heroBgImg from '@/assets/hero-bg.jpg';

const timeline = [
  {
    era: 'c. 3000 BCE',
    title: 'Ritual Furniture Emerges',
    body: 'Early settlements shaped stone slabs, stools, and raised platforms as civic and domestic artifacts. Utility and symbolism were never separate domains.',
  },
  {
    era: 'c. 1700 BCE',
    title: 'The Babel Motif',
    body: 'The tower myth carried a warning about fractured language. We reinterpret it as a design invitation: rebuild shared meaning through form and craft.',
  },
  {
    era: 'Classical Eras',
    title: 'Geometry As Conduct',
    body: 'Measured proportion became an ethical system. Balance was not decoration; it was a way of creating calm relations between body, object, and space.',
  },
  {
    era: 'Industrial Shift',
    title: 'Speed, Then Silence',
    body: 'Mechanized production scaled output but often flattened character. Our work restores slowness where hand, texture, and material aging remain legible.',
  },
  {
    era: 'Contemporary Babel',
    title: 'A Shared Design Grammar',
    body: 'We build objects that travel across geographies without losing identity: restrained, durable, and emotionally grounded in historic continuity.',
  },
];

const plates = [
  {
    image: monolithCollectionImg,
    heading: 'Plate I: Stone And Endurance',
    text: 'Monumental stone taught architecture how to remember. We retain that memory with grounded silhouettes and mineral tactility.',
  },
  {
    image: stillnessCollectionImg,
    heading: 'Plate II: Timber And Human Warmth',
    text: 'Wood has always carried domestic life. It introduces warmth, softness, and lived intimacy into disciplined interiors.',
  },
  {
    image: originCollectionImg,
    heading: 'Plate III: Raw Geometry',
    text: 'Visible structure and honest joints keep objects intelligible. Clarity is how we preserve trust between maker and user.',
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

  const { scrollYProgress: manifestProgress } = useScroll({
    target: manifestoRef,
    offset: ['start end', 'end start'],
  });

  const heroY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, 110]);
  const headingY = useTransform(heroProgress, [0, 1], reduceMotion ? [0, 0] : [0, -55]);
  const manifestY = useTransform(manifestProgress, [0, 1], reduceMotion ? [0, 0] : [65, -55]);

  return (
    <div className="min-h-screen pt-24 md:pt-32" style={{ backgroundColor: '#f2e8d8' }}>
      <section ref={heroRef} className="relative min-h-[86vh] overflow-hidden border-y border-black/20">
        <motion.img src={philosophyHero} alt="Historic Babel" className="absolute inset-0 h-full w-full object-cover" style={{ y: heroY }} />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(38,27,19,0.86)_8%,rgba(58,41,28,0.52)_55%,rgba(33,23,16,0.85)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(196,158,103,0.23),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(155,108,70,0.2),transparent_44%)]" />

        <motion.div className="relative z-10 mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-end px-6 pb-14 md:px-10 md:pb-20" style={{ y: headingY }}>
          <p className="font-sans text-xs uppercase tracking-[0.34em] text-[#eadac2]">Museum Chronicle</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-tight text-[#f9efe0] md:text-6xl lg:text-7xl">
            The History Of Babel,
            <br />
            Told Through Matter.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-[#efe2cf]">
            This page is an exhibit. A chronological narrative of how ritual, craft, and proportion became the core language behind Babel Designs.
          </p>
        </motion.div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#efe3d2' }}>
        <div className="container-editorial">
          <div className="mx-auto max-w-4xl border border-black/20 bg-[#f7ecdc] p-7 md:p-10">
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#6a4d31]">Prologue</p>
            <div className="my-5 h-px w-16 bg-[#8c6a49]" />
            <p className="font-serif text-3xl font-light leading-relaxed text-[#2f2015] md:text-5xl">
              The Babel narrative was never only about height.
              It was about language, collective memory, and the desire to build meaning together.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-[#4b3625]">
              We inherit this ancient tension and resolve it through furniture. Each object is designed as a bridge between eras: historical in discipline, contemporary in use, and human in scale.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f4e9d9' }}>
        <div className="container-editorial">
          <p className="mb-8 text-center font-sans text-xs uppercase tracking-[0.34em] text-[#6a4d31]">Chronology Of Intent</p>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute left-0 top-0 h-full w-px bg-[#8e6c4a]/45 md:left-[178px]" />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.article
                  key={item.era}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-90px' }}
                  transition={{ duration: 0.56, delay: index * 0.05 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr] md:gap-9"
                >
                  <p className="font-sans text-xs uppercase tracking-[0.26em] text-[#7c5e40] md:pt-1">{item.era}</p>
                  <div className="relative border border-black/20 bg-[#f9efdf] p-5 md:pl-8">
                    <span className="absolute -left-[6px] top-7 h-2.5 w-2.5 rounded-full bg-[#6b4c31] md:left-[-34px]" />
                    <h3 className="font-serif text-2xl font-light text-[#2e1f13] md:text-3xl">{item.title}</h3>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-[#4d3928]">{item.body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#efe3d2' }}>
        <div className="container-editorial">
          <p className="mb-8 text-center font-sans text-xs uppercase tracking-[0.34em] text-[#6a4d31]">Archival Plates</p>
          <div className="space-y-12">
            {plates.map((plate, index) => (
              <motion.div
                key={plate.heading}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-110px' }}
                transition={{ duration: 0.65 }}
                className="grid grid-cols-1 gap-6 border-y border-black/20 py-8 md:grid-cols-12 md:gap-8"
              >
                <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="border border-black/20 bg-[#f8ecdc] p-2">
                    <img src={plate.image} alt={plate.heading} className="h-full min-h-[290px] w-full object-cover" />
                  </div>
                </div>
                <div className={`flex items-center md:col-span-5 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-[0.28em] text-[#7c5e40]">Historical Material Note</p>
                    <h3 className="mt-3 font-serif text-3xl font-light leading-tight text-[#2e1f13] md:text-4xl">{plate.heading}</h3>
                    <p className="mt-4 font-sans text-sm leading-relaxed text-[#4d3928]">{plate.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={manifestoRef} className="relative overflow-hidden border-y border-black/25 bg-[#2b1f16] py-20 md:py-28">
        <motion.img src={heroBgImg} alt="Historic chamber" className="absolute inset-0 h-full w-full object-cover opacity-28" style={{ y: manifestY }} />
        <div className="absolute inset-0 bg-[#2b1f16]/75" />

        <div className="container-editorial relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-[#e9d8bf]/70">Philosophy Manifest</p>
            <h2 className="mt-6 font-serif text-3xl font-light leading-tight text-[#f4e7d2] md:text-5xl">
              What history separated,
              <br />
              design can reconnect.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl font-sans text-sm leading-relaxed text-[#e4d2b8]/85">
              We do not imitate the past. We carry its discipline forward: measured form, tactile honesty, and craftsmanship that invites long-term belonging.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f2e7d7' }}>
        <div className="container-editorial text-center">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#6a4d31]">Epilogue</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-light text-[#2f2015] md:text-4xl">
            Enter the collection and experience this history in contemporary form.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/collections"
              className="inline-flex items-center gap-3 border border-[#5f432c] px-7 py-4 font-sans text-xs uppercase tracking-[0.24em] text-[#3d2b1d] transition-colors hover:bg-[#3d2b1d] hover:text-[#f3e5cf]"
            >
              Explore Collections
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/consultancy"
              className="inline-flex items-center gap-3 border border-[#8d6f4e]/60 px-7 py-4 font-sans text-xs uppercase tracking-[0.24em] text-[#5f432c] transition-colors hover:border-[#5f432c] hover:text-[#3d2b1d]"
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
