import { Link } from 'react-router-dom';

const Policies = () => {
  // Return/Refund entries removed while the business is consultancy-only
  // (product sales paused) — those pages now redirect home, which would be a
  // dead link from this hub. Re-add them here when relevant again.
  const policyCards = [
    {
      title: 'Privacy Policy',
      copy: 'How data is collected, protected, and shared with partners.',
      link: '/privacy-policy',
    },
    {
      title: 'Disclaimer',
      copy: 'Usage terms, liability limits, and third-party service conditions.',
      link: '/disclaimer',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-48 md:pt-52">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-16 h-56 w-56 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute right-0 top-64 h-64 w-64 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10 max-w-4xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Policies</p>
          <h1 className="mb-4 font-serif text-4xl font-light text-foreground md:text-5xl">Legal center</h1>
          <p className="max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
            Access Babel Designs' privacy and disclaimer policies.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {policyCards.map((card) => (
              <Link
                key={card.link}
                to={card.link}
                className="group rounded-sm border border-border/70 bg-card/75 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30"
              >
                <h2 className="font-serif text-2xl text-foreground">{card.title}</h2>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">{card.copy}</p>
                <p className="mt-4 font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Read policy</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Policies;
