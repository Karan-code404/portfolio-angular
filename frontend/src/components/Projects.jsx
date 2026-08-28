import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Eye,
  Compass
} from 'lucide-react';
import { Github } from './Icons';

// Individual Card Component with Scroll-Scrubbing & Dynamic Magnetic Hover Parting
function ParallaxFanCard({
  project,
  index,
  total,
  smoothScroll,
  smoothMouseX,
  smoothMouseY,
  hoveredIndex,
  setHoveredIndex,
  openLightbox,
  isMobile
}) {
  const centerIndex = Math.floor(total / 2);
  const offset = index - centerIndex; // -2, -1, 0, 1, 2 for 5 cards
  const absOffset = Math.abs(offset);
  const isCenter = offset === 0;

  // Base Fan Geometry constants
  const baseSpacing = 200; // px
  const baseTranslateX = offset * baseSpacing;
  const baseTranslateY = Math.pow(absOffset, 1.55) * 32; // Parabolic curve
  const baseRotateZ = offset * 5.5; // degrees
  const baseScale = isCenter ? 1.02 : 1 - absOffset * 0.05;
  const baseZIndex = 30 - absOffset * 6;

  // Parallax depth multiplier
  const depthMultiplier = 1 - absOffset * 0.18;

  // --- DYNAMIC PHYSICAL SPREADING / MAGNETIC HOVER LOGIC ---
  let dynamicHoverX = 0;
  let dynamicHoverY = 0;
  let dynamicHoverRotateZ = 0;
  const isThisHovered = hoveredIndex === index;
  const isAnyOtherHovered = hoveredIndex !== null && !isThisHovered;

  if (hoveredIndex !== null && !isMobile) {
    const diff = index - hoveredIndex;
    const dist = Math.abs(diff);

    if (diff === 0) {
      // Hovered card lifts up prominently and comes forward
      dynamicHoverY = -26; // upward lift
      dynamicHoverX = offset * 4; // subtle outward emphasis
      dynamicHoverRotateZ = 0; // straightens slightly to face user
    } else {
      // Surrounding cards part away (negative for left, positive for right)
      const dir = Math.sign(diff); // -1 if card is to the left, +1 if card is to the right
      
      // Parting strength decreases with distance from hovered card
      const partStrength = 46 / Math.pow(dist, 0.72); // ~46px for neighbor 1, ~28px for neighbor 2, ~20px for neighbor 3
      dynamicHoverX = dir * partStrength;
      
      // Subtle outward rotational flare to simulate cards being pushed aside
      dynamicHoverRotateZ = dir * (3.0 / dist);
      
      // Subtle vertical relaxation for neighbors
      dynamicHoverY = Math.max(0, 10 - dist * 3.5);
    }
  }

  // Smooth springs for magnetic hover offsets so transitions between cards feel organic
  const springHoverX = useSpring(dynamicHoverX, { stiffness: 220, damping: 22, mass: 0.8 });
  const springHoverY = useSpring(dynamicHoverY, { stiffness: 220, damping: 22, mass: 0.8 });
  const springHoverRotateZ = useSpring(dynamicHoverRotateZ, { stiffness: 200, damping: 20, mass: 0.8 });

  useEffect(() => {
    springHoverX.set(dynamicHoverX);
    springHoverY.set(dynamicHoverY);
    springHoverRotateZ.set(dynamicHoverRotateZ);
  }, [dynamicHoverX, dynamicHoverY, dynamicHoverRotateZ, springHoverX, springHoverY, springHoverRotateZ]);

  // 1. Deck Rise Progress (p: 0 -> 0.5): Compact deck rises from below (y: 320 -> 0)
  const deckRiseY = useTransform(smoothScroll, [0, 0.5, 1], [320, 40, 0]);
  
  // 2. Fan Spread Progress (p: 0.45 -> 1.0): Cards fan out horizontally as user reaches center of section
  const fanFactor = useTransform(smoothScroll, [0.45, 1], [0, 1], { clamp: true });

  // 3. Opacity Progress (p: 0 -> 0.25)
  const cardOpacity = useTransform(smoothScroll, [0, 0.25, 1], [0, 1, 1]);

  // 4. Base Scale Progress (p: 0 -> 0.5 -> 1.0)
  const scrollScale = useTransform(smoothScroll, [0, 0.5, 1], [0.84, 0.94, baseScale]);

  // 5. Total X Translation = ((baseTranslateX + dynamicHoverX) * fanProgress) + (mouseParallax * fanFactor)
  const cardX = useTransform([fanFactor, springHoverX, smoothMouseX], ([fan, hX, mouseX]) => {
    if (isMobile) return 0;
    const targetX = baseTranslateX + hX;
    const parallaxX = mouseX * 45 * depthMultiplier * fan;
    return (targetX * fan) + parallaxX;
  });

  // 6. Total Y Translation = deckRiseY + ((baseTranslateY + dynamicHoverY) * fanProgress) + (mouseParallax * fanFactor)
  const cardY = useTransform([deckRiseY, fanFactor, springHoverY, smoothMouseY], ([dY, fan, hY, mouseY]) => {
    if (isMobile) return 0;
    const targetY = baseTranslateY + hY;
    const parallaxY = mouseY * 35 * depthMultiplier * fan;
    return dY + (targetY * fan) + parallaxY;
  });

  // 7. Total Rotate Z = (baseRotateZ + dynamicHoverRotateZ) * fanProgress
  const cardRotateZ = useTransform([fanFactor, springHoverRotateZ], ([fan, hRot]) => {
    if (isMobile) return 0;
    return (baseRotateZ + hRot) * fan;
  });

  // 8. 3D Tilt Rotations (reacts to pointer when fanned out near center)
  const rotateX = useTransform([fanFactor, smoothMouseY], ([fan, mouseY]) => {
    if (isMobile) return 0;
    return -mouseY * 11 * depthMultiplier * fan;
  });

  const rotateY = useTransform([fanFactor, smoothMouseX], ([fan, mouseX]) => {
    if (isMobile) return 0;
    return mouseX * 13 * depthMultiplier * fan;
  });

  const IconComponent = project.icon;

  return (
    <motion.div
      style={{
        x: cardX,
        y: cardY,
        rotateZ: cardRotateZ,
        rotateX: rotateX,
        rotateY: rotateY,
        opacity: cardOpacity,
        scale: scrollScale,
        zIndex: isThisHovered ? 50 : baseZIndex,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        filter: isAnyOtherHovered 
          ? 'brightness(0.68) blur(0.7px)' 
          : isThisHovered 
          ? 'brightness(1.08) blur(0px)' 
          : 'brightness(0.95) blur(0px)',
      }}
      transition={{
        filter: { duration: 0.22 },
      }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[370px] md:w-[390px] h-[530px] sm:h-[550px] cursor-pointer select-none origin-center"
    >
      {/* 3D Glossy Card Shell */}
      <div 
        className={`w-full h-full rounded-[30px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative backdrop-blur-2xl transition-all duration-300 ${
          isThisHovered
            ? 'bg-[#181C19]/95 border-2 border-[#00F0FF] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,240,255,0.3)]'
            : isCenter
            ? 'bg-[#161A17]/90 border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(0,240,255,0.12)]'
            : 'bg-[#121513]/85 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.7)] hover:border-white/20'
        }`}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
          style={{
            backgroundColor: isThisHovered ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 240, 255, 0.08)'
          }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <span 
              className={`inline-block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${
                isCenter || isThisHovered
                  ? 'text-[#00F0FF] bg-cyan-950/70 border-cyan-500/40'
                  : 'text-zinc-400 bg-white/5 border-white/10'
              }`}
            >
              {project.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {project.name}
            </h3>
          </div>

          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              isThisHovered || isCenter
                ? 'bg-cyan-950/80 text-[#00F0FF] border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]' 
                : 'bg-white/5 text-zinc-400 border border-white/10'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Tagline */}
        <p className="relative z-10 text-[11px] sm:text-xs font-mono text-zinc-400 font-medium line-clamp-1 my-1">
          {project.tagline}
        </p>

        {/* Screenshot / Proof Visual Frame */}
        <div 
          onClick={(e) => {
            if (project.images && project.images.length > 0) {
              openLightbox(e, project.images, 0);
            }
          }}
          className="relative z-10 w-full h-[160px] sm:h-[175px] rounded-2xl overflow-hidden bg-black/70 border border-white/10 flex-shrink-0 group/img cursor-pointer"
        >
          {project.images && project.images.length > 0 ? (
            <>
              <img
                src={`/${project.images[0]}`}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              
              {/* Proof Badge */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF]/30 shadow-md">
                <Eye size={12} />
                <span>Inspect Proof ({project.images.length})</span>
              </div>
            </>
          ) : (
            /* Cybernetic fallback banner for packet/telemetry analyzer */
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-cyan-950/50 via-[#101412] to-teal-950/30 p-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF] mb-2 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-mono text-cyan-200 font-bold uppercase tracking-wider">
                Live Network Telemetry
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Real-Time Inspection Engine
              </span>
            </div>
          )}

          {isCenter && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-[#00F0FF]/40 text-[#00F0FF] text-[9px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
              <span>Center Focus</span>
            </div>
          )}
        </div>

        {/* Highlights / Bullet Points */}
        <div className="relative z-10 space-y-1.5 my-2 flex-grow overflow-hidden">
          {project.bullets.slice(0, 2).map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2 text-zinc-300 text-[11px] sm:text-xs leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-[#00F0FF] mt-1.5 flex-shrink-0" />
              <span className="line-clamp-2">{bullet}</span>
            </div>
          ))}
        </div>

        {/* Tech Stack Pills */}
        <div className="relative z-10 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-white/5 text-zinc-300 border border-white/10 rounded-md text-[10px] font-mono font-medium"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-1.5 py-0.5 bg-white/5 text-zinc-400 border border-white/10 rounded-md text-[10px] font-mono">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 pt-2.5 mt-1">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#00F0FF] text-black font-black uppercase tracking-wider rounded-xl hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all text-[11px] font-mono"
            >
              <ExternalLink size={13} className="stroke-[2.5]" />
              <span>Live Demo</span>
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 hover:border-white/20 transition-all text-[11px] font-mono font-bold uppercase tracking-wider ${
                !project.live ? 'flex-1' : ''
              }`}
            >
              <Github size={13} />
              <span>Code</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);

  // Scroll Progress tied to section entering until centered:
  // "start end" (top of section enters bottom of screen = 0.0) -> "center center" (center of section reaches middle of screen = 1.0)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  });

  // Spring physics for smooth scroll scrubbing without jitter
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    mass: 0.6
  });

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Framer Motion Raw Mouse Values (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring Physics for Mouse Parallax
  const springConfig = { stiffness: 160, damping: 22, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Mouse Move on Container
  const handleMouseMove = (e) => {
    if (isMobile || !sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to container center
    const xFromCenter = e.clientX - (rect.left + width / 2);
    const yFromCenter = e.clientY - (rect.top + height / 2);

    // Normalize between -1 and 1
    const normX = Math.max(-1, Math.min(1, xFromCenter / (width / 2)));
    const normY = Math.max(-1, Math.min(1, yFromCenter / (height / 2)));

    mouseX.set(normX);
    mouseY.set(normY);
  };

  // Mouse Leave on Container: Gracefully reset
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHoveredIndex(null);
  };

  const projectsList = [
    {
      name: 'Styloop',
      tagline: 'AI-Powered Fashion Platform & Marketplace',
      category: 'Computer Vision & AI',
      icon: Sparkles,
      bullets: [
        'AI wardrobe app using Python/TensorFlow providing personalized outfit recommendations based on deep data analysis.',
        'Integrated thrifting marketplace & social feed detecting clothing types & colors in real-time via Computer Vision.'
      ],
      technologies: ['Python', 'TensorFlow', 'Computer Vision', 'React', 'Deep Learning', 'Marketplace'],
      live: 'https://smartwardrobe-webapp.vercel.app/',
      github: 'https://github.com/Karan-code404',
      images: [
        'Styloop/-1style.png',
        'Styloop/0style.png',
        'Styloop/1style.png',
        'Styloop/2style.png',
        'Styloop/3style.png',
        'Styloop/4style.png',
        'Styloop/5style.png',
        'Styloop/6style.png',
        'Styloop/7style.png',
        'Styloop/8style.png'
      ]
    },
    {
      name: 'Corpanalytics',
      tagline: 'AI Analytics & Business Intelligence Tool',
      category: 'Data Science & ML',
      icon: Activity,
      bullets: [
        'Automated BI tool in Python (Flask) & OOD improving data processing efficiency by 40% with a 50% cost reduction.',
        'Deployed predictive ML models to optimize business logic, generating real-time dynamic executive reports.'
      ],
      technologies: ['Python', 'Flask', 'Machine Learning', 'BI', 'OOD', 'Predictive Modeling'],
      live: 'https://retail-analytics-frontend-6nuq.onrender.com/',
      github: 'https://github.com/Karan-code404',
      images: [
        'corpanalytics/1corp.png',
        'corpanalytics/2corp.png',
        'corpanalytics/3corp.png',
        'corpanalytics/4corp.png',
        'corpanalytics/5corp.png',
        'corpanalytics/6corp.png',
        'corpanalytics/7corp.png',
        'corpanalytics/8corp.png',
        'corpanalytics/9corp.png',
        'corpanalytics/10corp.png'
      ]
    },
    {
      name: 'PacketSight',
      tagline: 'API & Network Intelligence Analyzer',
      category: 'Full-Stack & Telemetry',
      icon: Cpu,
      bullets: [
        'Full-Stack analyzer monitoring real-time network communication, protocol telemetry, and latency performance.',
        'Features a Smart Insights Engine that generates actionable optimization rules and deep packet inspection metrics.'
      ],
      technologies: ['Full-Stack', 'Network Telemetry', 'API Intelligence', 'Python', 'React'],
      live: 'https://packetsight.onrender.com/',
      github: 'https://github.com/Karan-code404',
      images: []
    },
    {
      name: 'Emotion_x',
      tagline: 'Real-Time Gesture & Facial Detection (Open Source)',
      category: 'Deep Learning & OpenCV',
      icon: ShieldCheck,
      bullets: [
        'Contributed to Emotion_x open-source core, achieving 90% gesture detection accuracy via deep neural models.',
        'High-speed real-time facial expression and landmark tracking pipeline powered by OpenCV and TensorFlow.'
      ],
      technologies: ['Python', 'OpenCV', 'TensorFlow', 'Deep Learning', 'Git Branching'],
      github: 'https://github.com/Karan-code404/Emotion-x-app',
      images: ['Emotion-x.jpg']
    },
    {
      name: 'Bill Generator',
      tagline: 'Automated Invoice & Billing Engine',
      category: 'Full-Stack Web App',
      icon: Layers,
      bullets: [
        'Professional web billing platform built with Flask for small businesses to create, track, and manage invoices.',
        'Features instant vector PDF generation, client management, and persistent PostgreSQL storage.'
      ],
      technologies: ['Python', 'Flask', 'PostgreSQL', 'HTML5/CSS3', 'PDF Export'],
      github: 'https://github.com/Karan-code404/bill-generator',
      live: 'https://flask-billing-app-l5ll.onrender.com/bill_generator',
      images: ['billgeneratorss.png', 'bill generator.png', 'Screenshot 2026-04-02 173657.png']
    }
  ];

  // Lightbox Handlers
  const openLightbox = (e, images, index = 0) => {
    e.stopPropagation();
    if (!images || images.length === 0) return;
    setSelectedImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImages([]);
    document.body.style.overflow = 'auto';
  };

  const nextLightboxSlide = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const prevLightboxSlide = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  return (
    <section 
      id="projects" 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full py-24 px-4 sm:px-6 md:px-8 max-w-[100vw] overflow-hidden select-none scroll-mt-10"
    >
      {/* Background Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 sm:px-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/50 text-[#00F0FF] border border-cyan-500/30 mb-3 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>04. Creations &amp; Systems</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-cyan-300 to-teal-300">Projects</span>
          </h2>
          <p className="mt-2.5 text-zinc-400 font-mono text-xs sm:text-sm max-w-xl">
            Hover over cards to see dynamic magnetic deck parting &amp; smooth 3D parallax.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-zinc-400">
          <Compass size={14} className="text-[#00F0FF] animate-spin" style={{ animationDuration: '8s' }} />
          <span>Magnetic Spreading Parallax Fan</span>
        </div>
      </div>

      {/* Parallax Container Stage with 3D Perspective */}
      {isMobile ? (
        /* Mobile Fallback: Horizontal Snap Container */
        <div className="w-full flex gap-5 overflow-x-auto pb-6 px-2 scrollbar-hide snap-x snap-mandatory">
          {projectsList.map((project, index) => {
            const IconComponent = project.icon;
            return (
              <div
                key={project.name}
                className="w-[85vw] max-w-[340px] flex-shrink-0 snap-center bg-[#161A17]/95 border border-white/10 rounded-[26px] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-[#00F0FF] bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase font-bold">
                      {project.category}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-950/80 text-[#00F0FF] border border-cyan-500/40 flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-white">{project.name}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1 mb-3">{project.tagline}</p>
                </div>

                {project.images && project.images.length > 0 && (
                  <div 
                    onClick={(e) => openLightbox(e, project.images, 0)}
                    className="relative w-full h-[150px] rounded-xl overflow-hidden bg-black/60 border border-white/10 my-2 cursor-pointer"
                  >
                    <img src={`/${project.images[0]}`} alt={project.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#00F0FF]">
                      Proof ({project.images.length})
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 my-3">
                  {project.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-zinc-300 text-xs">
                      <span className="w-1 h-1 rounded-full bg-[#00F0FF] mt-1.5 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-[#00F0FF] text-black font-black uppercase text-[11px] font-mono rounded-xl"
                    >
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-white/5 border border-white/10 text-white font-mono text-[11px] uppercase rounded-xl"
                    >
                      Code
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop & Tablet: Full 3D Interactive Scroll-Scrubbed Parallax Fan Stage */
        <div
          className="relative w-full max-w-7xl mx-auto h-[640px] flex items-center justify-center overflow-visible"
          style={{ perspective: '1200px' }}
        >
          {projectsList.map((project, index) => (
            <ParallaxFanCard
              key={project.name}
              project={project}
              index={index}
              total={projectsList.length}
              smoothScroll={smoothScroll}
              smoothMouseX={smoothMouseX}
              smoothMouseY={smoothMouseY}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              openLightbox={openLightbox}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div
              className="w-full max-w-4xl max-h-[85vh] flex flex-col items-center justify-center rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-[#141815] relative p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white/70 hover:text-cyan-400 transition-all z-50 p-2.5 rounded-full bg-black/60 border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="w-full flex-grow flex items-center justify-center min-h-[300px] relative">
                <img
                  src={`/${selectedImages[currentImageIndex]}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-lg select-none"
                  alt={`Proof preview ${currentImageIndex + 1}`}
                />

                {selectedImages.length > 1 && (
                  <>
                    <button
                      onClick={prevLightboxSlide}
                      className="absolute left-2 p-3 bg-black/70 hover:bg-[#00F0FF] border border-white/10 text-white hover:text-black rounded-full transition-all shadow-lg"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextLightboxSlide}
                      className="absolute right-2 p-3 bg-black/70 hover:bg-[#00F0FF] border border-white/10 text-white hover:text-black rounded-full transition-all shadow-lg"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {selectedImages.length > 1 && (
                <div className="mt-4 flex gap-2">
                  {selectedImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === currentImageIndex ? 'bg-[#00F0FF] w-6' : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
