import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  const [selectedCert, setSelectedCert] = useState(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Smooth horizontal scroll translation across the track
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-78%"]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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
      className="relative h-[450vh] bg-transparent text-[#E8E6E1] select-none"
    >
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden z-10">
        
        {/* Subtle Background Graphic (Lando-style organic topographic contour lines) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="certLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#84cc16" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path
              d="M -100 200 C 300 400, 600 -100, 1200 300 C 1800 700, 2200 100, 2800 400"
              fill="none"
              stroke="url(#certLineGrad)"
              strokeWidth="1.5"
            />
            <path
              d="M -50 450 C 400 150, 900 650, 1500 250 C 2100 -150, 2500 500, 3100 200"
              fill="none"
              stroke="url(#certLineGrad)"
              strokeWidth="1.5"
            />
            <path
              d="M 100 800 C 600 500, 1100 900, 1700 600 C 2300 300, 2700 800, 3300 650"
              fill="none"
              stroke="url(#certLineGrad)"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Top Progress Bar & Counter Indicator */}
        <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#00F0FF]/90 font-bold">
              03. Credentials &amp; Verification
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">SCROLL HORIZONTALLY</span>
            <div className="w-24 md:w-36 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                style={{ width: progressWidth }} 
                className="h-full bg-gradient-to-r from-cyan-500 to-[#00F0FF]"
              />
            </div>
          </div>
        </div>

        {/* The Scrolling Track */}
        <motion.div 
          style={{ x }} 
          className="flex gap-16 md:gap-24 px-[8vw] md:px-[12vw] z-10 items-center w-max h-[80vh]"
        >
          {/* 1. Intro Title Block */}
          <div className="w-[36vw] min-w-[320px] max-w-[540px] flex-shrink-0 self-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/40 text-[#00F0FF] border border-cyan-500/30 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Achievements
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.88] text-white">
              Certificates <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-cyan-300 to-teal-200">
                &amp; Milestones
              </span>
            </h2>
            <p className="mt-8 text-base md:text-lg font-mono text-zinc-400 leading-relaxed">
              Industrial certifications, technical coursework, and competitive milestones across AI, Cloud Architecture, and Distributed Systems.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[#00F0FF]/70">
              <span>← Drag or scroll down to explore gallery →</span>
            </div>
          </div>

          {/* 2. Map through First Set of Certificates (1 to 3) */}
          {certificates.slice(0, 3).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`flex-shrink-0 cursor-pointer group transition-all duration-500 ${getAlignClasses(cert.align)}`}
            >
              <div 
                className={`relative rounded-2xl overflow-hidden bg-[#181C19]/80 backdrop-blur-md border border-white/10 group-hover:border-[#00F0FF]/60 group-hover:shadow-[0_0_35px_rgba(0,240,255,0.25)] transition-all duration-500 ${getSizeClasses(cert.size)}`}
              >
                {/* Image */}
                <img
                  src={cert.img}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/profile-placeholder.svg';
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-black/60 backdrop-blur-md text-[#00F0FF] border border-[#00F0FF]/30">
                    {cert.tag}
                  </span>
                </div>

                {/* Quick Expand Icon */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:text-[#00F0FF] group-hover:border-[#00F0FF] transition-colors">
                  <Eye className="w-4 h-4" />
                </div>

                {/* Bottom Card Info */}
                <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                  <span className="text-xs font-mono text-[#00F0FF] font-medium tracking-wider uppercase">
                    {cert.issuer} • {cert.date}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 line-clamp-2 group-hover:text-cyan-200 transition-colors">
                    {cert.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}

          {/* 3. Lando Norris Style Editorial Quote Block */}
          <div className="w-[32vw] min-w-[300px] max-w-[480px] flex-shrink-0 self-start mt-12 md:mt-20">
            <div className="p-8 rounded-3xl bg-[#181C19]/40 backdrop-blur-xl border border-white/10 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <span className="text-5xl text-[#00F0FF]/30 font-serif leading-none select-none">“</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-white/95 leading-snug -mt-4">
                It doesn't matter where you start, it's how you progress from there.
              </h3>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm font-bold tracking-wide uppercase text-[#00F0FF]">Karan Shakya</p>
                  <p className="text-xs font-mono text-zinc-400">Software &amp; AI Engineer</p>
                </div>
                <div className="w-12 h-6 border-b-2 border-r-2 border-[#00F0FF]/50 transform -rotate-12" />
              </div>
            </div>
          </div>

          {/* 4. Map through Remaining Certificates (4 to 8) */}
          {certificates.slice(3).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`flex-shrink-0 cursor-pointer group transition-all duration-500 ${getAlignClasses(cert.align)}`}
            >
              <div 
                className={`relative rounded-2xl overflow-hidden bg-[#181C19]/80 backdrop-blur-md border border-white/10 group-hover:border-[#00F0FF]/60 group-hover:shadow-[0_0_35px_rgba(0,240,255,0.25)] transition-all duration-500 ${getSizeClasses(cert.size)}`}
              >
                {/* Image */}
                <img
                  src={cert.img}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/profile-placeholder.svg';
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-black/60 backdrop-blur-md text-[#00F0FF] border border-[#00F0FF]/30">
                    {cert.tag}
                  </span>
                </div>

                {/* Quick Expand Icon */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:text-[#00F0FF] group-hover:border-[#00F0FF] transition-colors">
                  <Eye className="w-4 h-4" />
                </div>

                {/* Bottom Card Info */}
                <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                  <span className="text-xs font-mono text-[#00F0FF] font-medium tracking-wider uppercase">
                    {cert.issuer} • {cert.date}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 line-clamp-2 group-hover:text-cyan-200 transition-colors">
                    {cert.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}

          {/* 5. End Outro Card */}
          <div className="w-[28vw] min-w-[260px] flex-shrink-0 self-center pl-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/30 to-zinc-900/40 border border-cyan-500/20 text-center flex flex-col items-center">
              <Award className="w-12 h-12 text-[#00F0FF] mb-4 animate-bounce" />
              <h4 className="text-2xl font-black uppercase text-white tracking-tight">More to Come</h4>
              <p className="mt-2 text-xs font-mono text-zinc-400 max-w-xs">
                Actively expanding expertise in advanced neural networks, LLM fine-tuning, and scalable cloud solutions.
              </p>
            </div>
          </div>

        </motion.div>
      </div>

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
              {/* Modal Header */}
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

              {/* Modal Image Frame */}
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
