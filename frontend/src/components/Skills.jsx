import React from 'react';
import { Cpu, UserCheck } from 'lucide-react';

export default function Skills() {
  const techSkills = [
    'MEAN Stack (MongoDB, Express, Angular, Node.js)',
    'Web Frameworks (Flask, Django, React)',
    'Machine Learning (Python & Tensorflow basics)',
    'Cloud Services (Basic AWS Console & Deployment)',
    'Database Management (MySQL, PostgreSQL, MongoDB)',
    'Rest API Design & Testing (Postman, Express)'
  ];

  const softSkills = [
    'Strong analytical & problem-solving mindset',
    'Eager to learn and adapt to new technologies',
    'Good communication & cross-functional teamwork',
    'Self-driven and independent working capability',
    'Creative thinker with details-driven focus'
  ];

  return (
    <section id="skills" className="py-20 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-12">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 mb-3">
          02. Expertise
        </h2>
        <h3 className="text-4xl font-extrabold text-white tracking-tight">
          My Skills
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Technical Skills Card */}
        <div className="relative group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Cpu size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white">Technical Skills</h4>
          </div>
          <ul className="space-y-4">
            {techSkills.map((skill, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300 text-base md:text-lg">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-400 mt-2.5"></span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Soft Skills Card */}
        <div className="relative group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <UserCheck size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white">Soft Skills</h4>
          </div>
          <ul className="space-y-4">
            {softSkills.map((skill, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300 text-base md:text-lg">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2.5"></span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
