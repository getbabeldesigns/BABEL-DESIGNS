'use client'

import Navbar from '@/components/navbar/Navbar'
import Hero from '@/components/hero/Hero'
import CollectionsGrid from '@/components/sections/CollectionsGrid'
import PhilosophySection from '@/components/sections/PhilosophySection'
import CTASection from '@/components/sections/CTASection'
import InstagramSection from '@/components/sections/InstagramSection'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Navbar theme="dark" />
      <main>
        <Hero />
        <CollectionsGrid />
        <PhilosophySection />
        <CTASection />
        <InstagramSection />
      </main>
      <Footer />
    </>
  )
}
