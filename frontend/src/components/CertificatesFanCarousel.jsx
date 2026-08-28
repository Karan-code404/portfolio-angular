import { useState } from 'react';
import { motion } from 'framer-motion';

const certificates = [
  { 
    id: 1, 
    title: "AWS Cloud Foundations", 
    issuer: "Amazon Web Services",
    date: "Sept 2025", 
    img: "/aws academy cloud foundation.png" 
  },
  { 
    id: 2, 
    title: "AWS Cloud Practitioner", 
    issuer: "Amazon Web Services",
    date: "Sept 2025", 
    img: "/aws cloud practitioner essentials.png" 
  },
  { 
    id: 3, 
    title: "Postman Student Expert", 
    issuer: "Postman",
    date: "Sept 2025", 
    img: "/postman.png" 
  },
  { 
    id: 4, 
    title: "NVIDIA / Oracle Generative AI", 
    issuer: "Oracle & NVIDIA",
    date: "Sept 2025", 
    img: "/Oracle Cloud Infrastructure 2025 Certified Generative AI Professional.png" 
  },
  { 
    id: 5, 
    title: "IBM Data Analytics", 
    issuer: "IBM SkillsBuild",
    date: "Sept 2025", 
    img: "/AI fundamental with IBM skillsbuild course.png" 
  }
];

export default function CertificatesFanCarousel() {
  const [activeIndex, setActiveIndex] = useState(2); // Center card (Postman) by default

  return (
    <section className="relative w-full min-h-[850px] py-24 bg-[#1F2321] flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* Header Section */}
      <div className="text-center mb-16 z-30 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-[#00F0FF] border border-cyan-500/30 mb-4">
          <span>04. Verified Milestones</span>
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
          Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-teal-300">Credentials</span>
        </h2>
        <p className="mt-4 text-zinc-400 font-mono text-xs sm:text-sm max-w-md mx-auto">
          Click any milestone card to inspect credentials and fan through the deck.
        </p>
      </div>

      {/* The Fanned Deck Stage - Guaranteed Height & Center Origin */}
      <div className="relative w-full max-w-6xl h-[520px] flex items-center justify-center">
        {certificates.map((cert, index) => {
          const offset = index - activeIndex;
          const isCenter = offset === 0;

          return (
            <motion.div
              key={cert.id}
              onClick={() => setActiveIndex(index)}
              className={`absolute w-[290px] sm:w-[340px] md:w-[360px] h-[460px] sm:h-[490px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer bg-[#141715] border transition-colors duration-300 ${
                isCenter 
                  ? 'border-[#00F0FF] shadow-[0_0_45px_rgba(0,240,255,0.25)]' 
                  : 'border-white/10 hover:border-white/30'
              }`}
              initial={false}
              animate={{
                x: offset * 160,
                y: Math.abs(offset) * 30,
                rotate: offset * 5,
                scale: 1 - Math.abs(offset) * 0.06,
                zIndex: 20 - Math.abs(offset),
                opacity: Math.abs(offset) > 2 ? 0.2 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
                mass: 0.8
              }}
            >
              {/* Image Frame */}
              <div className="w-full h-full relative bg-zinc-950 flex flex-col justify-between p-6">
                <img
                  src={cert.img}
                  alt={cert.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />

                {/* Subtle vignette gradient so text is always razor sharp */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40 pointer-events-none" />

                {/* Card Top Tag */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-black/70 backdrop-blur-md text-[#00F0FF] border border-[#00F0FF]/30">
                    {cert.issuer}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    0{cert.id}
                  </span>
                </div>

                {/* Card Bottom Meta */}
                <div className="relative z-10 space-y-1.5">
                  <p className="text-[#00F0FF] font-mono text-xs uppercase tracking-widest font-semibold">
                    {cert.date}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {cert.title}
                  </h3>
                  {isCenter && (
                    <p className="text-[11px] font-mono text-teal-300/90 pt-1">
                      ● Active Selection
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="flex items-center gap-2 mt-12 z-30">
        {certificates.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-8 bg-[#00F0FF]' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
