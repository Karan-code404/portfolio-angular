import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import ContactMe from './components/ContactMe';

export default function App() {
  const [isContactVisible, setIsContactVisible] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Hero Section & Cybernetic face web (100% full-bleed from top) */}
      <Hero onOpenContact={() => setIsContactVisible(true)} />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        
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
