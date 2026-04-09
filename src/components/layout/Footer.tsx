import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFooterLinkClick = (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { path: '/collections', label: 'Collections' },
    { path: '/lookbook', label: 'Lookbook' },
    { path: '/materials', label: 'Material Explorer' },
    { path: '/style-quiz', label: 'Style Quiz' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/philosophy', label: 'Philosophy' },
    { path: '/consultancy', label: 'Consultancy' },
  ];

  const legalLinks = [
    { path: '/return-policy', label: 'Return Policy' },
    { path: '/refund-policy', label: 'Refund Policy' },
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/disclaimer', label: 'Disclaimer' },
  ];

  return (
    <footer data-swipe-lock="true" className="relative w-full bg-foreground text-background overflow-hidden selection:bg-background selection:text-foreground">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-background/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 md:px-12 pt-24 md:pt-32 pb-8 max-w-[1400px] mx-auto">
        
        {/* Top Section: CTA */}
        <div className="pb-20 md:pb-32 border-b border-background/20 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-sans text-xs tracking-[0.3em] uppercase text-background/60 mb-6"
            >
              Initiate Contact
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] font-light"
            >
              Ready to curate<br /> your space?
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link 
              to="/consultancy"
              onClick={handleFooterLinkClick('/consultancy')}
              className="group relative inline-flex items-center justify-center gap-4 bg-background text-foreground px-10 py-5 rounded-full overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute inset-0 bg-background/80 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              <span className="relative z-10 font-sans text-xs font-bold tracking-[0.2em] uppercase">
                Start brief
              </span>
              <ArrowUpRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>
        </div>

        {/* Middle Section: Grid */}
        <div className="py-20 flex flex-col lg:flex-row justify-between gap-16 lg:gap-8">
          
          {/* Studio Info */}
          <div className="lg:w-1/3">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-background/50 mb-8">
              Headquarters
            </p>
            <div className="space-y-2 font-sans text-sm md:text-base tracking-wide text-background/80">
              <p>Babel Designs Studio</p>
              <p>128 Architectural Row</p>
              <p>New York, NY 10012</p>
            </div>
            
            <div className="mt-12">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-background/50 mb-6">
                Inquiries
              </p>
              <a 
                href="mailto:getbabeldesigns@gmail.com"
                className="group relative inline-flex font-serif text-2xl font-light text-background hover:text-background/80 transition-colors"
              >
                getbabeldesigns@gmail.com
                <div className="absolute left-0 bottom-0 w-0 h-[1px] bg-background group-hover:w-full transition-all duration-500 ease-out" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:w-2/3 flex flex-col sm:flex-row gap-16 sm:gap-24 lg:justify-end">
            
            {/* Nav Column */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-background/50 mb-8">
                Explore
              </p>
              <ul className="space-y-4">
                {navLinks.map((link, idx) => (
                  <motion.li 
                    key={link.path}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={handleFooterLinkClick(link.path)}
                      className="group relative inline-block font-sans text-sm tracking-widest uppercase text-background/80 hover:text-background transition-colors"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-background/50 group-hover:w-full transition-all duration-300 ease-out" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-background/50 mb-8">
                Legal
              </p>
              <ul className="space-y-4">
                {legalLinks.map((link, idx) => (
                  <motion.li 
                    key={link.path}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={handleFooterLinkClick(link.path)}
                      className="group relative inline-block font-sans text-sm tracking-widest uppercase text-background/70 hover:text-background transition-colors"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-background/40 group-hover:w-full transition-all duration-300 ease-out" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Section: Massive Typography Overlay */}
      <div className="relative w-full overflow-hidden border-t border-background/10 pt-10 pb-6 flex flex-col items-center justify-end min-h-[300px] md:min-h-[400px]">
        
        {/* The Copyright / Slogan Floating on Top */}
        <div className="absolute top-10 left-6 right-6 md:left-12 md:right-12 z-20 flex flex-col md:flex-row items-center justify-between gap-4 text-background/60">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]">
            (c) {new Date().getFullYear()} Babel Designs
          </p>
          <p className="font-serif xl:text-lg">
            Crafted forms. Deliberate materials.
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] hidden md:block">
            All rights reserved
          </p>
        </div>

        {/* The Massive Brand Name */}
        <motion.div 
          className="relative z-10 w-full flex justify-center translate-y-12 md:translate-y-20 lg:translate-y-24"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 
            className="font-serif font-light text-background/5 text-center leading-[0.7]" 
            style={{ fontSize: 'clamp(8rem, 25vw, 28rem)', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}
          >
            BABEL
          </h1>
        </motion.div>
        
      </div>
      
    </footer>
  );
};

export default Footer;
