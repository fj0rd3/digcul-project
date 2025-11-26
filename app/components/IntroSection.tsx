'use client';

import { useEffect, useRef, useState } from 'react';

export default function IntroSection() {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setScrollY(-rect.top);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black"
    >
      {/* Parallax background layers */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50"></div>
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-zinc-800/30 to-zinc-900/50"></div>
      </div>

      {/* Placeholder for future image */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          transform: `translateY(${scrollY * 0.7}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-zinc-700/20 to-black/40"></div>
        {/* Image will be added here later */}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div
          className="transform transition-transform duration-300"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY / 500),
          }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Social Media and Youth Politics:
            <span className="block text-zinc-400 mt-2">A Digital Culture Project</span>
          </h1>
          <p className="text-zinc-400 mb-6">Elwyn Breton, Lucie Gehanno, Salome Chaperot, Vladimir Lichvar</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#visualization"
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
              Explore Data
            </a>
            <a
              href="#about"
              className="px-8 py-3 border-2 border-zinc-600 text-zinc-300 rounded-lg font-semibold hover:border-zinc-400 hover:text-white transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-16 transform transition-transform duration-300"
          style={{
            opacity: Math.max(0, 1 - scrollY / 300),
          }}
        >
          <div className="flex flex-col items-center text-zinc-500 animate-bounce">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

