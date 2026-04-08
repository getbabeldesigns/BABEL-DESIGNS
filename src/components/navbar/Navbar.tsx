'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import CartSidebar from '@/components/sidebars/CartSidebar'
import UserSidebar from '@/components/sidebars/UserSidebar'

export default function Navbar({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Magnetic button effect
  const handleMagnetic = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
  }, [])

  const handleMagneticLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)'
  }, [])

  const isDark = theme === 'dark' && !scrolled

  const navItems = [
    { label: 'Collections', href: '/#collections', scroll: true },
    { label: 'Consultancy', href: '/pages/consultancy' },
    { label: 'About', href: '/pages/about' },
  ]

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.scroll) {
      e.preventDefault()
      if (window.location.pathname === '/') {
        document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = '/#collections'
      }
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'py-3' : 'py-5 md:py-7'
        }`}
      >
        {/* Background */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            scrolled
              ? 'bg-preto/90 backdrop-blur-xl border-b border-white/[0.04]'
              : 'bg-transparent'
          }`}
        />

        <div className="relative max-w-[1440px] mx-auto px-6 md:px-12" ref={navRef}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              href="/"
              className={`relative group transition-all duration-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
              }`}
              onMouseMove={handleMagnetic}
              onMouseLeave={handleMagneticLeave}
            >
              <span
                className={`font-hero text-lg md:text-xl tracking-[0.3em] transition-colors duration-500 ${
                  isDark || scrolled ? 'text-branco' : 'text-preto'
                }`}
              >
                BABEL
              </span>
              <span
                className={`absolute -bottom-1 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDark || scrolled ? 'bg-branco/40' : 'bg-preto/40'
                }`}
              />
            </Link>

            {/* Center Nav */}
            <div
              className={`hidden md:flex items-center transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className={`flex items-center rounded-full px-1 py-1 transition-all duration-500 ${
                scrolled ? 'bg-white/[0.04]' : isDark ? 'bg-white/[0.03]' : 'bg-black/[0.03]'
              }`}>
                {navItems.map((item, i) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(item, e)}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onMouseMove={handleMagnetic}
                    className={`relative px-5 py-2 font-accent text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-300 rounded-full ${
                      activeIndex === i
                        ? isDark || scrolled
                          ? 'text-branco bg-white/[0.08]'
                          : 'text-preto bg-black/[0.06]'
                        : isDark || scrolled
                          ? 'text-branco/50 hover:text-branco/80'
                          : 'text-preto/50 hover:text-preto/80'
                    }`}
                    style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Icons */}
            <div
              className={`flex items-center gap-0.5 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <button
                onClick={() => setCartOpen(true)}
                onMouseMove={handleMagnetic}
                onMouseLeave={handleMagneticLeave}
                className={`relative p-2.5 rounded-full transition-all duration-300 ${
                  isDark || scrolled ? 'hover:bg-white/[0.06] text-branco' : 'hover:bg-black/[0.04] text-preto'
                }`}
                aria-label="Open shopping cart"
                type="button"
              >
                <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className={`absolute -top-0 -right-0 text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-accent leading-none ${
                  isDark || scrolled ? 'bg-branco text-preto' : 'bg-preto text-branco'
                }`}>
                  0
                </span>
              </button>
              <button
                onClick={() => setUserOpen(true)}
                onMouseMove={handleMagnetic}
                onMouseLeave={handleMagneticLeave}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isDark || scrolled ? 'hover:bg-white/[0.06] text-branco' : 'hover:bg-black/[0.04] text-preto'
                }`}
                aria-label="Open user menu"
                type="button"
              >
                <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>

              {/* Hamburger */}
              <button
                className="md:hidden flex flex-col justify-center items-center w-8 h-8 ml-1 relative"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                type="button"
              >
                <span className={`absolute h-[1.5px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${isDark || scrolled ? 'bg-branco' : 'bg-preto'} ${mobileMenuOpen ? 'w-5 rotate-45' : 'w-5 -translate-y-[5px]'}`} />
                <span className={`absolute h-[1.5px] w-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDark || scrolled ? 'bg-branco' : 'bg-preto'} ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`} />
                <span className={`absolute h-[1.5px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${isDark || scrolled ? 'bg-branco' : 'bg-preto'} ${mobileMenuOpen ? 'w-5 -rotate-45' : 'w-5 translate-y-[5px]'}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`absolute inset-0 bg-preto transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${mobileMenuOpen ? 'scale-y-100' : 'scale-y-0'}`} />

        <div className="relative flex flex-col items-center justify-center h-full">
          <ul className="flex flex-col items-center gap-10">
            {navItems.map((item, i) => (
              <li
                key={item.label}
                className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? `${300 + i * 100}ms` : '0ms' }}
              >
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className="font-hero text-3xl tracking-[0.2em] uppercase text-branco/70 hover:text-branco transition-colors duration-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className={`absolute bottom-16 transition-all duration-700 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: mobileMenuOpen ? '600ms' : '0ms' }}
          >
            <span className="font-accent text-[9px] tracking-[0.4em] uppercase text-inox/30">
              Interior Design Studio
            </span>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <UserSidebar isOpen={userOpen} onClose={() => setUserOpen(false)} />
    </>
  )
}
