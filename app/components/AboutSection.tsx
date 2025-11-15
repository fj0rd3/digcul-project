'use client';

import { useState, useEffect } from 'react';

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#about') {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Check initial hash
    if (window.location.hash === '#about') {
      setIsOpen(true);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Remove hash without scrolling
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800 shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6">About This Research</h2>

              <div className="space-y-6 text-zinc-300">
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Research Overview</h3>
                  <p className="leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
                    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p className="leading-relaxed mt-3">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque 
                    ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia 
                    voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Methodology</h3>
                  <p className="leading-relaxed">
                    Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi 
                    tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem 
                    ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
                  </p>
                  <p className="leading-relaxed mt-3">
                    Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem 
                    eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium 
                    voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Research Questions</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit?</li>
                    <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?</li>
                    <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris?</li>
                    <li>Duis aute irure dolor in reprehenderit in voluptate velit esse?</li>
                    <li>Excepteur sint occaecat cupidatat non proident, sunt in culpa?</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Data Collection</h3>
                  <p className="leading-relaxed">
                    Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis 
                    est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod 
                    maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
                  </p>
                  <p className="leading-relaxed mt-3">
                    Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint 
                    et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores 
                    alias consequatur aut perferendis doloribus asperiores repellat.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Limitations</h3>
                  <p className="leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                  <p className="leading-relaxed mt-3">
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut 
                    perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa 
                    quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

