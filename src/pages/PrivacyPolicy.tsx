const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      points: [
        "Contact details like name, phone number, email, and delivery addresses.",
        "Order, cart, and payment metadata required to process purchases.",
        "Usage information such as pages viewed, session timing, and device/browser details.",
      ],
    },
    {
      title: "How We Use Information",
      points: [
        "To confirm orders, process shipping, and provide post-purchase support.",
        "To improve products, website performance, and customer experience.",
        "To send policy, order, or account-related notifications and updates.",
      ],
    },
    {
      title: "Data Sharing and Protection",
      points: [
        "Payment processing is handled via approved third-party providers like Razorpay.",
        "We share only necessary information with logistics and service partners.",
        "Reasonable technical and organizational safeguards are used to protect stored data.",
      ],
    },
    {
      title: "Your Rights",
      points: [
        "You may request data correction or account information updates.",
        "You may request deletion of personal data, subject to legal and tax retention duties.",
        "For requests, contact studio@babeldesigns.com from your registered email.",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-32 md:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 top-16 h-52 w-52 rounded-full bg-secondary/45 blur-3xl" />
        <div className="absolute right-0 top-56 h-64 w-64 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <section className="section-padding pt-0">
        <div className="container-editorial relative z-10 max-w-5xl">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-muted-foreground">Legal</p>
          <h1 className="mb-5 font-serif text-4xl font-light text-foreground md:text-6xl">Privacy Policy</h1>
          <p className="max-w-3xl font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
            This page explains how Babel Designs collects, uses, stores, and protects your personal information when
            you browse, create an account, or place an order.
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

export default PrivacyPolicy;
