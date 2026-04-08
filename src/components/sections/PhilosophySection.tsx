'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const principles = [
  {
    number: '01',
    title: 'Integration Over Addition',
    text: 'We do not decorate spaces; we design systems where storage, structure, and surface exist as one. Minimalism achieved through thoughtful integration, not austere elimination.',
  },
  {
    number: '02',
    title: 'Material Honesty',
    text: 'Wood remains wood. Stone remains stone. We select materials for their inherent qualities and allow them to express their true nature, weathering time with grace.',
  },
  {
    number: '03',
    title: 'Functional Restraint',
    text: 'Every element must earn its place. If it serves no purpose, it serves no place in our designs. This discipline creates spaces of remarkable clarity.',
  },
  {
    number: '04',
    title: 'Timeless Duration',
    text: 'We design for decades, not seasons. Our work resists trends in favor of permanence, creating environments that improve with age and use.',
  },
]

export default function PhilosophySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(headingRef.current, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' }
        })
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 0.8, delay: i * 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%' }
          }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-preto text-branco relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }} />

      <div className="max-w-[1600px] mx-auto px-6 md:px-16 py-20 md:py-32 relative z-10">
        {/* Header - Redesigned */}
        <div ref={headingRef} className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-8 h-[1px] bg-inox/30" />
            <span className="text-inox/50 text-xs font-accent tracking-[0.3em] uppercase">
              Our Philosophy
            </span>
            <div className="w-8 h-[1px] bg-inox/30" />
          </div>
          <h2
            className="font-display text-branco font-medium leading-tight mb-5"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.02em' }}
          >
            Principles that guide every design decision
          </h2>
          <p className="text-inox/70 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Four foundational beliefs that shape how we create spaces and objects
          </p>
        </div>

        {/* Cards grid - Improved */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-[1400px] mx-auto">
          {principles.map((principle, index) => (
            <div
              key={principle.number}
              ref={(el) => { cardsRef.current[index] = el }}
              className="group relative bg-preto/40 backdrop-blur-sm p-8 md:p-12 border border-inox/10 hover:border-inox/25 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-inox/5 group-hover:border-inox/15 transition-colors duration-500" />

              <div className="relative z-10">
                {/* Number - Balanced size */}
                <div className="flex items-start justify-between mb-10">
                  <span className="text-inox/20 font-accent text-7xl md:text-8xl font-bold leading-none -mt-2 group-hover:text-inox/35 transition-colors duration-700">
                    {principle.number}
                  </span>
                  <div className="mt-2 px-3 py-1.5 border border-inox/15 rounded-full">
                    <span className="text-inox/40 text-[9px] font-accent tracking-[0.25em] uppercase">
                      Core {index + 1}
                    </span>
                  </div>
                </div>

                {/* Title - Better size */}
                <h3 className="font-display text-branco text-2xl md:text-3xl mb-5 leading-tight tracking-tight">
                  {principle.title}
                </h3>

                {/* Description - Readable size */}
                <p className="text-inox/70 text-base md:text-lg leading-relaxed font-light">
                  {principle.text}
                </p>

                {/* Bottom accent line */}
                <div className="mt-8 h-[1px] bg-gradient-to-r from-inox/20 via-inox/10 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 md:mt-28 text-center">
          <div className="inline-block">
            <p className="text-inox/50 text-sm md:text-base font-light mb-6">
              Ready to see these principles in action?
            </p>
            <button className="group inline-flex items-center gap-4 px-8 py-4 border border-inox/20 hover:border-branco/40 hover:bg-white/[0.02] transition-all duration-500">
              <span className="text-branco font-accent text-xs tracking-[0.2em] uppercase">
                Explore Collections
              </span>
              <svg className="w-4 h-4 text-branco group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}