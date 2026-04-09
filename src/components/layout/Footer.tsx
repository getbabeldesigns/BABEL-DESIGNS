import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus } from 'lucide-react';

const navLinks = [
  { path: '/collections', label: 'Collections' },
  { path: '/lookbook', label: 'Lookbook' },
  { path: '/materials', label: 'Material Explorer' },
  { path: '/style-quiz', label: 'Style Quiz' },
];

const studioLinks = [
  { path: '/philosophy', label: 'Philosophy' },
  { path: '/blogs', label: 'Journal' },
  { path: '/consultancy', label: 'Consultancy' },
];

const legalLinks = [
  { path: '/return-policy', label: 'Returns' },
  { path: '/refund-policy', label: 'Refunds' },
  { path: '/privacy-policy', label: 'Privacy' },
  { path: '/disclaimer', label: 'Disclaimer' },
];

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');

  const handleFooterLinkClick = (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("Subscribed to Babel Dispatch.");
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-background text-foreground border-t border-foreground/10">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12 pt-20 pb-10">
        
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start border-b border-foreground/5 pb-16">
          
          {/* Brand & Newsletter (Left Col) */}
          <div className="md:col-span-4 flex flex-col justify-between h-full">
            <div>
              <Link 
                to="/" 
                onClick={handleFooterLinkClick('/')}
                className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
              >
                <span className="font-serif text-2xl font-light tracking-wide">Babel Designs</span>
              </Link>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed max-w-[280px]">
                Curating environments with deliberate materials and crafted forms. Design that unites all diversities.
              </p>
            </div>
            
            <div className="mt-12">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-foreground mb-4">
                The Dispatch
              </p>
              <form onSubmit={subscribe} className="relative group w-full max-w-[280px]">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address" 
                  required
                  className="w-full bg-transparent border-b border-foreground/20 py-3 text-xs outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                />
                <button 
                  type="submit" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Links Section (Right Cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 mt-4 md:mt-0 lg:pl-16">
            
            {/* Explore Column */}
            <div className="flex flex-col space-y-5">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Explore
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleFooterLinkClick(link.path)}
                  className="group inline-flex items-center font-sans text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors w-fit"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-foreground/30 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
            </div>

            {/* Studio Column */}
            <div className="flex flex-col space-y-5">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Studio
              </p>
              {studioLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleFooterLinkClick(link.path)}
                  className="group inline-flex items-center font-sans text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors w-fit"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-foreground/30 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
              
              <a 
                href="mailto:getbabeldesigns@gmail.com"
                className="group inline-flex items-center font-sans text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors w-fit pt-2"
              >
                <span className="relative">
                  Contact
                  <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-foreground/30 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </a>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col space-y-5">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Legal
              </p>
              {legalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleFooterLinkClick(link.path)}
                  className="group inline-flex items-center font-sans text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors w-fit"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-foreground/30 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* Footer Bottom / Meta */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-sans text-[11px] tracking-[0.1em] text-muted-foreground">
            &copy; {new Date().getFullYear()} Babel Designs. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              Instagram
            </a>
            <Minus size={12} className="text-border" />
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              Pinterest
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
