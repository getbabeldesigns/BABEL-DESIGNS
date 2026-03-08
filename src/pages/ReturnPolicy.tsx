const ReturnPolicy = () => {
  const sections = [
    {
      title: "Eligibility for Returns",
      points: [
        "Requests must be raised within 7 days of delivery for ready-stock products.",
        "Products must be unused, in original condition, and with all original packaging.",
        "Made-to-order, custom finish, and personalized items are not eligible for standard returns.",
      ],
    },
    {
      title: "Non-Returnable Cases",
      points: [
        "Natural variation in stone, wood grain, or hand-finished surfaces is not considered a defect.",
        "Damage due to mishandling, improper installation, moisture, or impact after delivery is excluded.",
        "Items bought during final clearance or marked non-returnable cannot be returned.",
      ],
    },
    {
      title: "How to Request a Return",
      points: [
        "Email getbabeldesigns@gmail.com with order ID and product photos.",
        "Our team reviews eligibility in 2 to 4 business days.",
        "If approved, pickup instructions and quality-check guidelines are shared.",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-32 md:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-24 h-52 w-52 rounded-full bg-secondary/45 blur-3xl" />
        <div className="absolute right-0 top-64 h-60 w-60 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10 max-w-5xl">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-muted-foreground">Legal</p>
          <h1 className="mb-5 font-serif text-4xl font-light text-foreground md:text-6xl">Return Policy</h1>
          <p className="max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
            This policy defines when and how returns are accepted for Babel Designs purchases. By placing an order,
            you acknowledge and agree to the terms below.
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

export default ReturnPolicy;
