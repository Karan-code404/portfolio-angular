import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
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

      {/* Main Container */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        
        {/* About Section */}
        <About />

        {/* Skills Section */}
        <Skills />

        {/* Projects Section */}
        <Projects />

        {/* Certifications Section */}
        <Certifications />

        {/* Contact Footer Section */}
        <Contact />

      </main>

      {/* Overlay Contact Me Form */}
      {isContactVisible && (
        <ContactMe onClose={() => setIsContactVisible(false)} />
      )}
    </div>
  );
}
