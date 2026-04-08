'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (textRef.current) {
        const elements = textRef.current.children
        gsap.fromTo(elements, { opacity: 0, y: 60, filter: 'blur(8px)' }, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' }
        })
      }
    })
    return () => ctx.revert()
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden py-0 min-h-[80vh] flex items-center grain-overlay"
      style={{
        background: `radial-gradient(ellipse 80% 60% at ${mousePos.x}% ${mousePos.y}%, rgba(44,44,44,1) 0%, rgba(18,18,18,1) 70%)`,
        transition: 'background 0.3s ease',
      }}
    >
      {/* Animated border lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-inox/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-inox/20 to-transparent" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 py-32 md:py-44 w-full">
        <div ref={textRef} className="max-w-3xl mx-auto text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-4 mb-10">
            <div className="w-8 h-[1px] bg-inox/30" />
            <span className="text-inox/50 text-[10px] font-accent tracking-[0.4em] uppercase">
              Start Your Project
            </span>
            <div className="w-8 h-[1px] bg-inox/30" />
          </div>

          {/* Heading */}
          <h2
            className="font-display text-branco font-medium mb-8 leading-[1.05]"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}
          >
            Ready to transform
            <br />
            <span className="font-display italic text-inox/70">your space?</span>
          </h2>

          {/* Description */}
          <p className="text-inox/50 text-lg md:text-xl leading-relaxed font-light mb-14 max-w-xl mx-auto">
            Our design process begins with understanding how you inhabit your environment.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pages/consultancy"
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-branco text-preto font-accent text-[11px] tracking-[0.2em] uppercase font-semibold overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-branco">Book a Consultation</span>
              <svg className="relative z-10 w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-branco" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-preto scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
            <Link
              href="/pages/about"
              className="group inline-flex items-center gap-3 px-10 py-5 border border-inox/15 text-inox/60 font-accent text-[11px] tracking-[0.2em] uppercase font-medium hover:border-branco/40 hover:text-branco transition-all duration-500"
            >
              Our Philosophy
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
