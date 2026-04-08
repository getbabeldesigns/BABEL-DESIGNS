'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lato } from 'next/font/google'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/sections/Footer'

const lato = Lato({ 
  subsets: ['latin'], 
  weight: ['300', '400', '700'],
})

export default function ConsultancyPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: '',
    budget: '',
    timeline: '',
    vision: ''
  })
  
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // Custom theme colors for this historic page
  const theme = {
    bg: '#fcfbf8',          // Parchment
    text: '#1a1c1d',        // Ink Charcoal
    accent: '#c0a062',      // Gold/Bronze
    border: 'rgba(26, 28, 29, 0.15)', // Light Ink
    borderFocus: '#c0a062'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => {
      alert('Your inquiry has been recorded. We shall be in correspondence shortly.')
      setFormData({ 
        firstName: '', lastName: '', email: '', phone: '',
        projectType: '', budget: '', timeline: '', vision: '' 
      })
    }, 800)
  }

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, damping: 25, stiffness: 90 }
    }
  }

  // A subtle noise overlay for historic texture
  const NoiseOverlay = () => (
    <div 
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}
    />
  )

  const InputField = ({ label, name, type = 'text', required = false, isTextArea = false }: any) => {
    const isFocused = focusedField === name
    const hasValue = formData[name as keyof typeof formData] !== ''
    const active = isFocused || hasValue

    return (
      <motion.div className="relative w-full mb-10 pt-5" variants={itemVars}>
        <label 
          htmlFor={name} 
          className="absolute left-0 transition-all duration-300 pointer-events-none"
          style={{
            top: active ? '-5px' : '20px',
            fontSize: active ? '10px' : '14px',
            color: active ? theme.accent : 'rgba(26, 28, 29, 0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: active ? '700' : '400'
          }}
        >
          {label} {required && '*'}
        </label>
        
        {isTextArea ? (
          <textarea
            name={name}
            id={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            required={required}
            className="w-full bg-transparent resize-none h-32 focus:outline-none relative z-10"
            style={{ 
              color: theme.text,
              borderBottom: `1px solid ${active ? 'transparent' : theme.border}`,
            }}
          />
        ) : (
          <input
            type={type}
            name={name}
            id={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            required={required}
            className="w-full bg-transparent focus:outline-none pb-2 relative z-10"
            style={{ 
              color: theme.text,
              borderBottom: `1px solid ${active ? 'transparent' : theme.border}`,
            }}
          />
        )}
        
        {/* Animated Bottom Border */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : (hasValue ? 1 : 0) }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ 
            bottom: isTextArea ? '5px' : 0, 
            backgroundColor: isFocused ? theme.accent : (hasValue ? theme.borderFocus : theme.accent), 
            transformOrigin: 'left',
            opacity: active ? (isFocused ? 1 : 0.5) : 0
          }}
          className="absolute left-0 w-full h-[1px] z-0"
        />
      </motion.div>
    )
  }

  const SelectField = ({ label, name, options, required = false }: any) => {
    const isFocused = focusedField === name
    const hasValue = formData[name as keyof typeof formData] !== ''
    const active = isFocused || hasValue

    return (
      <motion.div className="relative w-full mb-10 pt-5" variants={itemVars}>
        <label 
          htmlFor={name} 
          className="absolute left-0 transition-all duration-300 pointer-events-none"
          style={{
            top: active ? '-5px' : '20px',
            fontSize: active ? '10px' : '14px',
            color: active ? theme.accent : 'rgba(26, 28, 29, 0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: active ? '700' : '400'
          }}
        >
          {label} {required && '*'}
        </label>
        
        <select
          name={name}
          id={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          required={required}
          className="w-full bg-transparent focus:outline-none pb-2 appearance-none cursor-pointer relative z-10"
          style={{ 
            color: active ? theme.text : 'transparent', 
            borderBottom: `1px solid ${active ? 'transparent' : theme.border}`,
          }}
        >
          <option value="" disabled className="text-transparent"></option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value} style={{ color: theme.text }}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-0 top-[24px] pointer-events-none z-10" style={{ color: isFocused ? theme.accent : theme.border }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Animated Bottom Border */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : (hasValue ? 1 : 0) }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ 
            bottom: 0, 
            backgroundColor: isFocused ? theme.accent : (hasValue ? theme.borderFocus : theme.accent), 
            transformOrigin: 'left',
            opacity: active ? (isFocused ? 1 : 0.5) : 0
          }}
          className="absolute left-0 w-full h-[1px] z-0"
        />
      </motion.div>
    )
  }

  return (
    <div className={`${lato.className} min-h-screen relative`} style={{ backgroundColor: theme.bg, color: theme.text }}>
      <NoiseOverlay />
      
      {/* We keep the transparent theme for Navbar to blend with the parchment background */}
      <div className="relative z-20">
        <Navbar theme="dark" /> 
      </div>
      
      <main className="relative z-10 pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start"
          variants={containerVars}
          initial="hidden"
          animate="visible"
        >
          
          {/* Left Column: Historic Editorial Intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-40 h-full flex flex-col justify-center">
            
            <motion.div variants={itemVars} className="mb-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                  className="h-[1px]" 
                  style={{ backgroundColor: theme.accent }} 
                />
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ color: theme.accent }}>
                  The Consultation
                </span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={itemVars}
              className="font-light leading-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', letterSpacing: '-0.02em', color: theme.text }}
            >
              Composing<br /> Your Vision
            </motion.h1>
            
            <motion.p 
              variants={itemVars}
              className="text-lg md:text-xl font-light leading-relaxed mb-12 max-w-[400px]"
              style={{ color: 'rgba(26, 28, 29, 0.7)', letterSpacing: '0.01em' }}
            >
              Every monumental endeavor begins with a documented correspondence. Detail the essence of your architectural desires, and our curators will orchestrate the possibilities.
            </motion.p>
            
            <motion.div variants={itemVars} className="hidden lg:block relative">
              <motion.div 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.5, delay: 0.8, ease: "linear" }}
                className="w-[1px] h-32 mb-6 origin-top" 
                style={{ backgroundColor: theme.border }} 
              />
              <div className="text-xs uppercase tracking-[0.2em] font-light space-y-3 opacity-60">
                <p>Est. Studio Babel</p>
                <p>New York, NY</p>
              </div>
            </motion.div>
            
          </div>

          {/* Right Column: Dynamic Historic Form */}
          <div className="lg:col-span-7 mt-8 lg:mt-0">
            <motion.form 
              onSubmit={handleSubmit} 
              className="p-8 md:p-14 relative"
              variants={containerVars}
              style={{
                backgroundColor: 'rgba(252, 251, 248, 0.6)', 
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.border}`,
              }}
            >
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: theme.accent }} />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: theme.accent }} />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: theme.accent }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: theme.accent }} />

              <motion.div variants={itemVars} className="mb-14 pb-4 border-b text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(26, 28, 29, 0.4)', borderColor: theme.border }}>
                Inscription Requirements <span style={{color: theme.accent}}>*</span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <InputField label="First Name" name="firstName" required />
                <InputField label="Surname" name="lastName" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <InputField label="Email Address" name="email" type="email" required />
                <InputField label="Telephone" name="phone" type="tel" />
              </div>

              <SelectField 
                label="Scope of Endeavor" 
                name="projectType" 
                required 
                options={[
                  { label: "Residential Estate", value: "residential-full" },
                  { label: "Restoration / Renovation", value: "residential-renovation" },
                  { label: "Commercial Gallery / Retail", value: "commercial" },
                  { label: "Hospitality & Dining", value: "hospitality" },
                  { label: "Bespoke Artifacts", value: "furniture" }
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <SelectField 
                  label="Capital Allocation" 
                  name="budget" 
                  required 
                  options={[
                    { label: "$50k - $100k", value: "50-100k" },
                    { label: "$100k - $250k", value: "100-250k" },
                    { label: "$250k - $500k", value: "250-500k" },
                    { label: "Above $500k", value: "500k+" }
                  ]}
                />
                <InputField label="Anticipated Timeline" name="timeline" />
              </div>

              <InputField label="The Narrative (Detail your vision)" name="vision" isTextArea required />

              <motion.div variants={itemVars} className="mt-16 text-right sm:text-left flex justify-end">
                <button
                  type="submit"
                  className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden outline-none cursor-pointer"
                  style={{ color: theme.bg, backgroundColor: theme.text }}
                >
                  <span 
                    className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-right scale-x-0 group-hover:scale-x-100"
                    style={{ backgroundColor: theme.accent }} 
                  />
                  
                  <span className="relative z-10 text-[11px] font-bold tracking-[0.25em] uppercase flex items-center gap-4">
                    Transmit Inquiry
                    <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </motion.div>

            </motion.form>
          </div>
          
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
