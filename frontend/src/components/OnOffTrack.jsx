import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function OnOffTrack() {
  const sectionRef = useRef(null);

  // Scroll tracking across the sticky section (220vh total track)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // =========================================================================
  // Left Image Scroll Motion:
  // - 0.0 -> 0.35: Glides up & diagonally from bottom-left into position
  // - 0.35 -> 0.65: Locked in primary viewing frame
  // - 0.65 -> 1.00: Glides further inward closer to center as user continues scrolling
  // =========================================================================
  const leftX = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], ['-120px', '0px', '0px', '140px']);
  const leftY = useTransform(scrollYProgress, [0, 0.35, 1], ['180px', '0px', '0px']);
  const leftOpacity = useTransform(scrollYProgress, [0, 0.25], [0.2, 1]);

  // =========================================================================
  // Right Image Scroll Motion:
  // - 0.0 -> 0.35: Glides up & diagonally from bottom-right into position
  // - 0.35 -> 0.65: Locked in primary viewing frame
  // - 0.65 -> 1.00: Glides further inward closer to center as user continues scrolling
  // =========================================================================
  const rightX = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], ['120px', '0px', '0px', '-140px']);
  const rightY = useTransform(scrollYProgress, [0, 0.35, 1], ['180px', '0px', '0px']);
  const rightOpacity = useTransform(scrollYProgress, [0, 0.25], [0.2, 1]);

  // Center Content Scaling & Opacity
  const contentOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0.4, 1, 1, 0.9]);
  const contentY = useTransform(scrollYProgress, [0, 0.3, 1], ['40px', '0px', '0px']);

  return (
    <section
      id="on-off-track"
      ref={sectionRef}
      className="relative h-[220vh] w-full select-none"
    >
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* ========================================================= */}
        {/* Left Edge Image (Helmet / Racing Profile)                  */}
        {/* Enters diagonally from bottom-left & moves closer inward  */}
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
          }}
          className="pointer-events-none select-none hidden md:block object-contain object-bottom"
        />

        {/* ========================================================= */}
        {/* Right Edge Image (Side Profile / Portrait)                */}
        {/* Enters diagonally from bottom-right & moves closer inward */}
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
          }}
          className="pointer-events-none select-none hidden md:block object-contain object-bottom"
        />

        {/* ========================================================= */}
        {/* Central Content Container: 2-Column Split Layout          */}
        {/* ========================================================= */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 20,
            y: contentY,
            opacity: contentOpacity,
          }}
          className="w-full max-w-4xl lg:max-w-5xl mx-auto px-6 sm:px-12 md:px-16 lg:px-20 flex flex-col justify-center my-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 md:gap-12 lg:gap-20 items-start">
            
            {/* ----------------------------------------------------- */}
            {/* Column 1: ON TRACK (Left Side)                        */}
            {/* ----------------------------------------------------- */}
            <div className="flex flex-col items-start text-left">
              {/* Title with Serif "ON" + Sans-Serif "TRACK" */}
              <div className="flex flex-col items-start select-none mb-3 sm:mb-4">
                <span
                  className="text-6xl sm:text-7xl md:text-7xl lg:text-8xl xl:text-9xl font-normal italic text-[#181a17] tracking-tight leading-[0.9]"
                  style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
                >
                  ON
                </span>
                <h2
                  className="text-6xl sm:text-7xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter text-[#181a17] leading-[0.85] -mt-1 sm:-mt-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  TRACK
                </h2>
              </div>

              {/* Description */}
              <p className="text-[#333a33] font-normal text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-[280px] sm:max-w-xs mb-6">
                Most recent results, career stats and photos from trackside.
              </p>

              {/* Neon Lime Rounded Action Button */}
              <a
                href="#projects"
                aria-label="View on track work"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#ccff00] hover:bg-[#b5e600] flex items-center justify-center text-black transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-[0_4px_16px_rgba(204,255,0,0.35)] cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 10l5 5 5-5" transform="rotate(-90 12 12)" />
                  <path d="M4 4v7a4 4 0 0 0 4 4h11" />
                </svg>
              </a>
            </div>

            {/* ----------------------------------------------------- */}
            {/* Column 2: OFF TRACK (Right Side)                       */}
            {/* ----------------------------------------------------- */}
            <div className="flex flex-col items-start text-left">
              {/* Title with Serif "OFF" + Sans-Serif "TRACK" */}
              <div className="flex flex-col items-start select-none mb-3 sm:mb-4">
                <span
                  className="text-6xl sm:text-7xl md:text-7xl lg:text-8xl xl:text-9xl font-normal italic text-[#181a17] tracking-tight leading-[0.9]"
                  style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
                >
                  OFF
                </span>
                <h2
                  className="text-6xl sm:text-7xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter text-[#181a17] leading-[0.85] -mt-1 sm:-mt-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  TRACK
                </h2>
              </div>

              {/* Description */}
              <p className="text-[#333a33] font-normal text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-[280px] sm:max-w-xs mb-6">
                Campaigns, shoots and other such promotional materials for fans
              </p>

              {/* Neon Lime Rounded Action Button */}
              <a
                href="#about"
                aria-label="View off track content"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#ccff00] hover:bg-[#b5e600] flex items-center justify-center text-black transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-[0_4px_16px_rgba(204,255,0,0.35)] cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 10l5 5 5-5" transform="rotate(-90 12 12)" />
                  <path d="M4 4v7a4 4 0 0 0 4 4h11" />
                </svg>
              </a>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
