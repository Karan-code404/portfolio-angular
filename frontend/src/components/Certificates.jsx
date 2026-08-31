import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from 'framer-motion';
import { Eye, X, Award, ExternalLink, Sparkles } from 'lucide-react';

const certificates = [
  {
    id: 1,
    title: "AWS Academy Cloud Foundations",
    issuer: "Amazon Web Services",
    date: "Sept 2025",
    img: "/aws academy cloud foundation.png",
    align: "start",
    size: "large",
    tag: "Cloud Architecture"
  },
  {
    id: 2,
    title: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services",
    date: "Sept 2025",
    img: "/aws cloud practitioner essentials.png",
    align: "end",
    size: "medium",
    tag: "Core Cloud"
  },
  {
    id: 3,
    title: "Postman Student Expert",
    issuer: "Postman API Network",
    date: "Sept 2025",
    img: "/postman.png",
    align: "center",
    size: "small",
    tag: "API Engineering"
  },
  {
    id: 4,
    title: "Oracle Certified Generative AI Professional",
    issuer: "Oracle Cloud Infrastructure",
    date: "2025",
    img: "/Oracle Cloud Infrastructure 2025 Certified Generative AI Professional.png",
    align: "start",
    size: "large",
    tag: "Generative AI"
  },
  {
    id: 5,
    title: "IBM SkillsBuild AI Fundamentals",
    issuer: "IBM",
    date: "Sept 2025",
    img: "/AI fundamental with IBM skillsbuild course.png",
    align: "end",
    size: "medium",
    tag: "Machine Learning"
  },
  {
    id: 6,
    title: "Data Science & Analytics",
    issuer: "HP LIFE Foundation",
    date: "Aug 2025",
    img: "/data science and analytics.png",
    align: "center",
    size: "small",
    tag: "Data Analytics"
  },
  {
    id: 7,
    title: "Hashgraph Developer Certified",
    issuer: "Hedera",
    date: "2025",
    img: "/hashgraph developer.png",
    align: "start",
    size: "medium",
    tag: "Distributed Systems"
  },
  {
    id: 8,
    title: "Tata Crucial Hackathon",
    issuer: "Tata Consultancy Services",
    date: "2025",
    img: "/tata crucial hackathon.png",
    align: "end",
    size: "large",
    tag: "Hackathon Winner"
  }
];

