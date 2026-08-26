import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ContactMe({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    purpose: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const closeForm = () => {
    onClose();
    document.body.style.overflow = 'auto';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Success! Your message has been delivered to Karan Shakya's inbox.");
        closeForm();
      } else {
        alert('Oops! Backend received it, but failed to send email.');
      }
    } catch (error) {
      alert('Backend is not running! Please start your Node server (node server.js).');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center overflow-y-auto px-6 py-12 md:p-20 animate-[slideUp_0.4s_ease-out_forwards]">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        onClick={closeForm}
        className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-semibold transition-colors cursor-pointer text-base md:text-lg"
      >
        <ArrowLeft size={20} />
        Back to Portfolio
      </button>

      <div className="w-full max-w-xl mt-12 md:mt-8">
        <h2 className="text-4xl font-extrabold text-white mb-3 text-center tracking-tight">
          Let's Work Together
        </h2>
        <p className="text-slate-400 text-center text-sm md:text-base font-light mb-8 max-w-md mx-auto leading-relaxed">
          Fill out the details below and I'll get back to you as soon as possible.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-300">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. John Doe"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-300">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g. john@company.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="purpose" className="text-sm font-semibold text-slate-300">
              I am a...
            </label>
            <select
              id="purpose"
              required
              value={formData.purpose}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="recruiter">Recruiter / Hiring Manager</option>
              <option value="client">Client looking for a developer</option>
              <option value="developer">Fellow Developer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-semibold text-slate-300">
              What would you like to discuss?
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Hi Karan, I am looking to hire..."
              required
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-base transition-all duration-300 shadow-lg shadow-cyan-900/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sending Message...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
