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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createConsultancyRequest(formData);
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
                  'A 90-minute dialogue â€” in person or virtual â€” to understand your space, lifestyle, and design aspirations.',
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
      <section className="section-padding section-transition bg-card">
        <div className="container-editorial">
          <div className="max-w-2xl mx-auto">
            <motion.form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Name *', name: 'name', type: 'text', required: true },
                    { label: 'Email *', name: 'email', type: 'email', required: true },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">
                        {field.label}
                      </label>
                      <motion.input
                        type={field.type}
                        name={field.name}
                        required={field.required}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        className="w-full bg-background border border-border px-4 py-3 font-sans text-foreground focus:outline-none focus:border-foreground transition-colors"
                        whileFocus={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Phone', name: 'phone', type: 'tel' },
                    { label: 'Project Type', name: 'projectType', type: 'select', options: ['Private Residence', 'Hospitality', 'Commercial', 'Collection Piece'] },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          name={field.name}
                          title={field.label}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          className="w-full bg-background border border-border px-4 py-3 font-sans text-foreground focus:outline-none focus:border-foreground transition-colors"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt.toLowerCase().replace(/\s+/g, '-')}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <motion.input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          className="w-full bg-background border border-border px-4 py-3 font-sans text-foreground focus:outline-none focus:border-foreground transition-colors"
                          whileFocus={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      label: 'Timeline', 
                      name: 'timeline', 
                      type: 'select',
                      options: ['Within 3 months', '3-6 months', '6-12 months', 'Planning phase']
                    },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">
                        {field.label}
                      </label>
                      <select
                        name={field.name}
                        title={field.label}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        className="w-full bg-background border border-border px-4 py-3 font-sans text-foreground focus:outline-none focus:border-foreground transition-colors"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt.toLowerCase().replace(/[\s,+$]+/g, '-')}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">
                    Tell us about your project
                  </label>
                  <motion.textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-background border border-border px-4 py-3 font-sans text-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                    placeholder="Describe your space, vision, and any specific pieces you're considering..."
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }}
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  data-cursor="Submit"
                  className="w-full font-sans text-sm tracking-widest uppercase bg-foreground text-background py-4 hover:bg-foreground/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Begin Your Design Journey'}
                </motion.button>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consultancy;


