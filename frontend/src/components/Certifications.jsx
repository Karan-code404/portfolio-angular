import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';

export default function Certifications() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const certsList = [
    {
      name: 'Postman API Fundamentals Student Expert',
      issuer: 'Postman',
      image: 'postman.png'
    },
    {
      name: 'AWS Cloud Practitioner Essentials',
      issuer: 'AWS',
      image: 'aws cloud practitioner essentials.png'
    },
    {
      name: 'Oracle Cloud Infrastructure 2025 Certified Generative AI Professional',
      issuer: 'Oracle',
      image: 'Oracle Cloud Infrastructure 2025 Certified Generative AI Professional.png'
    },
    {
      name: 'AI Fundamental with IBM SkillsBuild Course',
      issuer: 'IBM',
      image: 'AI fundamental with IBM skillsbuild course.png'
    },
    {
      name: 'AWS Academy Cloud Foundation',
      issuer: 'AWS',
      image: 'aws academy cloud foundation.png'
    },
    {
      name: 'Data Science and Analytics',
      issuer: 'HP Life',
      image: 'data science and analytics.png'
    },
    {
      name: 'Design and Analysis of Algorithm',
      issuer: 'Codetantra',
      image: 'design and analysis of algorithm.png'
    },
    {
      name: 'GenAI Powered Data Analytics Job Simulation',
      issuer: 'Tata, Forage',
      image: 'genai powered data analytics job simulation.png'
    },
    {
      name: 'Hashgraph Developer',
      issuer: 'Hedera',
      image: 'hashgraph developer.png'
    },
    {
      name: 'Solutions Architecture Job Simulation',
      issuer: 'AWS, Forage',
      image: 'solutions arcchitecture job simulation.png'
    },
    {
      name: 'Tata Crucial Hackathon',
      issuer: 'Tata',
      image: 'tata crucial hackathon.png'
    }
  ];

  const openCertificate = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage('');
    document.body.style.overflow = 'auto';
  };

  return (
    <section id="certifications" className="py-20 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-12">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 mb-3">
          04. Credentials
        </h2>
        <h3 className="text-4xl font-extrabold text-white tracking-tight">
          Certifications
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certsList.map((cert) => (
          <div
            key={cert.name}
            onClick={() => openCertificate(cert.image)}
            className="group bg-slate-900/30 backdrop-blur-sm border border-slate-800/80 rounded-xl overflow-hidden hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
              <img
                src={`/${cert.image}`}
                alt={cert.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-cyan-400 rounded-lg text-sm font-bold border border-cyan-500/20 shadow-xl">
                  <Eye size={16} />
                  View Certificate
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
              <h4 className="font-bold text-white text-base line-clamp-1 group-hover:text-cyan-400 transition-colors">
                {cert.name}
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Issued by: {cert.issuer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-4xl max-h-[85vh] flex items-center justify-center rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/70 hover:text-cyan-400 hover:scale-115 transition-all z-50 cursor-pointer p-2 rounded-full bg-slate-950/80 border border-white/10"
            >
              <X size={20} />
            </button>

            <img
              src={`/${selectedImage}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg p-2"
              alt="Certificate Full View"
            />
          </div>
        </div>
      )}
    </section>
  );
}
