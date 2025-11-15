'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Navbar becomes sticky after scrolling 300px
      setIsSticky(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${isSticky ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-white">Digital Culture Study</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="#intro"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Introduction
              </a>
              <a
                href="#parallel-categories"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Data Flow
              </a>
              <a
                href="#correlation-heatmap"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Correlations
              </a>
              <a
                href="#visualization"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Visualization
              </a>
              <a
                href="#about"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95 border-t border-zinc-800">
            <a
              href="#intro"
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Introduction
            </a>
            <a
              href="#parallel-categories"
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Data Flow
            </a>
            <a
              href="#correlation-heatmap"
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Correlations
            </a>
            <a
              href="#visualization"
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Visualization
            </a>
            <a
              href="#about"
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              About
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

