const DisclaimerPage = () => {
  const sections = [
    {
      title: "General Information",
      points: [
        "Content on this website is provided for general informational purposes only.",
        "Product visuals, textures, and shades may vary across screens and natural materials.",
        "Specifications and availability may be updated without prior notice.",
      ],
    },
    {
      title: "Pricing and Offers",
      points: [
        "All listed prices are subject to change due to material and logistics fluctuations.",
        "Any discount, offer, or campaign can be modified or withdrawn at the company's discretion.",
        "Taxes, shipping, and installation fees may apply in addition to product price.",
      ],
    },
    {
      title: "Third-Party Services",
      points: [
        "Payments, logistics, and integrations may be handled through third-party partners.",
        "Babel Designs is not responsible for outages or delays caused by external platforms.",
        "Use of third-party services is also governed by those providers' terms and policies.",
      ],
    },
    {
      title: "Limitation of Liability",
      points: [
        "Babel Designs is not liable for indirect, incidental, or consequential losses from site use.",
        "Users are responsible for reviewing product suitability before placing an order.",
        "By using this site, you agree to this disclaimer and related policy documents.",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-32 md:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-28 h-56 w-56 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10 max-w-5xl">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-muted-foreground">Legal</p>
          <h1 className="mb-5 font-serif text-4xl font-light text-foreground md:text-6xl">Disclaimer</h1>
          <p className="max-w-3xl font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
            This disclaimer clarifies website usage limits, responsibility boundaries, and interpretation of published
            information for Babel Designs.
          </p>

          <div className="mt-12 space-y-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-sm border border-border/70 bg-card/80 p-6 backdrop-blur-sm md:p-8"
              >
                <h2 className="font-serif text-2xl text-foreground">{section.title}</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DisclaimerPage;
