import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createContactMessage } from '@/integrations/supabase/contact';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

const subjectOptions = [
  'General Question',
  'Order Support',
  'Press / Partnership',
  'Wholesale / Trade',
  'Other',
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).');
      return;
    }

    setIsSubmitting(true);
    try {
      await createContactMessage(formData);
      trackEvent({ event: 'contact_submit_success', subject: formData.subject || 'unknown' });
      toast.success("Message sent. We'll be in touch within 48 hours.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      trackEvent({ event: 'contact_submit_failed' });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-48 md:pt-52">
      <section className="section-padding section-transition pt-0 pb-12">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Contact
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6 leading-tight">
              Get in touch.
            </h1>
            <p className="font-sans text-muted-foreground leading-relaxed max-w-xl">
              Have a quick question about an order, a piece, or anything else? Send us a message and
              we'll respond within 48 hours. Looking for a full design consultation instead?{' '}
              <a href="/consultancy" className="underline underline-offset-2 hover:text-foreground">
                Start a design brief
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding section-transition pt-0">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-border/70 bg-card/70 p-6">
                <Mail size={18} className="mb-3 text-foreground" />
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Email</p>
                <p className="font-sans text-sm text-foreground">getbabeldesigns@gmail.com</p>
              </div>
              <div className="border border-border/70 bg-card/70 p-6">
                <Clock size={18} className="mb-3 text-foreground" />
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Response Time</p>
                <p className="font-sans text-sm text-foreground">Within 48 hours</p>
              </div>
              <div className="border border-border/70 bg-card/70 p-6">
                <MessageCircle size={18} className="mb-3 text-foreground" />
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Order Support</p>
                <p className="font-sans text-sm text-foreground">
                  {/* Was a link to /track-order, hidden while the business is
                      consultancy-only (product sales paused); this now
                      points customers to email instead of a dead link. */}
                  Have an existing order? Email us directly with your order
                  reference and we'll help you track it.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8">
              <motion.form
                onSubmit={handleSubmit}
                className="border border-border/70 bg-background/80 p-7 md:p-9"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Name *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="contact-subject" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    title="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                  >
                    <option value="">Select...</option>
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6">
                  <label htmlFor="contact-message" className="mb-2 block font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full resize-none border border-border bg-background px-4 py-3 font-sans text-foreground outline-none transition-colors focus:border-foreground/60"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="mt-7 border-t border-border/70 pt-6">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full border border-foreground/35 bg-foreground py-4 font-sans text-sm uppercase tracking-[0.24em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
