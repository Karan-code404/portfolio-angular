import React from 'react';

export default function Navbar({ onOpenContact }) {
  const triggerContact = () => {
    onOpenContact();
    document.body.style.overflow = 'hidden';
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold tracking-wide text-white cursor-pointer select-none">
          Karan<span className="text-cyan-400">.dev</span>
        </span>
      </div>

      <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
        <li>
          <a
            href="#home"
            className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#about"
            className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#skills"
            className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
          >
            Skills
          </a>
        </li>
        <li>
          <a
            href="#projects"
            className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
          >
            Projects
          </a>
        </li>
        <li>
          <a
            href="#certifications"
            className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
          >
            Certifications
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
          >
            Contact
          </a>
        </li>
      </ul>

      <div>
        <button
          onClick={triggerContact}
          className="relative px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-semibold rounded-lg text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-md cursor-pointer"
        >
          Contact Me
        </button>
      </div>
    </nav>
  );
}
