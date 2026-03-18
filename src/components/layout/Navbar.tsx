import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, getSupabaseClient } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLAnchorElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const isActive = (path: string) => location.pathname === path;
  const isAuthPage = location.pathname === '/auth';
  const initials = (value: User | null) => {
    const metadataName = (value?.user_metadata?.full_name as string | undefined) || (value?.user_metadata?.name as string | undefined);
    const source = metadataName || value?.email || '';
    if (!source) return 'BD';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  };

  const navLinks = [
    { path: '/collections', label: 'Collections' },
    { path: '/philosophy', label: 'Philosophy' },
    { path: '/consultancy', label: 'Consultancy' },
  ];

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const client = getSupabaseClient();
    let mounted = true;
    const syncSessionUser = async () => {
      const { data } = await client.auth.getSession();
      if (mounted) setUser(data.session?.user ?? null);
    };

    void syncSessionUser();

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    window.addEventListener('focus', syncSessionUser);

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      window.removeEventListener('focus', syncSessionUser);
    };
  }, []);

  // Initial navbar entrance animation
  useEffect(() => {
    if (!navRef.current) return;

    const timeline = gsap.timeline();
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    // Navbar slides down and fades in
    timeline.from(navRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.8,
      ease: 'power2.out',
    });

    // Logo animates in
    if (logoRef.current) {
      timeline.from(
        logoRef.current,
        {
          opacity: 0,
          x: -30,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.6'
      );
    }

    // Navigation links stagger in
    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll('a');
      timeline.from(
        links,
        {
          opacity: 0,
          x: 20,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
        },
        '-=0.4'
      );
    }

    // Cart icon animates in
    if (cartRef.current && isDesktop) {
      timeline.from(
        cartRef.current,
        {
          opacity: 0,
          x: 30,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.5'
      );
    }

    timeline.eventCallback('onComplete', () => {
      if (cartRef.current) {
        gsap.set(cartRef.current, { clearProps: 'opacity,transform' });
      }
    });
  }, []);

  // Animate badge when totalItems changes
  useEffect(() => {
    if (badgeRef.current && totalItems > 0) {
      gsap.to(badgeRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  }, [totalItems]);

  const handleNavLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    gsap.to(target, {
      color: 'var(--foreground)',
      y: -1,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleNavLinkHoverEnd = (e: React.MouseEvent<HTMLAnchorElement>, isActivePath: boolean) => {
    const target = e.currentTarget;
    gsap.to(target, {
      color: isActivePath ? 'var(--foreground)' : 'var(--muted-foreground)',
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleLogoHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget.querySelector('h1'), {
      color: 'var(--muted-foreground)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleLogoHoverEnd = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget.querySelector('h1'), {
      color: 'var(--foreground)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleCartHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      y: -1,
      scale: 1.04,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleCartHoverEnd = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background/90 navbar-backdrop"
    >
      <div className="container-editorial max-w-none">
        <div
          className={`flex items-center justify-between px-4 sm:px-6 ${
            isAuthPage ? 'py-3 md:py-4 md:px-7 lg:px-10' : 'py-3.5 md:px-8 md:py-6 lg:px-12'
          }`}
        >
          {/* Logo */}
          <Link
            ref={logoRef}
            to="/"
            className="group ml-0 flex-none min-w-0"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoHoverEnd}
            data-cursor="Home"
          >
            <h1 className="logo-title text-[clamp(15px,1.8vw,24px)] font-light tracking-[clamp(0.1em,0.6vw,0.2em)] text-foreground leading-tight">
              BABEL DESIGNS
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-[clamp(12px,2.2vw,32px)]" ref={linksRef}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sans text-[clamp(10px,1.05vw,14px)] tracking-[clamp(0.14em,0.5vw,0.26em)] uppercase ${
                  isActive(link.path)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
                onMouseEnter={handleNavLinkHover}
                onMouseLeave={(e) => handleNavLinkHoverEnd(e, isActive(link.path))}
                data-cursor="Open"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to={user ? "/account" : "/auth"}
              className={`font-sans text-[clamp(10px,1.05vw,14px)] tracking-[clamp(0.14em,0.5vw,0.26em)] uppercase ${
                isActive('/auth') || isActive('/account') ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onMouseEnter={handleNavLinkHover}
              onMouseLeave={(e) => handleNavLinkHoverEnd(e, isActive('/auth') || isActive('/account'))}
              data-cursor="Account"
            >
              {user ? 'Account' : 'Sign In'}
            </Link>

            {user && (
              <Link
                to="/account"
                className="ml-1"
                aria-label="Account profile"
                data-cursor="Profile"
              >
                <Avatar className="h-8 w-8 border border-border/70">
                  <AvatarImage src={user.user_metadata?.avatar_url as string | undefined} alt={user.email ?? 'Account avatar'} />
                  <AvatarFallback className="text-[10px] font-sans">{initials(user)}</AvatarFallback>
                </Avatar>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              ref={cartRef}
              className="relative ml-1 flex items-center text-foreground transition-opacity hover:opacity-70"
              aria-label="Cart"
              onMouseEnter={handleCartHover}
              onMouseLeave={handleCartHoverEnd}
              data-cursor="Cart"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {totalItems > 0 && (
                <span
                  ref={badgeRef}
                  className="absolute -top-2 -right-2 flex h-5 w-5 scale-0 items-center justify-center rounded-full bg-foreground font-sans text-xs text-background opacity-0"
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              to={user ? "/account" : "/auth"}
              className="font-sans text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
              data-cursor="Account"
            >
              {user ? 'Account' : 'Sign In'}
            </Link>
            {user && (
              <Link to="/account" aria-label="Account profile" data-cursor="Profile">
                 <Avatar className="h-8 w-8 border border-border/70">
                  <AvatarImage src={user.user_metadata?.avatar_url as string | undefined} alt={user.email ?? 'Account avatar'} />
                  <AvatarFallback className="text-[10px] font-sans">{initials(user)}</AvatarFallback>
                </Avatar>
              </Link>
            )}
            <Link
              to="/cart"
              className="relative text-foreground transition-opacity hover:opacity-70"
              aria-label="Cart"
              onMouseEnter={handleCartHover}
              onMouseLeave={handleCartHoverEnd}
              data-cursor="Cart"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-xs flex items-center justify-center rounded-full font-sans">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden border-t border-border px-4 py-3 sm:px-6">
          <div className="grid w-full grid-cols-3 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex min-h-9 items-center justify-center border px-2 text-center font-sans text-[11px] tracking-[0.12em] uppercase transition-colors ${
                  isActive(link.path)
                    ? 'border-foreground/35 bg-foreground text-background'
                    : 'border-border/70 text-muted-foreground hover:border-foreground/35 hover:text-foreground'
                }`}
                onMouseEnter={handleNavLinkHover}
                onMouseLeave={(e) => handleNavLinkHoverEnd(e, isActive(link.path))}
                data-cursor="Open"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
