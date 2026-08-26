import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Linkedin, Github } from './Icons';

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-6 md:px-12 border-t border-slate-900 bg-slate-950/60 backdrop-blur-sm scroll-mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 mb-3">
            05. Connect
          </h2>
          <h3 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Get In Touch
          </h3>
          <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
            Feel free to reach out for collaborations, job opportunities, or just a chat about technology. I am always open to discussing new ideas!
          </p>
        </div>

        <div className="space-y-6">
          <a
            href="tel:7206162959"
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all duration-300 group"
          >
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phone</p>
              <p className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">7206162959</p>
            </div>
          </a>

          <a
            href="mailto:karanthegreat6162@gmail.com"
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all duration-300 group"
          >
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</p>
              <p className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">karanthegreat6162@gmail.com</p>
            </div>
          </a>

          <div className="flex gap-4 pt-2">
            <a
              href="https://linkedin.com/in/karan-shakya-02a20726b"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900/30 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/50 text-slate-300 hover:text-white transition-all duration-300 font-semibold text-sm"
            >
              <Linkedin size={18} />
              LinkedIn
            </a>
            <a
              href="https://github.com/karan-code404"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900/30 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/50 text-slate-300 hover:text-white transition-all duration-300 font-semibold text-sm"
            >
              <Github size={18} />
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Karan Shakya. All rights reserved.</p>
      </div>
    </section>
  );
}
