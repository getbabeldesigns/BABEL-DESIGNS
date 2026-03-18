import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, ScrollText, Sparkles, type LucideIcon } from 'lucide-react';
import towerImage from '@/assets/babel-tower.png';
import babelimage1 from '@/assets/babelimage1.jpeg';
import babelimage2 from '@/assets/babelimage2.jpeg';
import babelimage3 from '@/assets/babelimage3.jpeg';

const grainBackground =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

type StoryChapter = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  image: string;
  story: string;
};

const Philosophy = () => {
  const [scrollY, setScrollY] = useState(0);
  const parallaxStyle: CSSProperties = { transform: `translateY(${scrollY * 0.3}px)` };
  const towerGlowStyle: CSSProperties = {
    filter: 'drop-shadow(0 0 60px hsl(var(--sand)/0.15)) drop-shadow(0 0 110px hsl(var(--sand)/0.1))',
  };

  const chapters: StoryChapter[] = [
    {
      id: 'chapter-origin',
      title: 'I. The First Stone',
      subtitle: 'Ancient Babel',
      icon: Landmark,
      image: babelimage1,
      story:
        'In the old stories, Babel began as one voice reaching upward. Its ambition was grand, but its language grew louder than its listening. For us, this is the first lesson: architecture without humility becomes monument, not home.',
    },
    {
      id: 'chapter-fracture',
      title: 'II. The Fracture',
      subtitle: 'After the Fall',
      icon: ScrollText,
      image: babelimage2,
      story:
        'When the tower fractured, people scattered with new tongues and new distances. Yet every fragment kept a memory of proportion, touch, and ritual. Babel Designs begins here, in those fragments, reassembled with patience.',
    },
    {
      id: 'chapter-renewal',
      title: 'III. The Renewal',
      subtitle: 'The Modern Atelier',
      icon: Sparkles,
      image: babelimage3,
      story:
        'Our contemporary Babel is not about height. It is about resonance: objects that hold stillness, spaces that invite belonging, and forms that speak quietly across cultures. This is our philosophy of making - beauty that translates.',
    },
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.03]"
        style={{ backgroundImage: grainBackground }}
      />

      <section className="relative min-h-[88vh] overflow-hidden border-y border-border/50 pt-24 md:pt-32">
        <div
          className="absolute inset-x-0 bottom-0 top-24 flex items-center justify-center md:top-32"
          style={parallaxStyle}
        >
          <img
            src={towerImage}
            alt="The Tower of Babel"
            className="h-[72vh] max-h-[780px] w-auto object-contain opacity-90"
            style={towerGlowStyle}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 top-24 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--foreground)/0.08),hsl(var(--background)/0.9)_62%,hsl(var(--background))_100%)] md:top-32" />

        <div className="relative z-10 mx-auto flex min-h-[calc(88vh-6rem)] w-full max-w-7xl items-center px-8 md:min-h-[calc(88vh-8rem)] md:px-16">
          <div className="max-w-md">
            <p className="mb-6 font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">Babel Designs</p>
            <h1 className="mb-6 font-serif text-4xl font-light leading-tight text-foreground md:text-6xl">
              The Philosophy
              <br />
              of Babel
            </h1>
            <div className="mb-6 h-px w-24 bg-gradient-to-r from-transparent via-foreground/60 to-transparent" />
            <p className="font-sans text-sm italic leading-relaxed text-muted-foreground">
              A pursuit not of height, but of meaning.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-3 px-6 py-4 md:px-12">
          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className="border border-border/60 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              {chapter.subtitle}
            </a>
          ))}
        </div>
      </section>

      {chapters.map((chapter, index) => {
        const Icon = chapter.icon;

        return (
          <section
            key={chapter.id}
            id={chapter.id}
            className="section-padding border-b border-border/50 bg-background/90"
          >
            <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-12">
              <div className={index % 2 ? 'md:order-2' : ''}>
                <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Story Chapter
                </p>
                <h2 className="mb-4 font-serif text-3xl font-light text-foreground md:text-5xl">{chapter.title}</h2>
                <div className="mb-6 inline-flex items-center gap-2 border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <Icon size={14} />
                  {chapter.subtitle}
                </div>
                <p className="max-w-xl font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
                  {chapter.story}
                </p>
              </div>

              <div className={index % 2 ? 'md:order-1' : ''}>
                <div className="overflow-hidden border border-border/50 bg-muted/20 p-2">
                  <img
                    src={chapter.image}
                    alt={chapter.subtitle}
                    className="h-[420px] w-full object-cover grayscale-[20%] transition duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="section-padding bg-background">
        <div className="container-editorial text-center">
          <p className="mx-auto max-w-3xl font-sans text-sm leading-relaxed text-muted-foreground">
            We carry the memory of Babel forward through materials, proportions, and atmosphere. Each collection is
            one more chapter in a long story of human making.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/collections"
              className="inline-flex items-center gap-3 border border-foreground/35 px-7 py-4 font-sans text-xs uppercase tracking-[0.24em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Continue to Collections
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
