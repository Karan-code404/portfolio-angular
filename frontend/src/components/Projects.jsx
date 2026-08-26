import React, { useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Github } from './Icons';

export default function Projects() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const projectsList = [
    {
      name: 'Emotion_X (AI Model)',
      description: 'Built an AI model that analyzes human facial expressions to classify emotions using deep learning, Python, and OpenCV.',
      technologies: ['Python', 'TensorFlow', 'OpenCV'],
      github: 'https://github.com/Karan-code404/Emotion-x-app',
      images: ['Emotion-x.jpg']
    },
    {
      name: 'Bill Generator',
      description: 'A professional web-based billing application built with Flask for small businesses to generate and manage invoices efficiently.',
      technologies: ['Python', 'Flask', 'HTML/CSS', 'PostgreSQL'],
      github: 'https://github.com/Karan-code404/bill-generator',
      live: 'https://flask-billing-app-l5ll.onrender.com/bill_generator',
      images: ['billgeneratorss.png', 'bill generator.png', 'Screenshot 2026-04-02 173657.png']
    },
    {
      name: 'Database Management System',
      description: 'Designed and implemented a full-featured DBMS with query optimization and secure schema handling.',
      technologies: ['Java', 'SQL', 'JDBC', 'Data Structures'],
      github: 'https://github.com/Karan-code404/dbms'
    }
  ];

  const openLightbox = (images, index) => {
    setSelectedImages(images);
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImages([]);
    document.body.style.overflow = 'auto';
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % selectedImages.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + selectedImages.length) % selectedImages.length);
  };

  return (
    <section id="projects" className="py-20 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-12">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 mb-3">
          03. Creations
        </h2>
        <h3 className="text-4xl font-extrabold text-white tracking-tight">
          Featured Projects
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projectsList.map((project) => (
          <div
            key={project.name}
            className="flex flex-col h-full bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/30 hover:-translate-y-2 transition-all duration-300 group"
          >
            {/* Project Image Slider / Thumbnails */}
            <div className="relative mb-6 rounded-xl overflow-hidden bg-slate-950 aspect-video flex-shrink-0">
              {project.images && project.images.length > 0 ? (
                <div className="w-full h-full relative overflow-hidden group/image">
                  <img
                    src={`/${project.images[0]}`}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105 cursor-pointer"
                    onClick={() => openLightbox(project.images, 0)}
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white border border-white/10 select-none">
                    View Proof {project.images.length > 1 ? `(1/${project.images.length})` : ''}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                  No screenshots yet
                </div>
              )}
            </div>

            <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {project.name}
            </h4>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed font-light flex-grow">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 text-white rounded-lg hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 transition-all text-sm font-semibold"
                >
                  <Github size={16} />
                  Code
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 transition-all text-sm font-semibold"
                >
                  <ExternalLink size={16} />
                  Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Lightbox Overlay */}
      {lightboxOpen && selectedImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="w-full max-w-4xl max-h-[85vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/90 relative p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-cyan-400 hover:scale-115 transition-all z-50 cursor-pointer p-2 rounded-full bg-slate-950/80 border border-white/10"
            >
              <X size={20} />
            </button>

            {/* Slider Content */}
            <div className="w-full flex-grow flex items-center justify-center min-h-[300px] relative">
              <img
                src={`/${selectedImages[currentIndex]}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg select-none"
                alt={`Proof ${currentIndex + 1}`}
              />

              {/* Navigation controls if there are multiple images */}
              {selectedImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 p-3 bg-slate-950/80 hover:bg-cyan-500 border border-white/10 text-white hover:text-slate-950 rounded-full transition-all cursor-pointer"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 p-3 bg-slate-950/80 hover:bg-cyan-500 border border-white/10 text-white hover:text-slate-950 rounded-full transition-all cursor-pointer"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Slide Indicators */}
            {selectedImages.length > 1 && (
              <div className="mt-4 flex gap-2">
                {selectedImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentIndex ? 'bg-cyan-400 w-6' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
