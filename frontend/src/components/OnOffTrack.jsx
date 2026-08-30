import React from 'react';
import { motion } from 'framer-motion';

export default function OnOffTrack() {
  return (
    <section
      id="on-off-track"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center -mt-6 md:-mt-12 pt-0 pb-12 md:pb-20"
      style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* 
        Background Layer: 
        Transparent container allowing the fluid WebGL contour lines from 
        LiquidMarbleBackground to continue seamlessly in full white (#FFFFFF).
      */}

      {/* ========================================================= */}
      {/* Left Edge Image (Helmet / Racing Profile)                  */}
      {/* Ultra-slow cinematic diagonal glide from bottom-corner     */}
      {/* ========================================================= */}
      <motion.img
        src="/left_side.png"
        alt="On Track Visual"
        initial={{ x: -280, y: 140, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 2.4, ease: [0.12, 0.9, 0.2, 1] }}
        className="absolute pointer-events-none select-none z-10 hidden md:block object-contain object-bottom"
        style={{
          position: 'absolute',
          left: '-13%',
          bottom: '0%',
          height: '132%',
          maxHeight: '138vh',
          width: 'auto',
          maxWidth: '56vw',
          transformOrigin: 'bottom left',
          zIndex: 10,
        }}
      />

      {/* ========================================================= */}
      {/* Right Edge Image (Side Profile / Portrait)                */}
      {/* Ultra-slow cinematic diagonal glide from bottom-corner     */}
      {/* ========================================================= */}
      <motion.img
        src="/right_side.png"
        onError={(e) => {
          e.currentTarget.src = '/ride_side.png';
        }}
        alt="Off Track Visual"
        initial={{ x: 280, y: 140, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 2.4, ease: [0.12, 0.9, 0.2, 1] }}
        className="absolute pointer-events-none select-none z-10 hidden md:block object-contain object-bottom"
        style={{
          position: 'absolute',
          right: '-13%',
          bottom: '0%',
          height: '120%',
          maxHeight: '126vh',
          width: 'auto',
          maxWidth: '52vw',
          transformOrigin: 'bottom right',
          zIndex: 10,
        }}
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
          {/* Column 1: ON TRACK (Left Side)                        */}
          {/* Glides inward slowly together with the photos         */}
          {/* ----------------------------------------------------- */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{ duration: 2.2, ease: [0.12, 0.9, 0.2, 1] }}
            className="flex flex-col items-start text-left"
          >
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
          </motion.div>

          {/* ----------------------------------------------------- */}
          {/* Column 2: OFF TRACK (Right Side)                       */}
          {/* Glides inward slowly together with the photos         */}
          {/* ----------------------------------------------------- */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{ duration: 2.2, ease: [0.12, 0.9, 0.2, 1] }}
            className="flex flex-col items-start text-left"
          >
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
          </motion.div>

        </div>
      </div>
    </section>
  );
}
