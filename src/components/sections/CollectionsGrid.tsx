'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const collections = [
  {
    name: 'Essence',
    description: 'Functional minimalism distilled to its purest form. Every piece serves a purpose, nothing more.',
    tag: 'Minimal',
  },
  {
    name: 'Permanence',
    description: 'Timeless structures designed to improve with age. Built for decades, not seasons.',
    tag: 'Enduring',
  },
  {
    name: 'Integration',
    description: 'Seamless living where storage, structure, and surface exist as one cohesive system.',
    tag: 'Unified',
  },
]

export default function CollectionsGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      if (headingRef.current) {
        gsap.fromTo(headingRef.current, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' }
        })
      }

      // Horizontal scroll
      if (trackRef.current && sectionRef.current) {
        const track = trackRef.current
        const totalScroll = track.scrollWidth - window.innerWidth + 100

        gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          }
        })

        // Parallax each card's inner content
        cardsRef.current.forEach((card) => {
          if (!card) return
          const inner = card.querySelector('.card-inner') as HTMLElement
          if (!inner) return
          gsap.fromTo(inner, { y: 40, opacity: 0.5 }, {
            y: -20, opacity: 1, ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: gsap.getById?.('hscroll') || undefined,
              start: 'left right',
              end: 'right left',
              scrub: true,
            }
          })
        })
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="collections" className="bg-branco overflow-hidden">
      {/* Header - Fixed: Left aligned with subtitle below */}
      <div ref={headingRef} className="pt-28 md:pt-36 pb-16 md:pb-20 px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="max-w-xl">
          <h2
            className="font-display text-preto font-medium leading-none mb-4"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', letterSpacing: '-0.03em' }}
          >
            Our Collections
          </h2>
          <p className="text-cinza text-base md:text-lg font-light leading-relaxed">
            Where form meets function in perfect harmony. Scroll to explore.
          </p>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div ref={trackRef} className="flex gap-6 md:gap-8 pl-6 md:pl-12 pb-20 pr-[20vw]">
        {collections.map((collection, index) => (
          <div
            key={collection.name}
            ref={(el) => { cardsRef.current[index] = el }}
            className="group relative flex-shrink-0 w-[80vw] md:w-[45vw] lg:w-[35vw] h-[70vh] md:h-[75vh] cursor-pointer overflow-hidden"
          >
            {/* Card bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-150 to-neutral-100 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Content - Fixed: Proper padding and text containment */}
            <div className="card-inner absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
              {/* Top */}
              <div className="flex items-start justify-between">
                <span className="text-cinza/30 font-accent text-[70px] md:text-[90px] font-bold leading-none -ml-1 transition-colors duration-500 group-hover:text-cinza/50">
                  0{index + 1}
                </span>
                <span className="text-cinza/40 text-[9px] font-accent tracking-[0.25em] uppercase mt-2 px-2.5 py-1.5 border border-cinza/15 rounded-full group-hover:border-cinza/30 transition-all duration-500 whitespace-nowrap">
                  {collection.tag}
                </span>
              </div>

              {/* Bottom - Fixed: Contained within card */}
              <div className="w-full">
                <h3 className="font-display text-preto text-3xl md:text-4xl lg:text-5xl mb-3 leading-tight tracking-tight">
                  {collection.name}
                </h3>
                <p className="text-cinza text-sm md:text-base leading-relaxed font-light mb-6 pr-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {collection.description}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-[1px] bg-preto/20 group-hover:w-16 transition-all duration-500" />
                  <span className="text-preto font-accent text-[10px] tracking-[0.2em] uppercase font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                    Explore
                  </span>
                  <svg className="w-4 h-4 text-preto opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hover border */}
            <div className="absolute inset-0 border border-preto/0 group-hover:border-preto/10 transition-all duration-700 pointer-events-none z-20" />
          </div>
        ))}
      </div>
    </section>
  )
}