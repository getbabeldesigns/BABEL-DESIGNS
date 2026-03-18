import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { toast } from 'sonner';
import { createConsultancyRequest } from '@/integrations/supabase/consultancy';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

const Consultancy = () => {
  const consultationSlots = ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    timeline: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).');
      return;
    }

    setIsSubmitting(true);
    try {
      await createConsultancyRequest({
        ...formData,
        preferredDate: bookingDate || '',
        preferredSlot: selectedSlot || '',
      });
      trackEvent({ event: 'consultancy_submit_success', project_type: formData.projectType || 'unknown' });
      toast.success('Thank you for your inquiry. We will be in touch within 48 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        timeline: '',
        message: '',
      });
      setBookingDate('');
      setSelectedSlot('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit inquiry';
      trackEvent({ event: 'consultancy_submit_failed' });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const includes = [
    'Initial design consultation (90 minutes)',
    'Space analysis and material recommendations',
    'Custom furniture proposals with renderings',
    'Access to exclusive materials and finishes',
    'Ongoing project guidance and refinement',
  ];

  const idealFor = [
    'Private residences seeking singular pieces',
    'Hospitality projects requiring bespoke solutions',
    'Collectors building considered environments',
    'Architects seeking furniture partnerships',
  ];

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      {/* Header */}
      <section className="section-padding section-transition pt-0 pb-12">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Consultancy
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6 leading-tight">
              Begin your<br />
              design journey.
            </h1>
            <p className="font-sans text-muted-foreground leading-relaxed max-w-2xl">
              Our consultancy service offers a direct dialogue with our design team. 
              Whether you're furnishing a single room or an entire residence, we guide 
              you toward pieces that will become part of your life's story.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding section-transition bg-card">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* What's Included */}
            <AnimatedSection>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                What's Included
              </p>
              <motion.ul 
                className="space-y-4"
                variants={staggerContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
              >
                {includes.map((item, index) => (
                  <motion.li key={index} variants={staggerItemVariants} className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Check size={18} className="text-foreground mt-1 flex-shrink-0" />
                    </motion.div>
                    <span className="font-sans text-foreground">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatedSection>

            {/* Ideal For */}
            <AnimatedSection delay={0.15}>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Ideal For
              </p>
              <motion.ul 
                className="space-y-4"
                variants={staggerContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
              >
                {idealFor.map((item, index) => (
                  <motion.li 
                    key={index} 
                    variants={staggerItemVariants}
                    className="font-sans text-muted-foreground"
                    whileHover={{ x: 8 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section-padding section-transition">
        <div className="container-editorial">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-12">
            Our Process
          </p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {[
              {
                step: '01',
                title: 'Inquiry',
                description:
                  'Share your vision through our inquiry form. We review each submission personally and respond within 48 hours.',
              },
              {
                step: '02',
                title: 'Consultation',
                description:
                  'A 90-minute dialogue — in person or virtual — to understand your space, lifestyle, and design aspirations.',
              },
              {
                step: '03',
                title: 'Proposal',
                description:
                  'Receive a curated proposal with furniture recommendations, custom options, and material selections.',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={staggerItemVariants}
                whileHover={{ y: -8 }}
              >
                <p className="font-serif text-4xl text-muted-foreground/30 mb-4">
                  {item.step}
                </p>
                <h3 className="font-serif text-xl font-light text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Booking Form */}
      <section className="section-padding section-transition bg-card/70">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <aside className="relative overflow-hidden border border-border/70 bg-background/75 p-7 xl:col-span-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--sand)/0.26),transparent_38%),radial-gradient(circle_at_90%_80%,hsl(var(--foreground)/0.1),transparent_42%)]" />
              <div className="relative space-y-7">
                <div>
                  <p className="mb-3 font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Consultancy Desk</p>
                  <h2 className="font-serif text-3xl font-light leading-tight text-foreground">Let us shape your brief.</h2>
                </div>
                <div className="space-y-3">
                  {[
                    'Response within 48 hours',
                    'No consultation fee',
                    'Tailored to your space and timeline',
                  ].map((item) => (
                    <div key={item} className="border border-border/60 bg-background/65 px-4 py-3">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="border border-border/60 bg-background/70 p-4">
                  <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Selected schedule</p>
                  <p className="mt-2 font-serif text-xl text-foreground">
                    {bookingDate ? bookingDate : 'Date not selected'}
                  </p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {selectedSlot || 'Slot not selected'}
                  </p>
                </div>
              </div>
            </aside>

            <div className="xl:col-span-8">
              <motion.form
                onSubmit={handleSubmit}
                className="relative overflow-hidden border border-border/70 bg-background/80 p-7 md:p-9"
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,hsl(var(--background)/0.75)_0%,hsl(var(--foreground)/0.04)_100%)]" />
                <div className="relative space-y-7">
                  <div className="border-b border-border/70 pb-5">
                    <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted-foreground">Project Intake</p>
                    <p className="mt-3 font-serif text-3xl font-light text-foreground">Design consultation form</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                      { label: 'Name *', name: 'name', type: 'text', required: true },
                      { label: 'Email *', name: 'email', type: 'email', required: true },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          required={field.required}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                      { label: 'Phone', name: 'phone', type: 'tel' },
                      {
                        label: 'Project Type',
                        name: 'projectType',
                        type: 'select',
                        options: ['Private Residence', 'Hospitality', 'Commercial', 'Collection Piece'],
                      },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            name={field.name}
                            title={field.label}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleChange}
                            className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleChange}
                            className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="consultancy-preferred-date" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Preferred Date
                      </label>
                      <input
                        id="consultancy-preferred-date"
                        type="date"
                        value={bookingDate}
                        onChange={(event) => setBookingDate(event.target.value)}
                        className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Timeline
                      </label>
                      <select
                        name="timeline"
                        title="Timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                      >
                        <option value="">Select...</option>
                        {['Within 3 months', '3-6 months', '6-12 months', 'Planning phase'].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Preferred Slot
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {consultationSlots.map((slot) => {
                        const active = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`border px-3 py-3 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:border-foreground/40'}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Tell us about your project
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full resize-none border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                      placeholder="Describe your space, vision, and any specific pieces you're considering..."
                    />
                  </div>

                  <div className="space-y-3 border-t border-border/70 pt-6">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full border border-foreground/35 bg-foreground py-4 font-sans text-sm uppercase tracking-[0.24em] text-background transition-colors hover:bg-foreground/90"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Begin Your Design Journey'}
                    </motion.button>
                    <p className="text-center font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      No consultation fee. We never charge for this inquiry.
                    </p>
                  </div>
                </div>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consultancy;


