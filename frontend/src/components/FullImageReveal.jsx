import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function FullImageReveal() {
  const containerRef = useRef(null);

  // Scroll tracking across the curtain reveal section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Silky smooth physics for subtle parallax depth
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    restDelta: 0.001,
  });

  // Smooth subtle scale and opacity
  const imageScale = useTransform(smoothProgress, [0, 0.5, 1], [0.98, 1.0, 1.02]);
  const imageOpacity = useTransform(smoothProgress, [0, 0.2, 0.8], [0.7, 1.0, 1.0]);

  return (
    <section
      ref={containerRef}
      id="curtain-reveal"
      className="relative z-20 w-full h-[115vh] min-h-[115vh] overflow-hidden bg-black shadow-[0_-30px_60px_rgba(0,0,0,0.9)]"
      style={{
        width: '100%',
        height: '115vh',
        minHeight: '115vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Full Bleed 100% Screen Viewport - Image covers full width and height with top hair intact */}
      <div className="relative w-full h-full overflow-hidden">
        <motion.img
          src="/fullimage.jpeg"
          alt="Full Visual"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/profile-placeholder.svg';
          }}
          style={{
            scale: imageScale,
            opacity: imageOpacity,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="w-full h-full object-cover object-top select-none pointer-events-none"
        />
      </div>
    </section>
  );
}