export default function Certificates() {
  const targetRef = useRef(null);
  const viewportRef = useRef(null);
  const [selectedCert, setSelectedCert] = useState(null);

  // 1. Scroll progress mapped strictly to the Certificates container
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Silky smooth spring physics for horizontal glide (reduces jerkiness & gives meditative slow flow)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 20,
    restDelta: 0.001
  });

  // Precision Trigger: fires when section viewport is in view (once: true prevents re-animating/sliding out when leaving section)
  const isInView = useInView(viewportRef, {
    once: true,
    amount: 0.2
  });

  // 2. Horizontal track motion using silky spring
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-78%"]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Background lets the single global continuous water wave background show through
  const sectionBg = useTransform(smoothProgress, [0, 0.6, 1], ["transparent", "transparent", "transparent"]);
  const headingColor = useTransform(smoothProgress, [0, 0.85], ["#FFFFFF", "#09090b"]);
  const subtextColor = useTransform(smoothProgress, [0, 0.85], ["#A1A1AA", "#1e293b"]);
  const accentColor = useTransform(smoothProgress, [0, 0.85], ["#00F0FF", "#0284C7"]);
  const accentBorder = useTransform(smoothProgress, [0, 0.85], ["rgba(0, 240, 255, 0.3)", "rgba(2, 132, 199, 0.35)"]);
  const accentPillBg = useTransform(smoothProgress, [0, 0.85], ["rgba(8, 51, 68, 0.5)", "rgba(224, 242, 254, 0.95)"]);

  // Card Surfaces & Borders (Dark translucent -> pure crisp elevated light card)
  const cardBg = useTransform(smoothProgress, [0, 0.85], ["rgba(24, 28, 25, 0.85)", "rgba(255, 255, 255, 0.98)"]);
  const cardBorder = useTransform(smoothProgress, [0, 0.85], ["rgba(255, 255, 255, 0.1)", "rgba(15, 23, 42, 0.15)"]);
  const cardShadow = useTransform(
    smoothProgress,
    [0, 0.85],
    ["0 0 0 rgba(0, 0, 0, 0)", "0 25px 50px -12px rgba(15, 23, 42, 0.15)"]
  );
  const cardTitleColor = useTransform(smoothProgress, [0, 0.85], ["#FFFFFF", "#09090b"]);
  const cardFooterBg = useTransform(smoothProgress, [0, 0.85], ["rgba(0, 0, 0, 0.4)", "rgba(255, 255, 255, 0.96)"]);
  
  // Progress Bar & Track
  const trackBgColor = useTransform(smoothProgress, [0, 0.85], ["#27272A", "#E2E8F0"]);

  const getSizeClasses = (size) => {
    switch (size) {
      case 'large':
        return 'w-[340px] sm:w-[420px] md:w-[480px] aspect-[4/3]';
      case 'small':
        return 'w-[260px] sm:w-[300px] md:w-[340px] aspect-[4/3]';
      case 'medium':
      default:
        return 'w-[300px] sm:w-[360px] md:w-[410px] aspect-[4/3]';
    }
  };

  const getAlignClasses = (align) => {
    switch (align) {
      case 'start':
        return 'self-start mt-6 md:mt-12';
      case 'end':
        return 'self-end mb-8 md:mb-16';
      case 'center':
      default:
        return 'self-center my-auto';
    }
  };

  return (
    <section 
      id="certifications" 
      ref={targetRef} 
      className="relative h-[400vh] select-none"
    >
      {/* Sticky Fullscreen Viewport (Single Global Background flows behind) */}
      <motion.div 
        ref={viewportRef}
        style={{ backgroundColor: sectionBg }}
        className="sticky top-0 flex h-screen w-full items-center overflow-hidden z-10"
      >
        {/* Diagonal Float Container: Starts (50vw, 30vh) -> Glides in with slow ultra-smooth easing */}
        <motion.div
          initial={{ x: '45vw', y: '25vh', opacity: 0 }}
          animate={isInView ? { x: 0, y: 0, opacity: 1 } : { x: '45vw', y: '25vh', opacity: 0 }}
          transition={{
            duration: 2.2,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative w-full h-full flex flex-col justify-center overflow-hidden"
        >

        {/* Top Progress Bar & Counter Indicator */}
        <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3">
            <motion.span 
              style={{ backgroundColor: accentColor }}
              className="w-2.5 h-2.5 rounded-full animate-ping" 
            />
            <motion.span 
              style={{ color: accentColor }}
              className="text-xs font-mono uppercase tracking-[0.25em] font-bold"
            >
              03. Credentials &amp; Verification
            </motion.span>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.span 
              style={{ color: subtextColor }}
              className="text-xs font-mono font-medium"
            >
              SCROLL HORIZONTALLY
            </motion.span>
            <motion.div 
              style={{ backgroundColor: trackBgColor }}
              className="w-24 md:w-36 h-[2px] rounded-full overflow-hidden"
            >
              <motion.div 
                style={{ width: progressWidth }} 
                className="h-full bg-gradient-to-r from-cyan-500 to-[#00F0FF]"
              />
            </motion.div>
          </div>
        </div>

        {/* The Scrolling Track */}
        <motion.div 
          style={{ x }} 
          className="flex gap-16 md:gap-24 px-[8vw] md:px-[12vw] z-10 items-center w-max h-[80vh]"
        >
          {/* 1. Intro Title Block */}
          <div className="w-[36vw] min-w-[320px] max-w-[540px] flex-shrink-0 self-center">
            <motion.div 
              style={{ 
                backgroundColor: accentPillBg, 
                borderColor: accentBorder,
                color: accentColor 
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Verified Achievements
            </motion.div>
            
            <motion.h2 
              style={{ color: headingColor }}
              className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.88]"
            >
              Certificates <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-cyan-500 to-teal-500">
                &amp; Milestones
              </span>
            </motion.h2>

            <motion.p 
              style={{ color: subtextColor }}
              className="mt-8 text-base md:text-lg font-mono font-medium leading-relaxed"
            >
              Industrial certifications, technical coursework, and competitive milestones across AI, Cloud Architecture, and Distributed Systems.
            </motion.p>
            
            <motion.div 
              style={{ color: accentColor }}
              className="mt-6 flex items-center gap-2 text-xs font-mono font-semibold"
            >
              <span>← Drag or scroll down to explore gallery →</span>
            </motion.div>
          </div>

          {/* 2. First Set of Certificates (1 to 3) */}
          {certificates.slice(0, 3).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`flex-shrink-0 cursor-pointer group ${getAlignClasses(cert.align)}`}
            >
              <motion.div 
                style={{ 
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  boxShadow: cardShadow
                }}
                className={`relative rounded-2xl overflow-hidden backdrop-blur-md border group-hover:border-[#00F0FF]/60 group-hover:shadow-[0_0_35px_rgba(0,240,255,0.25)] ${getSizeClasses(cert.size)}`}
              >
                {/* Image */}
                <img
                  src={cert.img}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/profile-placeholder.svg';
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-30" />

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <motion.span 
                    style={{ 
                      backgroundColor: accentPillBg, 
                      color: accentColor,
                      borderColor: accentBorder
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold backdrop-blur-md border shadow-sm"
                  >
                    {cert.tag}
                  </motion.span>
                </div>

                {/* Quick Expand Icon */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:text-[#00F0FF] group-hover:border-[#00F0FF]">
                  <Eye className="w-4 h-4" />
                </div>

                {/* Bottom Card Info */}
                <motion.div 
                  style={{ backgroundColor: cardFooterBg }}
                  className="absolute bottom-0 inset-x-0 p-5 z-10 border-t border-black/5 dark:border-white/5 backdrop-blur-md"
                >
                  <motion.span 
                    style={{ color: accentColor }}
                    className="text-xs font-mono font-bold tracking-wider uppercase"
                  >
                    {cert.issuer} • {cert.date}
                  </motion.span>
                  <motion.h4 
                    style={{ color: cardTitleColor }}
                    className="text-base sm:text-lg font-extrabold tracking-tight mt-1 line-clamp-2 group-hover:text-cyan-500"
                  >
                    {cert.title}
                  </motion.h4>
                </motion.div>
              </motion.div>
            </div>
          ))}

          {/* 3. Lando Norris Editorial Quote Block */}
          <div className="w-[32vw] min-w-[300px] max-w-[480px] flex-shrink-0 self-start mt-12 md:mt-20">
            <motion.div 
              style={{ 
                backgroundColor: cardBg,
                borderColor: cardBorder,
                boxShadow: cardShadow
              }}
              className="p-8 rounded-3xl backdrop-blur-xl border relative overflow-hidden"
            >
              <motion.span 
                style={{ color: accentColor }}
                className="text-6xl font-serif leading-none select-none opacity-80 block mb-2"
              >
                “
              </motion.span>
              <motion.h3 
                style={{ color: headingColor }}
                className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold italic leading-snug -mt-2"
              >
                It doesn't matter where you start, it's how you progress from there.
              </motion.h3>
              <motion.div 
                style={{ borderColor: cardBorder }}
                className="mt-6 flex items-center justify-between pt-4 border-t"
              >
                <div>
                  <motion.p 
                    style={{ color: accentColor }}
                    className="text-sm font-extrabold tracking-wide uppercase"
                  >
                    Karan Shakya
                  </motion.p>
                  <motion.p 
                    style={{ color: subtextColor }}
                    className="text-xs font-mono font-semibold"
                  >
                    Software &amp; AI Engineer
                  </motion.p>
                </div>
                <motion.div 
                  style={{ borderColor: accentColor }}
                  className="w-12 h-6 border-b-2 border-r-2 opacity-80 transform -rotate-12" 
                />
              </motion.div>
            </motion.div>
          </div>

          {/* 4. Remaining Certificates (4 to 8) */}
          {certificates.slice(3).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`flex-shrink-0 cursor-pointer group ${getAlignClasses(cert.align)}`}
            >
              <motion.div 
                style={{ 
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  boxShadow: cardShadow
                }}
                className={`relative rounded-2xl overflow-hidden backdrop-blur-md border group-hover:border-[#00F0FF]/60 group-hover:shadow-[0_0_35px_rgba(0,240,255,0.25)] ${getSizeClasses(cert.size)}`}
              >
                {/* Image */}
                <img
                  src={cert.img}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/profile-placeholder.svg';
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-30" />

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <motion.span 
                    style={{ 
                      backgroundColor: accentPillBg, 
                      color: accentColor,
                      borderColor: accentBorder
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold backdrop-blur-md border shadow-sm"
                  >
                    {cert.tag}
                  </motion.span>
                </div>

                {/* Quick Expand Icon */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:text-[#00F0FF] group-hover:border-[#00F0FF]">
                  <Eye className="w-4 h-4" />
                </div>

                {/* Bottom Card Info */}
                <motion.div 
                  style={{ backgroundColor: cardFooterBg }}
                  className="absolute bottom-0 inset-x-0 p-5 z-10 border-t border-black/5 dark:border-white/5 backdrop-blur-md"
                >
                  <motion.span 
                    style={{ color: accentColor }}
                    className="text-xs font-mono font-bold tracking-wider uppercase"
                  >
                    {cert.issuer} • {cert.date}
                  </motion.span>
                  <motion.h4 
                    style={{ color: cardTitleColor }}
                    className="text-base sm:text-lg font-extrabold tracking-tight mt-1 line-clamp-2 group-hover:text-cyan-500"
                  >
                    {cert.title}
                  </motion.h4>
                </motion.div>
              </motion.div>
            </div>
          ))}

          {/* 5. End Outro Card - Popped Solid White Card with Black Text */}
          <div className="w-[28vw] min-w-[260px] flex-shrink-0 self-center pl-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_8px_20px_rgba(0,0,0,0.08)] text-center flex flex-col items-center hover:-translate-y-1.5 transition-transform duration-300 relative z-20">
              <Award className="w-12 h-12 mb-4 text-cyan-600 animate-bounce" />
              <h4 className="text-2xl font-black uppercase tracking-tight text-black">
                More to Come
              </h4>
              <p className="mt-2 text-xs font-mono font-bold text-slate-900 max-w-xs leading-relaxed">
                Actively expanding expertise in advanced neural networks, LLM fine-tuning, and scalable cloud solutions.
              </p>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </motion.div>

      {/* Fullscreen High-Resolution Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-[#181C19] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl cursor-default"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
                <div>
                  <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider">
                    {selectedCert.issuer} • {selectedCert.date}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {selectedCert.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-8 flex items-center justify-center bg-black/60 max-h-[75vh] overflow-auto">
                <img
                  src={selectedCert.img}
                  alt={selectedCert.title}
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
