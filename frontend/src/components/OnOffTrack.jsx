import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function OnOffTrack() {
  const sectionRef = useRef(null);

  // Scroll tracking from the moment the section enters the viewport
  // until it is fully centered in view
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Silky smooth spring physics for fluid responsiveness on scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001,
  });

  // =========================================================================
  // Scroll-linked diagonal & inward motion:
  // Smoothly glides inward without micro-stutter
  // =========================================================================
  const leftX = useTransform(smoothProgress, [0, 1], ['-180px', '0px']);
  const leftY = useTransform(smoothProgress, [0, 1], ['40px', '0px']);
  const leftOpacity = useTransform(smoothProgress, [0, 0.35, 1], [0.3, 0.85, 1]);

  const rightX = useTransform(smoothProgress, [0, 1], ['180px', '0px']);
  const rightY = useTransform(smoothProgress, [0, 1], ['40px', '0px']);
  const rightOpacity = useTransform(smoothProgress, [0, 0.35, 1], [0.3, 0.85, 1]);

  // Central Text blocks moving inward together with scroll
  const textLeftX = useTransform(smoothProgress, [0, 1], ['-50px', '0px']);
  const textRightX = useTransform(smoothProgress, [0, 1], ['50px', '0px']);
  const textOpacity = useTransform(smoothProgress, [0, 0.25, 0.8], [0.35, 0.85, 1]);

  return (
    <section
      id="on-off-track"
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center -mt-10 md:-mt-20 pt-0 pb-12 md:pb-20"
      style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* 
        Background Layer: 
        Transparent container allowing the fluid WebGL contour lines from 
        LiquidMarbleBackground to continue seamlessly in full white (#FFFFFF).
      */}

      {/* ========================================================= */}
      {/* Left Edge Image (Helmet / Racing Profile)                  */}
      {/* Moves inward & upward directly as you scroll               */}
      {/* ========================================================= */}
      <motion.img
        src="/left_side.png"
        alt="On Track Visual"
        style={{
          position: 'absolute',
          left: '-13%',
          bottom: '0%',
          height: '132%',
          maxHeight: '138vh',
          width: 'auto',
          maxWidth: '56vw',
          transformOrigin: 'bottom left',
          x: leftX,
          y: leftY,
          opacity: leftOpacity,
          zIndex: 10,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="pointer-events-none select-none hidden md:block object-contain object-bottom"
      />

      {/* ========================================================= */}
      {/* Right Edge Image (Side Profile / Portrait)                */}
      {/* Moves inward & upward directly as you scroll               */}
      {/* ========================================================= */}
      <motion.img
        src="/right_side.png"
        onError={(e) => {
          e.currentTarget.src = '/ride_side.png';
        }}
        alt="Off Track Visual"
        style={{
          position: 'absolute',
          right: '-13%',
          bottom: '0%',
          height: '120%',
          maxHeight: '126vh',
          width: 'auto',
          maxWidth: '52vw',
          transformOrigin: 'bottom right',
          x: rightX,
          y: rightY,
          opacity: rightOpacity,
          zIndex: 10,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="pointer-events-none select-none hidden md:block object-contain object-bottom"
      />

      {/* ========================================================= */}
      {/* Central Content Container: 2-Column Split Layout          */}
      {/* ========================================================= */}
      <div
        className="relative z-20 w-full max-w-4xl lg:max-w-5xl mx-auto px-6 sm:px-12 md:px-16 lg:px-20 flex flex-col justify-center my-auto"
        style={{ position: 'relative', zIndex: 20 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 md:gap-12 lg:gap-20 items-start">
          
          {/* ----------------------------------------------------- */}
          {/* Column 1: BUILDING LOGIC (Robot / Left Side)          */}
          {/* Glides inward synchronously with user's scroll         */}
          {/* ----------------------------------------------------- */}
          <motion.div
            style={{
              x: textLeftX,
              opacity: textOpacity,
            }}
            className="flex flex-col items-start text-left"
          >
            {/* Title with Serif "BUILDING" + Sans-Serif "LOGIC" */}
            <div className="flex flex-col items-start select-none mb-3 sm:mb-4">
              <span
                className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-normal italic text-[#181a17] tracking-tight leading-[0.9]"
                style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
              >
                BUILDING
              </span>
              <h2
                className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter text-[#181a17] leading-[0.85] -mt-1 sm:-mt-2"
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                LOGIC
              </h2>
            </div>

            {/* Description */}
            <p className="text-[#333a33] font-normal text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-[280px] sm:max-w-xs mb-6">
              Problem solving, core algorithms, data structures &amp; competitive programming milestones.
            </p>

            {/* Cyan Action Button - LeetCode */}
            <a
              href="https://leetcode.com/u/Karanshakya34/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View LeetCode Profile"
              className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-[#00F0FF] hover:bg-[#2bf4ff] text-black font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(0,240,255,0.4)] hover:shadow-[0_6px_28px_rgba(0,240,255,0.65)] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.649 1.837-.649s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.609-2.636a5.21 5.21 0 0 0-3.85-1.503c-1.465 0-2.846.571-3.882 1.607L3.383 11.05A5.49 5.49 0 0 0 1.77 14.944c0 1.464.571 2.845 1.607 3.881l4.332 4.364c1.036 1.035 2.417 1.606 3.882 1.606 1.464 0 2.845-.571 3.881-1.606l2.609-2.636c.514-.514.496-1.365-.039-1.901-.535-.535-1.386-.553-1.9-.038zM20.811 13.01H10.597c-.742 0-1.344.602-1.344 1.344s.602 1.344 1.344 1.344h10.214c.742 0 1.344-.602 1.344-1.344s-.602-1.344-1.344-1.344z"/>
              </svg>
              <span>LeetCode</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          </motion.div>

          {/* ----------------------------------------------------- */}
          {/* Column 2: IMPLEMENTING LOGIC (Human / Right Side)     */}
          {/* Glides inward synchronously with user's scroll         */}
          {/* ----------------------------------------------------- */}
          <motion.div
            style={{
              x: textRightX,
              opacity: textOpacity,
            }}
            className="flex flex-col items-start text-left"
          >
            {/* Title with Serif "IMPLEMENTING" + Sans-Serif "LOGIC" */}
            <div className="flex flex-col items-start select-none mb-3 sm:mb-4">
              <span
                className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-normal italic text-[#181a17] tracking-tight leading-[0.9]"
                style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
              >
                IMPLEMENTING
              </span>
              <h2
                className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter text-[#181a17] leading-[0.85] -mt-1 sm:-mt-2"
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                LOGIC
              </h2>
            </div>

            {/* Description */}
            <p className="text-[#333a33] font-normal text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-[280px] sm:max-w-xs mb-6">
              Production architectures, full-stack applications &amp; open-source repositories.
            </p>

            {/* Cyan Action Button - GitHub */}
            <a
              href="https://github.com/Karan-code404"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View GitHub Profile"
              className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-[#00F0FF] hover:bg-[#2bf4ff] text-black font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(0,240,255,0.4)] hover:shadow-[0_6px_28px_rgba(0,240,255,0.65)] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
