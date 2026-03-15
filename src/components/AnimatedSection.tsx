import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { fadeInUpVariants, fadeInDownVariants, fadeInLeftVariants, fadeInRightVariants, scaleInVariants, blurVariants, easing } from '@/lib/animations';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  variant?: 'default' | 'fade' | 'scale' | 'blur';
}

const AnimatedSection = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  variant = 'default'
}: AnimatedSectionProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [skipReveal, setSkipReveal] = useState(false);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(0);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const sync = () => setIsCoarsePointer(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const disableMotion = prefersReducedMotion || isCoarsePointer;

  useEffect(() => {
    if (disableMotion) return;

    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const deltaY = Math.abs(currentY - lastScrollY.current);
      const deltaTime = Math.max(now - lastTimestamp.current, 16);
      const speed = deltaY / deltaTime;

      // If scroll speed is high, skip reveal animations to prevent delayed text pop-in.
      if (speed > 1.4) {
        setSkipReveal(true);
        if (resetTimer.current) window.clearTimeout(resetTimer.current);
        resetTimer.current = window.setTimeout(() => setSkipReveal(false), 200);
      }

      lastScrollY.current = currentY;
      lastTimestamp.current = now;
    };

    lastScrollY.current = window.scrollY;
    lastTimestamp.current = performance.now();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [disableMotion]);

  // Select the appropriate variants based on direction and variant
  const selectVariants = () => {
    if (variant === 'fade') return fadeInUpVariants;
    if (variant === 'scale') return scaleInVariants;
    if (variant === 'blur') return blurVariants;

    // default: choose based on direction
    switch (direction) {
      case 'down':
        return fadeInDownVariants;
      case 'left':
        return fadeInLeftVariants;
      case 'right':
        return fadeInRightVariants;
      default:
        return fadeInUpVariants;
    }
  };

  const variants = selectVariants();

  if (disableMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      initial={skipReveal ? false : 'hidden'}
      whileInView={skipReveal ? undefined : 'visible'}
      animate={skipReveal ? 'visible' : undefined}
      viewport={{ once: true, margin: '-150px' }}
      transition={skipReveal ? { duration: 0 } : { delay, ease: easing.smooth }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
