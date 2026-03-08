import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="container-editorial section-padding relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.div variants={staggerItemVariants} className="md:col-span-2">
            <motion.h3
              className="logo-title text-2xl font-light tracking-widest mb-6 transition-colors duration-300"
              whileHover={{ color: 'var(--foreground)' }}
              transition={{ duration: 0.3 }}
            >
              BABEL DESIGNS
            </motion.h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-md">
              Crafted from stone, wood, metal, and intention - design that transcends language, culture, and time.
            </p>
            <p className="mt-8 font-serif text-lg text-foreground/80">
              "Design that unites all diversities."
            </p>
          </motion.div>

          <motion.div variants={staggerItemVariants}>
            <h4 className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-6">
              Navigate
            </h4>
            <motion.ul className="space-y-3" variants={staggerContainerVariants}>
              {[
                { path: '/collections', label: 'Collections' },
                { path: '/blogs', label: 'Blogs' },
                { path: '/philosophy', label: 'Philosophy' },
                { path: '/consultancy', label: 'Consultancy' },
              ].map((link) => (
                <motion.li key={link.path} variants={staggerItemVariants}>
                  <Link
                    to={link.path}
                    data-cursor="Open"
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    <motion.span
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div variants={staggerItemVariants}>
            <h4 className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-6">
              Legal
            </h4>
            <motion.ul className="space-y-3" variants={staggerContainerVariants}>
              {[
                { path: '/return-policy', label: 'Return Policy' },
                { path: '/refund-policy', label: 'Refund Policy' },
                { path: '/privacy-policy', label: 'Privacy Policy' },
                { path: '/disclaimer', label: 'Disclaimer' },
              ].map((link) => (
                <motion.li key={link.path} variants={staggerItemVariants}>
                  <Link
                    to={link.path}
                    data-cursor="Open"
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    <motion.span
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={staggerItemVariants}>
                <a
                  href="mailto:studio@babeldesigns.com"
                  data-cursor="Email"
                  className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                >
                  <motion.span whileHover={{ x: 4 }} transition={{ duration: 0.2 }} className="inline-block">
                    studio@babeldesigns.com
                  </motion.span>
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="font-sans text-xs text-muted-foreground tracking-wide">
            © {new Date().getFullYear()} Babel Designs. All rights reserved.
          </p>
          <p className="font-serif text-sm text-muted-foreground">Crafted forms. Deliberate materials.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
