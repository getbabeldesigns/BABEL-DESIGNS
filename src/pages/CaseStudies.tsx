import { Link } from 'react-router-dom';
import urbanResidenceMumbaiImg from '@/assets/blogs/urban-residence-mumbai.svg';
import boutiqueHospitalityDubaiImg from '@/assets/blogs/boutique-hospitality-dubai.svg';
import privateCollectorBengaluruImg from '@/assets/blogs/private-collector-bengaluru.svg';

const CaseStudies = () => {
  const studies = [
    {
      title: 'Urban Residence, Mumbai',
      outcome: 'Reduced visual clutter by 42% while increasing seating capacity by 30%.',
      image: urbanResidenceMumbaiImg,
    },
    {
      title: 'Boutique Hospitality Lounge, Dubai',
      outcome: 'Lifted average guest dwell time from 18 to 33 minutes.',
      image: boutiqueHospitalityDubaiImg,
    },
    {
      title: 'Private Collector Apartment, Bengaluru',
      outcome: 'Integrated 11 bespoke pieces with a unified material language.',
      image: privateCollectorBengaluruImg,
    },
  ];

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Blogs</p>
          <h1 className="mb-8 font-serif text-4xl md:text-5xl font-light">Stories and insights</h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {studies.map((study) => (
              <article key={study.title} className="border border-border bg-card overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={study.image} alt={study.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="p-5">
                  <h2 className="mb-3 font-serif text-2xl">{study.title}</h2>
                  <p className="text-sm text-muted-foreground">{study.outcome}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/consultancy" className="border border-foreground/30 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
