'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/sections/Footer'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const approaches = [
  { number: '01', title: 'Integration Over Addition', text: 'We do not decorate spaces; we design systems where storage, structure, and surface exist as one.' },
  { number: '02', title: 'Material Honesty', text: 'Wood remains wood. Stone remains stone. We allow materials to express their true nature.' },
  { number: '03', title: 'Functional Restraint', text: 'Every element must earn its place. This discipline creates spaces of remarkable clarity.' },
  { number: '04', title: 'Timeless Duration', text: 'We design for decades, not seasons. Creating environments that improve with age and use.' },
]

const stats = [
  { value: '150+', label: 'Projects Completed' },
  { value: '12', label: 'Years of Experience' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '25+', label: 'Design Awards' },
]

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<(HTMLDivElement | null)[]>([])
  const storyRef = useRef<HTMLDivElement>(null)
  const approachRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text reveal
      if (heroRef.current) {
        const heading = heroRef.current.querySelector('h1')
        if (heading) {
          const words = heading.textContent?.split(' ') || []
          heading.innerHTML = words.map(w => `<span class="inline-block overflow-hidden mr-[0.3em]"><span class="inline-block" style="transform:translateY(100%);opacity:0">${w}</span></span>`).join('')
          const inner = heading.querySelectorAll('span > span')
          gsap.to(inner, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.4 })
        }

        const elements = heroRef.current.querySelectorAll('.reveal-up')
        gsap.fromTo(elements, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, delay: 0.8, ease: 'power3.out' })
      }

      // Stats counter animation
      statsRef.current.forEach((stat, i) => {
        if (!stat) return
        gsap.fromTo(stat, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: stat, start: 'top 90%' }
        })
      })

      // Story section
      if (storyRef.current) {
        const paras = storyRef.current.querySelectorAll('.story-para')
        paras.forEach((p, i) => {
          gsap.fromTo(p, { opacity: 0, x: -40 }, {
            opacity: 1, x: 0, duration: 0.8, delay: i * 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: p, start: 'top 85%' }
          })
        })
      }

      // Approach cards
      approachRef.current.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el, { opacity: 0, y: 60, scale: 0.95 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' }
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <Navbar theme="dark" />
      <main className="bg-branco min-h-screen">
        {/* Hero - Dark fullscreen */}
        <section className="relative min-h-[80vh] flex items-end bg-preto overflow-hidden grain-overlay">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 70% 50% at 70% 50%, rgba(44,44,44,0.5) 0%, transparent 70%)'
          }} />

          {/* Corner accents */}
          <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-inox/10 z-10" />
          <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-inox/10 z-10" />

          <div ref={heroRef} className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 pb-20 md:pb-28 pt-40 w-full">
            <div className="flex items-center gap-4 mb-8 reveal-up">
              <div className="w-10 h-[1px] bg-inox/30" />
              <span className="text-inox/40 text-[10px] font-accent tracking-[0.4em] uppercase">About Us</span>
            </div>
            <h1
              className="font-display text-branco leading-[1.05] mb-10 max-w-3xl"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}
            >
              Designing spaces where silence speaks volumes
            </h1>
            <p className="reveal-up text-inox/50 text-lg md:text-xl leading-relaxed font-light max-w-2xl">
              Babel Designs emerged from a simple observation: true luxury is not found in excess,
              but in the honest marriage of material and purpose.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-preto border-t border-white/[0.04] py-0">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  ref={(el) => { statsRef.current[i] = el }}
                  className={`py-10 md:py-14 ${i < 3 ? 'border-r border-white/[0.04]' : ''} text-center`}
                >
                  <span className="block font-hero text-branco text-3xl md:text-4xl mb-2">{stat.value}</span>
                  <span className="text-inox/40 text-[10px] font-accent tracking-[0.2em] uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24 md:py-36 px-6">
          <div ref={storyRef} className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <div className="w-10 h-[1px] bg-cinza/30 mb-6" />
                  <h2 className="font-display text-preto text-3xl md:text-4xl leading-tight">
                    Our Story
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-8">
                <p className="story-para text-cinza text-lg md:text-xl leading-relaxed font-light">
                  We design spaces and objects that exist at the intersection of necessity and beauty,
                  where every element justifies its presence through function before form.
                </p>
                <p className="story-para text-cinza text-lg md:text-xl leading-relaxed font-light">
                  In a world saturated with ornament masquerading as design, we return to first principles.
                  Our work asks: what remains when everything unnecessary is removed? The answer is not
                  emptiness, but essence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do - Dark section with reveal */}
        <section className="bg-preto text-branco py-24 md:py-36 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <div className="w-10 h-[1px] bg-inox/20 mb-6" />
                  <h2 className="font-display text-branco text-3xl md:text-4xl leading-tight">
                    What We Do
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-8">
                <p className="text-inox/60 text-lg md:text-xl leading-relaxed font-light">
                  Babel Designs offers comprehensive interior design services focused on residential and
                  small commercial spaces. Our process begins with understanding how you inhabit space.
                </p>
                <p className="text-inox/60 text-lg md:text-xl leading-relaxed font-light">
                  We also design custom furniture pieces, each conceived for specific spaces and uses.
                  Currently, fabrication is handled through trusted partnerships, with a long-term vision
                  to bring production in-house.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-24 md:py-36 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-16 md:mb-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-[1px] bg-cinza/30" />
                <span className="text-cinza/50 text-[10px] font-accent tracking-[0.3em] uppercase">
                  Methodology
                </span>
              </div>
              <h2
                className="font-display text-preto leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em' }}
              >
                Our Approach
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {approaches.map((item, index) => (
                <div
                  key={item.number}
                  ref={(el) => { approachRef.current[index] = el }}
                  className="group relative p-8 md:p-10 border border-preto/[0.06] hover:border-preto/20 transition-all duration-700 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-preto/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10">
                    <span className="text-cinza/15 font-accent text-[56px] md:text-[64px] font-bold leading-none block mb-6 group-hover:text-cinza/30 transition-colors duration-700">
                      {item.number}
                    </span>
                    <h3 className="font-display text-preto text-2xl md:text-3xl mb-4 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-cinza text-base leading-relaxed font-light">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32 px-6 bg-preto relative overflow-hidden grain-overlay">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(44,44,44,0.4) 0%, transparent 70%)'
          }} />
          <div className="max-w-[1200px] mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="w-8 h-[1px] bg-inox/20" />
              <span className="text-inox/30 text-[10px] font-accent tracking-[0.4em] uppercase">Collaborate</span>
              <div className="w-8 h-[1px] bg-inox/20" />
            </div>
            <h2
              className="font-display text-branco mb-10 leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
            >
              Let&apos;s Create Together
            </h2>
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
