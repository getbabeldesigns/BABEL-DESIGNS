'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const posts = [
  { label: 'Living Room', gradient: 'from-stone-300 to-stone-200' },
  { label: 'Kitchen Detail', gradient: 'from-neutral-300 to-zinc-200' },
  { label: 'Bedroom Suite', gradient: 'from-zinc-300 to-stone-200' },
  { label: 'Studio Space', gradient: 'from-stone-200 to-neutral-300' },
  { label: 'Material Study', gradient: 'from-neutral-200 to-stone-300' },
  { label: 'Workspace', gradient: 'from-zinc-200 to-neutral-300' },
  { label: 'Dining Room', gradient: 'from-stone-300 to-zinc-200' },
  { label: 'Terrace View', gradient: 'from-neutral-300 to-stone-200' },
]

export default function InstagramSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
        })
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-branco text-preto py-24 md:py-36 overflow-hidden">
      {/* Header */}
      <div ref={headerRef} className="max-w-[1440px] mx-auto px-6 md:px-12 mb-14 md:mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-[1px] bg-cinza/30" />
              <span className="text-cinza/50 text-[10px] font-accent tracking-[0.3em] uppercase">
                Instagram
              </span>
            </div>
            <h2
              className="font-display text-preto font-medium leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em' }}
            >
              Follow Our Journey
            </h2>
          </div>

          <a
            href="https://instagram.com/babeldesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-5 py-2.5 border border-preto/10 rounded-full hover:border-preto/30 hover:bg-preto/[0.03] transition-all duration-500"
          >
            <svg className="w-4 h-4 text-preto/60 group-hover:text-preto transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="font-accent text-[10px] tracking-[0.15em] uppercase text-preto/60 group-hover:text-preto transition-colors duration-300">
              @babeldesigns
            </span>
          </a>
        </div>
      </div>

      {/* Marquee row 1 */}
      <div className="mb-4 overflow-hidden">
        <div className="flex animate-marquee" style={{ animationDuration: '40s' }}>
          {[...posts, ...posts].map((post, index) => (
            <div
              key={`row1-${index}`}
              className="group relative flex-shrink-0 w-[280px] md:w-[320px] h-[280px] md:h-[320px] mx-2 overflow-hidden cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110`} />
              {/* Texture */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, black 0.5px, transparent 0)',
                backgroundSize: '14px 14px'
              }} />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-preto/0 group-hover:bg-preto/50 transition-all duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-center">
                  <div className="w-10 h-10 rounded-full border border-branco/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-4 h-4 text-branco" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                    </svg>
                  </div>
                  <span className="text-branco font-accent text-[9px] tracking-[0.2em] uppercase">{post.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee row 2 (reversed) */}
      <div className="overflow-hidden">
        <div className="flex animate-marquee-reverse" style={{ animationDuration: '45s' }}>
          {[...posts.slice(4), ...posts.slice(0, 4), ...posts.slice(4), ...posts.slice(0, 4)].map((post, index) => (
            <div
              key={`row2-${index}`}
              className="group relative flex-shrink-0 w-[280px] md:w-[320px] h-[280px] md:h-[320px] mx-2 overflow-hidden cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110`} />
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, black 0.5px, transparent 0)',
                backgroundSize: '14px 14px'
              }} />
              <div className="absolute inset-0 bg-preto/0 group-hover:bg-preto/50 transition-all duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-center">
                  <div className="w-10 h-10 rounded-full border border-branco/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-4 h-4 text-branco" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                    </svg>
                  </div>
                  <span className="text-branco font-accent text-[9px] tracking-[0.2em] uppercase">{post.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
