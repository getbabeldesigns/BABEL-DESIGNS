'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function MottoSection() {
  const mottoRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    gsap.fromTo(
      mottoRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        scrollTrigger: {
          trigger: mottoRef.current,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        }
      }
    )

    gsap.fromTo(
      descRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: descRef.current,
          start: 'top 80%',
          end: 'top 60%',
          scrub: 1,
        }
      }
    )
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center bg-preto text-branco py-32 px-6">
      <div className="max-w-[1440px] px-6 md:px-12 text-center">
        <h2 
          ref={mottoRef}
          className="font-display font-normal mb-12 leading-tight"
          style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 6rem)',
            letterSpacing: '-0.01em'
          }}
        >
          Crafted for all, owned by few
        </h2>
        <p 
          ref={descRef}
          className="text-inox max-w-[800px] mx-auto leading-relaxed font-light"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)' }}
        >
          We design spaces and objects that exist at the intersection of necessity and beauty, 
          where every element justifies its presence through function before form.
        </p>
      </div>
    </section>
  )
}