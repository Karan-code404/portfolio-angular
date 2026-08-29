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
import ProjectsLiquidBackground from './ProjectsLiquidBackground';

// Individual Card Component with Scroll-Scrubbing, High-Visibility Anti-Gravity Magnetic Parting & Unclipped Bounds
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
  const baseSpacing = 215; // px
  const baseTranslateX = offset * baseSpacing;
  const baseTranslateY = Math.pow(absOffset, 1.55) * 32; // Parabolic curve
  const baseRotateZ = offset * 5.2; // degrees
  const baseScale = isCenter ? 1.02 : 1 - absOffset * 0.045;
  const baseZIndex = 30 - absOffset * 4;

  // Parallax depth multiplier
  const depthMultiplier = 1 - absOffset * 0.15;

  // --- STRONG, VISIBLE ANTI-GRAVITY REPULSION / MAGNETIC HOVER LOGIC ---
  let dynamicHoverX = 0;
  let dynamicHoverY = 0;
  let dynamicHoverRotateZ = 0;
  let dynamicHoverScale = 1.0;
  const isThisHovered = hoveredIndex === index;
  const isAnyOtherHovered = hoveredIndex !== null && !isThisHovered;

  if (hoveredIndex !== null && !isMobile) {
    const diff = index - hoveredIndex;
    const dist = Math.abs(diff);

    if (diff === 0) {
      // Hovered card lifts up prominently, straightens to face user, and pops forward in 3D
      dynamicHoverY = -52; // Strong physical anti-gravity lift
      dynamicHoverX = 0;
      dynamicHoverRotateZ = -baseRotateZ; // Completely straightens card upright (0 deg)
      dynamicHoverScale = 1.09; // Physical pop & scale
    } else {
      // Surrounding cards are repelled away heavily (negative for left neighbors, positive for right neighbors)
      const dir = Math.sign(diff); // -1 for left, +1 for right
      
      // Proximity-based physics repulsion:
      // Immediate neighbor (dist === 1): pushed heavily by ~300px (full 3x boost for huge background clearance)
      // Farther neighbors (dist > 1): flank slides outward with decaying extra gap to prevent card collision
      const flankDecayAddition = (dist - 1) * 45;
      const partStrength = 300 + flankDecayAddition;
      dynamicHoverX = dir * partStrength;
      
      // Fluid rotational flare to simulate cards parting gracefully on a fan
      dynamicHoverRotateZ = dir * (5.8 / Math.sqrt(dist));
      
      // Subtle downward relaxation and depth scaling for non-hovered cards
      dynamicHoverY = Math.max(0, 18 - dist * 4);
      dynamicHoverScale = 0.95;
    }
  }

  // Smooth, frictionless spring physics for fluid movement without robotic linear snaps
  const springConfig = { stiffness: 210, damping: 24, mass: 0.78 };
  const springHoverX = useSpring(dynamicHoverX, springConfig);
  const springHoverY = useSpring(dynamicHoverY, springConfig);
  const springHoverRotateZ = useSpring(dynamicHoverRotateZ, { stiffness: 190, damping: 23, mass: 0.78 });
  const springHoverScale = useSpring(dynamicHoverScale, springConfig);

  useEffect(() => {
    springHoverX.set(dynamicHoverX);
    springHoverY.set(dynamicHoverY);
    springHoverRotateZ.set(dynamicHoverRotateZ);
    springHoverScale.set(dynamicHoverScale);
  }, [dynamicHoverX, dynamicHoverY, dynamicHoverRotateZ, dynamicHoverScale, springHoverX, springHoverY, springHoverRotateZ, springHoverScale]);

  // 1. Deck Rise Progress (p: 0 -> 0.5): Compact deck rises from below (y: 320 -> 0)
  const deckRiseY = useTransform(smoothScroll, [0, 0.5, 1], [320, 40, 0]);
  
  // 2. Fan Spread Progress (p: 0.45 -> 1.0): Cards fan out horizontally as user reaches center of section
  const fanFactor = useTransform(smoothScroll, [0.45, 1], [0, 1], { clamp: true });

  // 3. Opacity Progress (p: 0 -> 0.25)
  const cardOpacity = useTransform(smoothScroll, [0, 0.25, 1], [0, 1, 1]);

  // 4. Base Scroll Scale Progress (p: 0 -> 0.5 -> 1.0)
  const scrollScale = useTransform(smoothScroll, [0, 0.5, 1], [0.84, 0.94, baseScale]);

  // 5. Combined Final Scale (Scroll Progress Scale * Interactive Hover Physics Scale)
  const cardScale = useTransform([scrollScale, springHoverScale], ([sScale, hScale]) => {
    if (isMobile) return 1;
    return sScale * hScale;
  });

  // 6. Total X Translation = ((baseTranslateX + dynamicHoverX) * fanProgress) + (mouseParallax * fanFactor)
  const cardX = useTransform([fanFactor, springHoverX, smoothMouseX], ([fan, hX, mouseX]) => {
    if (isMobile) return 0;
    const targetX = baseTranslateX + hX;
    const parallaxX = mouseX * 38 * depthMultiplier * fan;
    return (targetX * fan) + parallaxX;
  });

  // 7. Total Y Translation = deckRiseY + ((baseTranslateY + dynamicHoverY) * fanProgress) + (mouseParallax * fanFactor)
  const cardY = useTransform([deckRiseY, fanFactor, springHoverY, smoothMouseY], ([dY, fan, hY, mouseY]) => {
    if (isMobile) return 0;
    const targetY = baseTranslateY + hY;
    const parallaxY = mouseY * 28 * depthMultiplier * fan;
    return dY + (targetY * fan) + parallaxY;
  });

  // 8. Total Rotate Z = (baseRotateZ + dynamicHoverRotateZ) * fanProgress
  const cardRotateZ = useTransform([fanFactor, springHoverRotateZ], ([fan, hRot]) => {
    if (isMobile) return 0;
    return (baseRotateZ + hRot) * fan;
  });

  // 9. 3D Tilt Rotations (reacts to pointer when fanned out near center)
  const rotateX = useTransform([fanFactor, smoothMouseY], ([fan, mouseY]) => {
    if (isMobile) return 0;
    return -mouseY * 9 * depthMultiplier * fan;
  });

  const rotateY = useTransform([fanFactor, smoothMouseX], ([fan, mouseX]) => {
    if (isMobile) return 0;
    return mouseX * 11 * depthMultiplier * fan;
  });

  // Dynamic Layering Context: Hovered card gets highest priority (70), neighbors stack progressively
  let dynamicZIndex = baseZIndex;
  if (isThisHovered) {
    dynamicZIndex = 70;
  } else if (hoveredIndex !== null) {
    const dist = Math.abs(index - hoveredIndex);
    dynamicZIndex = Math.max(10, 50 - dist * 8);
  }

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
        scale: cardScale,
        zIndex: dynamicZIndex,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        filter: isAnyOtherHovered 
          ? 'brightness(0.68) blur(0.5px)' 
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
      {/* 3D Glossy Card Shell - Clean White Theme */}
      <div 
        className={`w-full h-full rounded-[30px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative backdrop-blur-2xl transition-all duration-300 ${
          isThisHovered
            ? 'bg-white border-2 border-cyan-500 shadow-[0_25px_60px_rgba(0,0,0,0.16),0_0_35px_rgba(6,182,212,0.22)]'
            : (isCenter && hoveredIndex === null)
            ? 'bg-white border-2 border-cyan-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_25px_rgba(6,182,212,0.14)]'
            : 'bg-white/95 border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)]'
        }`}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
          style={{
            backgroundColor: isThisHovered 
              ? 'rgba(6, 182, 212, 0.18)' 
              : (isCenter && hoveredIndex === null) 
              ? 'rgba(6, 182, 212, 0.10)' 
              : 'transparent'
          }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <span 
              className={`inline-block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${
                isThisHovered || (isCenter && hoveredIndex === null)
                  ? 'text-cyan-700 bg-cyan-50 border-cyan-300'
                  : 'text-slate-600 bg-slate-100 border-slate-200'
              }`}
            >
              {project.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
              {project.name}
            </h3>
          </div>

          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              isThisHovered || (isCenter && hoveredIndex === null)
                ? 'bg-cyan-50 text-cyan-600 border border-cyan-300 shadow-sm' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Tagline */}
        <p className="relative z-10 text-[11px] sm:text-xs font-mono text-slate-600 font-medium line-clamp-1 my-1">
          {project.tagline}
        </p>

        {/* Screenshot / Proof Visual Frame */}
        <div 
          onClick={(e) => {
            if (project.images && project.images.length > 0) {
              openLightbox(e, project.images, 0);
            }
          }}
          className="relative z-10 w-full h-[160px] sm:h-[175px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 flex-shrink-0 group/img cursor-pointer shadow-inner"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Proof Badge */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 border border-cyan-500/30 shadow-md">
                <Eye size={12} />
                <span>Inspect Proof ({project.images.length})</span>
              </div>
            </>
          ) : (
            /* Cybernetic fallback banner for packet/telemetry analyzer */
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-cyan-950 via-slate-900 to-teal-950 p-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-2 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-mono text-cyan-200 font-bold uppercase tracking-wider">
                Live Network Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-300 mt-0.5">
                Real-Time Inspection Engine
              </span>
            </div>
          )}

          {isCenter && hoveredIndex === null && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400 text-cyan-300 text-[9px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Center Focus</span>
            </div>
          )}
        </div>

        {/* Highlights / Bullet Points */}
        <div className="relative z-10 space-y-1.5 my-2 flex-grow overflow-hidden">
          {project.bullets.slice(0, 2).map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-700 text-[11px] sm:text-xs leading-relaxed font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 flex-shrink-0" />
              <span className="line-clamp-2">{bullet}</span>
            </div>
          ))}
        </div>

        {/* Tech Stack Pills */}
        <div className="relative z-10 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-mono font-semibold"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[10px] font-mono font-semibold">
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500 text-slate-950 font-black uppercase tracking-wider rounded-xl hover:bg-cyan-400 hover:shadow-[0_4px_15px_rgba(6,182,212,0.35)] transition-all text-[11px] font-mono shadow-sm"
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
              className={`flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl border border-slate-300 transition-all text-[11px] font-mono font-bold uppercase tracking-wider ${
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
      className="relative w-full py-32 sm:py-40 md:py-44 px-2 sm:px-4 md:px-6 select-none scroll-mt-10 overflow-hidden text-slate-100"
    >
      {/* Background Subtle Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto mb-14 sm:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>04. Creations &amp; Systems</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight uppercase">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600">Projects</span>
          </h2>
          <p className="mt-2.5 text-slate-600 font-mono text-xs sm:text-sm max-w-xl font-medium">
            Hover over cards to experience dynamic physics-based anti-gravity repulsion &amp; 3D parallax.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 font-semibold shadow-sm">
          <Compass size={14} className="text-cyan-600 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Anti-Gravity Magnetic Fan Stage</span>
        </div>
      </div>

      {/* Parallax Container Stage with 3D Perspective - Fully Unclipped with Generous Height */}
      {isMobile ? (
        /* Mobile Fallback: Horizontal Snap Container */
        <div className="relative z-10 w-full flex gap-5 overflow-x-auto pb-6 px-2 scrollbar-hide snap-x snap-mandatory">
          {projectsList.map((project, index) => {
            const IconComponent = project.icon;
            return (
              <div
                key={project.name}
                className="w-[85vw] max-w-[340px] flex-shrink-0 snap-center bg-white border border-slate-200 rounded-[26px] p-6 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-300 px-2.5 py-0.5 rounded-full uppercase font-bold">
                      {project.category}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-300 flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">{project.name}</h3>
                  <p className="text-xs font-mono text-slate-600 mt-1 mb-3 font-medium">{project.tagline}</p>
                </div>

                {project.images && project.images.length > 0 && (
                  <div 
                    onClick={(e) => openLightbox(e, project.images, 0)}
                    className="relative w-full h-[150px] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 my-2 cursor-pointer shadow-inner"
                  >
                    <img src={`/${project.images[0]}`} alt={project.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                      Proof ({project.images.length})
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 my-3">
                  {project.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-cyan-500 text-slate-950 font-black uppercase text-[11px] font-mono rounded-xl shadow-sm"
                    >
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-slate-100 border border-slate-300 text-slate-900 font-mono font-bold text-[11px] uppercase rounded-xl hover:bg-slate-200"
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
          className="relative z-10 w-full max-w-[1600px] mx-auto min-h-[840px] sm:min-h-[880px] md:min-h-[920px] flex items-center justify-center overflow-visible py-12"
          style={{ perspective: '1400px' }}
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
