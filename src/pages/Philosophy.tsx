import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, ScrollText, Sparkles, type LucideIcon } from 'lucide-react';
import babelimage1 from '@/assets/babelimage1.jpeg';
import babelimage2 from '@/assets/babelimage2.jpeg';
import babelimage3 from '@/assets/babelimage3.jpeg';
import babelPhilosophyImg from '../../babelphilosophy.jpeg';

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
  const heroImageStyle: CSSProperties = {
    filter: 'saturate(0.92) contrast(1.03)',
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

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.03]"
        style={{ backgroundImage: grainBackground }}
      />

      <section className="relative overflow-hidden border-y border-border/50 bg-[linear-gradient(160deg,hsl(var(--background)),hsl(var(--secondary)/0.55))] pt-24 md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,hsl(var(--sand)/0.28),transparent_42%),radial-gradient(circle_at_88%_86%,hsl(var(--foreground)/0.09),transparent_40%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 md:px-10 lg:px-12">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-5 border border-border/60 bg-background/80 p-6 sm:p-7 lg:col-span-5 lg:sticky lg:top-28">
              <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Philosophy Journal</p>
              <h1 className="font-serif text-4xl font-light leading-[1.03] text-foreground sm:text-5xl lg:text-6xl">
                Form, Memory,
                <br />
                and Ritual
              </h1>
              <p className="max-w-lg font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
                This is our opening frame: how we translate ancient narratives into contemporary furniture language.
                Every proportion, seam, and surface is chosen to feel calm and lasting.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-border/60 bg-secondary/30 p-3">
                  <p className="font-serif text-xl">03</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Acts</p>
                </div>
                <div className="border border-border/60 bg-secondary/30 p-3">
                  <p className="font-serif text-xl">12</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Principles</p>
                </div>
                <div className="border border-border/60 bg-secondary/30 p-3">
                  <p className="font-serif text-xl">01</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Voice</p>
                </div>
              </div>
              <a
                href="#chapter-origin"
                className="inline-flex items-center gap-3 border border-foreground/35 px-5 py-3 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
              >
                Read first chapter
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="space-y-4 lg:col-span-7">
              <div className="overflow-hidden border border-border/60 bg-background/55 p-2 sm:p-3">
                <img
                  src={babelPhilosophyImg}
                  alt="Abstract architectural composition"
                  className="h-[300px] w-full object-cover sm:h-[370px] md:h-[450px] lg:h-[520px]"
                  style={heroImageStyle}
                />
              </div>
              <p className="max-w-2xl border-l border-border/70 pl-4 font-serif text-base italic leading-relaxed text-muted-foreground sm:text-lg">
                We no longer chase monuments. We build objects that bring people back to stillness.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-3 px-4 py-4 sm:px-6 md:px-12">
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
            <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 md:px-12">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
