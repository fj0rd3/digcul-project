'use client';

import { useEffect, useRef, useState } from 'react';

export default function ResearchQuestion() {
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
      ref={sectionRef}
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black"
    >
      {/* Parallax background layers - continuing from intro */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-zinc-900/50 to-black/50"></div>
      </div>

      <div
        className="absolute inset-0 opacity-15"
        style={{
          transform: `translateY(${scrollY * 0.25}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-orange-800/10 to-zinc-900/50"></div>
      </div>

      {/* Decorative elements */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="transform transition-all duration-500"
          style={{
            transform: `translateY(${Math.min(scrollY * 0.15, 50)}px)`,
            opacity: Math.min(1, Math.max(0.3, (scrollY + 200) / 400)),
          }}
        >
          {/* Label */}
          <span className="inline-block px-4 py-1.5 mb-8 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
            Research Question
          </span>

          {/* Main question */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            How does social media use impact young people&apos;s{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              political engagement preferences
            </span>{' '}
            and{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              political opinion
            </span>
            ?
          </h2>

          {/* Decorative line */}
          <div className="mt-12 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500/50 via-amber-500/50 to-orange-500/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

