import React from 'react';

export default function About() {
  return (
    <section id="about" className="py-20 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 md:p-12 transition-all duration-500 hover:border-cyan-500/30">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500"></div>

        <div className="max-w-4xl">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 mb-3">
            01. Background
          </h2>
          <h3 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
            About Me
          </h3>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light mb-6">
            I am a Software Developer and Tech Enthusiast driven by the mission to build intelligent, real-world solutions. With a strong foundation in the MEAN Stack and Machine Learning, I specialize in developing seamless web applications that leverage the power of Artificial Intelligence.
          </p>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
            Beyond just writing code, I am deeply interested in Data Analysis, using it to extract actionable insights and drive application logic. I thrive on solving complex technical challenges and am currently looking for an opportunity to contribute my skills in Web Technologies and AI to build innovative, data-driven software that makes a difference.
          </p>
        </div>
      </div>
    </section>
  );
}
