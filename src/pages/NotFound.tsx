import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-[70vh] overflow-hidden px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute right-[14%] top-[22%] h-28 w-28 rounded-full bg-muted-foreground/20 blur-2xl" />
        <div className="absolute bottom-[14%] left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-foreground/10 blur-3xl" />
      </div>

      <div className="container-editorial relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl border border-border/60 bg-card/70 p-8 text-center backdrop-blur-sm md:p-12"
        >
          <motion.p
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.35em", opacity: 0.7 }}
            transition={{ duration: 0.8 }}
            className="mb-5 font-sans text-xs uppercase text-muted-foreground"
          >
            route lost in translation
          </motion.p>

          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 font-serif text-6xl font-light leading-none text-foreground sm:text-7xl md:text-8xl"
          >
            404
          </motion.h1>

          <p className="mx-auto mb-3 max-w-xl font-serif text-2xl font-light text-foreground sm:text-3xl">
            This page does not exist anymore.
          </p>
          <p className="mx-auto mb-8 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground">
            The address might be outdated, moved, or typed incorrectly. Use one of the links below to continue exploring.
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-foreground/35 px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ArrowLeft size={14} />
              Back Home
            </Link>
            <Link
              to="/consultancy"
              className="inline-flex items-center gap-2 border border-foreground/35 px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Compass size={14} />
              Book a Consultation
            </Link>
          </div>

          <p className="font-mono text-xs text-muted-foreground">
            Requested path: <span className="text-foreground">{location.pathname}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
