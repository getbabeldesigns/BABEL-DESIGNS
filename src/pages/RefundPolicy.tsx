const RefundPolicy = () => {
  const sections = [
    {
      title: "When Refunds Are Issued",
      points: [
        "Refunds are processed only after return approval and successful quality inspection.",
        "For canceled orders, refunds apply only if production or dispatch has not started.",
        "If a replacement cannot be arranged for approved damage claims, a full or partial refund may be offered.",
      ],
    },
    {
      title: "Refund Timelines",
      points: [
        "Approved refunds are initiated within 5 business days after final confirmation.",
        "Banking partner timelines can add 5 to 10 business days depending on payment method.",
        "Razorpay transaction references are shared by email for tracking.",
      ],
    },
    {
      title: "Deductions and Exceptions",
      points: [
        "Shipping, handling, and pickup charges may be deducted where applicable.",
        "Customized orders are non-refundable once fabrication has started.",
        "Any promotional benefits used on the order may be adjusted at refund time.",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-32 md:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-8 top-20 h-56 w-56 rounded-full bg-secondary/45 blur-3xl" />
        <div className="absolute left-0 top-72 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10 max-w-5xl">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-muted-foreground">Legal</p>
          <h1 className="mb-5 font-serif text-4xl font-light text-foreground md:text-6xl">Refund Policy</h1>
          <p className="max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
            This policy explains the conditions, processing timelines, and exclusions for refunds on Babel Designs
            orders.
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

export default RefundPolicy;
