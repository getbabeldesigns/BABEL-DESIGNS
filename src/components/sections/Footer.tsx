'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-chumbo text-branco relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand - Takes more space */}
          <div className="lg:col-span-5">
            <h3 className="font-accent text-3xl md:text-4xl font-bold tracking-[0.3em] mb-6 text-branco">
              BABEL
            </h3>
            <p className="text-inox leading-relaxed text-base md:text-lg font-light max-w-md mb-8">
              Creating spaces where function meets form, and silence speaks volumes.
            </p>
            <div className="flex gap-5">
              <a href="https://instagram.com/babeldesigns" target="_blank" rel="noopener noreferrer" title="Follow us on Instagram" className="w-10 h-10 rounded-full border border-inox/30 flex items-center justify-center hover:border-branco hover:bg-branco/10 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" title="Follow us on LinkedIn" className="w-10 h-10 rounded-full border border-inox/30 flex items-center justify-center hover:border-branco hover:bg-branco/10 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          <div className="lg:col-span-2">
            <h4 className="font-accent text-xs tracking-[0.2em] uppercase font-semibold mb-6 text-branco">Company</h4>
            <ul className="space-y-4">
              <li><a href="/pages/about" className="text-inox text-sm hover:text-branco transition-colors font-light">About</a></li>
              <li><Link href="/#collections" className="text-inox text-sm hover:text-branco transition-colors font-light">Collections</Link></li>
              <li><a href="/pages/consultancy" className="text-inox text-sm hover:text-branco transition-colors font-light">Consultancy</a></li>
              <li><a href="#" className="text-inox text-sm hover:text-branco transition-colors font-light">Contact</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-accent text-xs tracking-[0.2em] uppercase font-semibold mb-6 text-branco">Services</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-inox text-sm hover:text-branco transition-colors font-light">Interior Design</a></li>
              <li><a href="#" className="text-inox text-sm hover:text-branco transition-colors font-light">Custom Furniture</a></li>
              <li><a href="#" className="text-inox text-sm hover:text-branco transition-colors font-light">Space Planning</a></li>
              <li><a href="#" className="text-inox text-sm hover:text-branco transition-colors font-light">Consultation</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-accent text-xs tracking-[0.2em] uppercase font-semibold mb-6 text-branco">Newsletter</h4>
            <p className="text-inox text-sm mb-4 font-light">Stay updated with our latest designs and projects</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-4 py-3 bg-transparent border border-inox/30 text-branco text-sm placeholder:text-inox/50 focus:outline-none focus:border-branco transition-colors"
              />
              <button className="px-6 py-3 bg-branco text-chumbo font-accent text-xs tracking-wider uppercase font-medium hover:bg-branco/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-inox/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-inox text-xs font-light">© 2026 Babel Designs. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-inox text-xs hover:text-branco transition-colors font-light">Privacy Policy</a>
            <a href="#" className="text-inox text-xs hover:text-branco transition-colors font-light">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}