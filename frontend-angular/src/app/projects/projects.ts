import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// Swiper custom elements ko register karna zaroori hai
register();

interface Project {
  name: string;
  description: string;
  technologies: string[];
  github?: string;
  live?: string;
  images?: string[];
}

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  isLightboxOpen = signal(false);
  selectedProjectImages = signal<string[]>([]);
  initialSlideIndex = signal(0);

  projects = signal<Project[]>([
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
      images: ['billgeneratorss.png', 'bill generator.png','Screenshot 2026-04-02 173657.png'] 
    },
    {
      name: 'Database Management System',
      description: 'Designed and implemented a full-featured DBMS with query optimization and secure schema handling.',
      technologies: ['Java', 'SQL', 'JDBC', 'Data Structures'],
      github: 'https://github.com/Karan-code404/dbms'
    }
  ]);

  openLightbox(images: string[], index: number) {
    this.selectedProjectImages.set(images);
    this.initialSlideIndex.set(index);
    this.isLightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
    document.body.style.overflow = 'auto';
  }
}