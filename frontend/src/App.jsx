import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import OnOffTrack from './components/OnOffTrack';
import FullImageReveal from './components/FullImageReveal';
import HeroFooter from './components/HeroFooter';
import Contact from './components/Contact';
import ContactMe from './components/ContactMe';
import LiquidMarbleBackground from './components/LiquidMarbleBackground';

export default function App() {
  const [isContactVisible, setIsContactVisible] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#141713] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Liquid Marble Flowing Animation (Fixed behind ALL components) */}
      <LiquidMarbleBackground />

      {/* Hero Section & Cybernetic face web (100% full-bleed from top) */}
      <div className="relative z-10">
        <Hero onOpenContact={() => setIsContactVisible(true)} />
      </div>

      {/* Main Container: Upper Sections */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        
        {/* About Section */}
        <About />

        {/* Skills Section */}
        <Skills />

      </main>

      {/* Full-bleed Sticky Horizontal Scroll Certificates Section (Lando Norris Aesthetic) */}
      <div className="relative z-10 w-full">
        <Certificates />
      </div>

      {/* Pinned Sequence: Building Logic / Implementing Logic + Full Image Curtain Reveal */}
      <div className="relative w-full">
        {/* Sticky Layer: Stays pinned while FullImageReveal slides up over it */}
        <div className="sticky top-0 z-10 w-full min-h-screen">
          <OnOffTrack />
        </div>

        {/* Curtain Layer: Overlaps OnOffTrack completely. Once it covers the screen, normal scroll into Projects begins */}
        <div className="relative z-20 w-full min-h-screen">
          <FullImageReveal />
        </div>
      </div>

      {/* Projects Section - Full Bleed Unclipped Container for Dynamic Magnetic Fan Repulsion */}
      <div className="relative z-20 w-full overflow-visible">
        <Projects />
      </div>

      {/* Ending Section (White Liquid Marble Background Motion Canvas) */}
      <div className="relative z-20 w-full">
        <HeroFooter onOpenContact={() => setIsContactVisible(true)} />
      </div>

      {/* Overlay Contact Me Form */}
      {isContactVisible && (
        <ContactMe onClose={() => setIsContactVisible(false)} />
      )}
    </div>
  );
}
