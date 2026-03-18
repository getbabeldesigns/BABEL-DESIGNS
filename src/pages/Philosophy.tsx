import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import towerImage from '@/assets/babel-tower.png';

const grainBackground =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

const Philosophy = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-background pt-24 md:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.03]"
        style={{ backgroundImage: grainBackground }}
      />

      <section className="relative min-h-[88vh] overflow-hidden border-y border-border/50">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <img
            src={towerImage}
            alt="The Tower of Babel"
            className="h-[72vh] max-h-[780px] w-auto object-contain opacity-90"
            style={{ filter: 'drop-shadow(0 0 60px hsl(var(--sand)/0.15)) drop-shadow(0 0 110px hsl(var(--sand)/0.1))' }}
          />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--foreground)/0.08),hsl(var(--background)/0.9)_62%,hsl(var(--background))_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl items-center px-8 md:px-16">
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

      <section className="section-padding border-b border-border/50 bg-background/90">
        <div className="container-editorial text-center">
          <p className="mx-auto max-w-3xl font-sans text-sm leading-relaxed text-muted-foreground">
            The Babel story reminds us that language can divide. Our design practice answers with proportion,
            material honesty, and forms that communicate across cultures without needing translation.
          </p>
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
