import { Link } from 'react-router-dom';

const Policies = () => {
  const policyCards = [
    {
      title: 'Return Policy',
      copy: 'Eligibility, exclusions, and return request flow for physical products.',
      link: '/return-policy',
    },
    {
      title: 'Refund Policy',
      copy: 'Refund timelines, deductions, and payment reversal conditions.',
      link: '/refund-policy',
    },
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
    <div className="min-h-screen bg-gradient-to-b from-[#f8f2e8] via-[#f4eadc] to-[#eee0ca] pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial max-w-4xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#775238]">Policies</p>
          <h1 className="mb-4 font-serif text-4xl font-light text-[#3f2818] md:text-5xl">Legal center</h1>
          <p className="max-w-2xl font-sans text-sm text-[#6a4b34] md:text-base">
            Access all legal policies required for order placement and payment processing.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {policyCards.map((card) => (
              <Link
                key={card.link}
                to={card.link}
                className="group rounded-sm border border-[#c7a583]/55 bg-[#fff8ee]/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#a8774f]"
              >
                <h2 className="font-serif text-2xl text-[#462d1d]">{card.title}</h2>
                <p className="mt-3 font-sans text-sm leading-relaxed text-[#65462e]">{card.copy}</p>
                <p className="mt-4 font-sans text-xs uppercase tracking-[0.24em] text-[#815b3f]">Read policy</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Policies;
