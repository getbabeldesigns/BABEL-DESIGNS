import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';

const navLinks = [
  { path: '/collections', label: 'Collections' },
  { path: '/lookbook', label: 'Lookbook' },
  { path: '/materials', label: 'Material Explorer' },
  { path: '/style-quiz', label: 'Style Quiz' },
];

const aboutLinks = [
  { path: '/philosophy', label: 'Philosophy' },
  { path: '/blogs', label: 'Journal' },
  { path: '/consultancy', label: 'Consultancy' },
  { path: '/contact', label: 'Contact' },
];

const legalLinks = [
  { path: '/return-policy', label: 'Returns' },
  { path: '/refund-policy', label: 'Refunds' },
  { path: '/privacy-policy', label: 'Privacy' },
  { path: '/disclaimer', label: 'Disclaimer' },
];

const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-background pt-24 pb-8 font-sans">
      
      {/* 5. CTA SECTION ABOVE FOOTER */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 mb-12 relative z-20">
        <div className="bg-[#1a1a1a] text-[#f7f7f7] rounded-[2rem] p-12 md:p-24 text-center flex flex-col items-center shadow-2xl shadow-black/10">
          <h2 className="text-3xl md:text-5xl font-light mb-6 tracking-wide">Ready to elevate your space?</h2>
          <p className="text-sm md:text-base text-gray-400 mb-10 max-w-md font-light leading-relaxed">
            Discover pieces that speak across cultures and time.
          </p>
          <Link 
            to="/collections" 
            onClick={handleScrollToTop}
            className="bg-[#f7f7f7] text-[#1a1a1a] px-8 py-3.5 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            Explore Collections
          </Link>
        </div>
      </div>

      {/* FOOTER CONTAINER */}
      <div className="mx-4 md:mx-8 relative">
        <footer className="relative bg-[#f7f7f7] text-[#222] pt-24 pb-12 overflow-hidden rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.02)]">
          
          {/* 4. BACKGROUND BRAND ELEMENT */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-[0.03] pointer-events-none select-none blur-[1px]">
            <span 
              className="font-serif font-bold tracking-tighter whitespace-nowrap text-[#1a1a1a]"
              style={{ fontSize: 'clamp(10rem, 30vw, 35rem)' }}
            >
              Babel
            </span>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
              
              {/* 1. LEFT SECTION */}
              <div className="col-span-1 lg:col-span-5 flex flex-col items-start">
                <Link to="/" onClick={handleScrollToTop} className="mb-6 inline-block">
                  <h3 className="font-serif text-3xl font-light tracking-wide text-[#111]">Babel Designs</h3>
                </Link>
                <p className="text-sm text-[#555] leading-relaxed max-w-md mb-8 font-light tracking-wide">
                  Babel Designs creates timeless pieces that blend culture, material, and meaning into modern living.
                </p>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://www.instagram.com/babel.designs/" 
                    target="_blank" 
                    rel="noreferrer"
                    title="Follow us on Instagram"
                    className="p-3 bg-[#e8e8e8] rounded-full text-[#333] hover:text-[#111] hover:bg-[#ddd] hover:scale-105 transition-all duration-300"
                  >
                    <Instagram size={18} strokeWidth={1.5} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noreferrer"
                    title="Follow us on LinkedIn"
                    className="p-3 bg-[#e8e8e8] rounded-full text-[#333] hover:text-[#111] hover:bg-[#ddd] hover:scale-105 transition-all duration-300"
                  >
                    <Linkedin size={18} strokeWidth={1.5} />
                  </a>
                  {/* Custom Minimal Pinterest Icon */}
                  <a 
                    href="https://pinterest.com" 
                    target="_blank" 
                    rel="noreferrer"
                    title="Follow us on Pinterest"
                    className="p-3 bg-[#e8e8e8] rounded-full text-[#333] hover:text-[#111] hover:bg-[#ddd] hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.4 9.3-.1-.8-.2-2 .04-2.9.2-.8 1.4-5.8 1.4-5.8s-.4-.7-.4-1.8c0-1.7 1-2.9 2.2-2.9 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1.1 4-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.8-2.2 3.8-5.5 0-2.9-2.1-4.9-5-4.9-3.4 0-5.4 2.5-5.4 5.2 0 1 .4 2.1.9 2.7.1.1.1.2.1.3-.1.4-.3 1.2-.3 1.4-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.8-7.3 8-7.3 4.2 0 7.4 3 7.4 6.9 0 4.1-2.6 7.5-6.2 7.5-1.2 0-2.4-.6-2.8-1.4 0 0-.6 2.3-.8 3-.2.8-.7 1.8-1.1 2.4 1 .3 2.1.5 3.2.5 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* 2. RIGHT SECTION (NAVIGATION COLUMNS) */}
              <div className="col-span-1 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-8 pt-2 lg:pt-0">
                
                {/* Column 1 — Explore */}
                <div className="flex flex-col space-y-5">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#888] mb-1">
                    Explore
                  </h4>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleScrollToTop}
                      className="group inline-flex items-center text-sm font-light tracking-wide text-[#444] hover:text-[#111] transition-colors w-fit"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full opacity-30"></span>
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Column 2 — About */}
                <div className="flex flex-col space-y-5">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#888] mb-1">
                    About
                  </h4>
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleScrollToTop}
                      className="group inline-flex items-center text-sm font-light tracking-wide text-[#444] hover:text-[#111] transition-colors w-fit"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full opacity-30"></span>
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Column 3 — Legal */}
                <div className="flex flex-col space-y-5 col-span-2 md:col-span-1 mt-6 md:mt-0">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#888] mb-1">
                    Legal
                  </h4>
                  {legalLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleScrollToTop}
                      className="group inline-flex items-center text-sm font-light tracking-wide text-[#444] hover:text-[#111] transition-colors w-fit"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full opacity-30"></span>
                      </span>
                    </Link>
                  ))}
                </div>

              </div>

            </div>

            {/* 3. BOTTOM BAR */}
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#e5e5e5]">
              <p className="font-sans text-xs text-[#888] tracking-wide">
                &copy; {new Date().getFullYear()} Babel Designs. All rights reserved.
              </p>
              
              <div className="flex items-center gap-3 md:gap-4 font-sans text-xs text-[#666] tracking-wide">
                <Link to="/privacy-policy" onClick={handleScrollToTop} className="hover:text-[#111] transition-colors">
                  Privacy Policy
                </Link>
                <div className="w-[3px] h-[3px] rounded-full bg-[#ccc]"></div>
                <Link to="/terms-of-service" onClick={handleScrollToTop} className="hover:text-[#111] transition-colors">
                  Terms of Service
                </Link>
                <div className="w-[3px] h-[3px] rounded-full bg-[#ccc]"></div>
                <Link to="#" className="hover:text-[#111] transition-colors">
                  Cookies Settings
                </Link>
              </div>
            </div>

          </div>
        </footer>
      </div>
      
    </div>
  );
};

export default Footer;
