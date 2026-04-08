'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const lineLeftRef = useRef<HTMLDivElement>(null)
  const lineRightRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  // Floating particles on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; size: number; speed: number; opacity: number; drift: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.05,
        drift: (Math.random() - 0.5) * 0.5,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        // Subtle mouse influence
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          p.x -= dx * 0.002
          p.y -= dy * 0.002
        }

        p.y -= p.speed
        p.x += p.drift * 0.3

        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(117, 112, 111, ${p.opacity})`
        ctx.fill()
      })

      // Draw subtle connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(117, 112, 111, ${0.03 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  // Parallax on scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    // Split title letters for stagger
    if (titleRef.current) {
      const text = titleRef.current.textContent || ''
      titleRef.current.innerHTML = text
        .split('')
        .map((char) =>
          char === ' '
            ? '<span class="inline-block">&nbsp;</span>'
            : `<span class="inline-block" style="opacity:0;transform:translateY(80px) rotateX(90deg)">${char}</span>`
        )
        .join('')

      const chars = titleRef.current.querySelectorAll('span')
      tl.to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        stagger: 0.04,
        delay: 0.5,
      })
    }

    tl.fromTo(
      lineLeftRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
      '-=0.4'
    )
    tl.fromTo(
      lineRightRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
      '<'
    )
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 },
      '-=0.3'
    )
    tl.fromTo(
      scrollIndicatorRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3'
    )
  }, [])

  const parallaxOffset = scrollY * 0.4
  const opacityFade = Math.max(0, 1 - scrollY / 600)

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center bg-preto overflow-hidden grain-overlay"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: opacityFade }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(172,171,169,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center w-full px-6 md:px-12"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          opacity: opacityFade,
        }}
      >
        {/* Decorative lines flanking the title */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
          <div
            ref={lineLeftRef}
            className="h-[1px] w-16 md:w-28 bg-gradient-to-l from-inox/50 to-transparent origin-right"
          />
          
          <div
            ref={lineRightRef}
            className="h-[1px] w-16 md:w-28 bg-gradient-to-r from-inox/50 to-transparent origin-left"
          />
        </div>

        <h1
          ref={titleRef}
          className="font-hero text-branco font-normal leading-none mb-8"
          style={{
            fontSize: 'clamp(3rem, 5vw, 8rem)',
            letterSpacing: '0.08em',
            perspective: '800px',
          }}
        >
          BABEL DESIGNS
        </h1>

        <p
          ref={subtitleRef}
          className="text-inox tracking-[0.35em] uppercase font-light"
          style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.1rem)' }}
        >
          Crafted for all, Owned by few
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
        style={{ opacity: opacityFade }}
      >
        <span className="text-inox/50 text-[10px] tracking-[0.3em] uppercase font-accent">
          Scroll
        </span>
        <div className="w-[1px] h-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-inox/60 to-transparent animate-bounce" />
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-inox/10 z-10" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-inox/10 z-10" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b border-inox/10 z-10" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-inox/10 z-10" />
    </section>
  )
}
