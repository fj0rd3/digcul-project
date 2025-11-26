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
              <h2 className="text-3xl font-bold text-white mb-6">Methodology</h2>

              <div className="space-y-6 text-zinc-300">
                {/* Sample Overview */}
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Sample Overview</h3>
                  <p className="leading-relaxed">
                    For this project, we surveyed <strong className="text-orange-400">100 individuals</strong> between 
                    the ages of <strong className="text-orange-400">17 and 25</strong>. Women are overrepresented in our 
                    sample (<strong className="text-orange-400">80%</strong>). Additionally, individuals aged 18 to 20 
                    make up over <strong className="text-orange-400">75%</strong> of our sample.
                  </p>
                  <p className="leading-relaxed mt-3">
                    Half of our sample primarily studies the social sciences, and half does not. We made efforts to include 
                    non-Sciences Po students to combat the potential bias introduced by their more academic knowledge of politics. 
                    Indeed, we found that social science students report being exposed to more political content on social media 
                    than students in other fields.
                  </p>
                </section>

                {/* Demographics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">100</div>
                    <div className="text-sm text-zinc-400">Participants</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">17-25</div>
                    <div className="text-sm text-zinc-400">Age Range</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">80%</div>
                    <div className="text-sm text-zinc-400">Women</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">50%</div>
                    <div className="text-sm text-zinc-400">Students of Social Sciences</div>
                  </div>
                </div>

                {/* Social Media Usage */}
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Social Media Usage Investigation</h3>
                  <p className="leading-relaxed">
                    After collecting demographic information, we investigated several dimensions of individuals&apos; 
                    social media usage:
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>Daily time spent on social media (estimated)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>Primary platform used</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>Types of content primarily encountered</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>Emotional response to content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>Trusted accounts for political/news information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>Agreement with political content encountered</span>
                    </li>
                  </ul>
                </section>

                {/* Political Opinion Measurement */}
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Measuring Political Opinion</h3>
                  <p className="leading-relaxed">
                    To estimate the political opinion of respondents, we adopted a survey model from one of our 
                    comparative politics lectures. We asked respondents to express their opinion on an equal number 
                    of economic and social policies by offering seven options from &quot;strongly support&quot; to 
                    &quot;strongly oppose.&quot;
                  </p>
                  <p className="leading-relaxed mt-3">
                    We then coded these responses into numbers from 1 to 8, with smaller values representing leftist 
                    stances and larger values indicating those on the right. We derived averages of social ideology 
                    and economic ideology for each person.
                  </p>
                </section>

                {/* Political Engagement Measurement */}
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Measuring Political Engagement</h3>
                  <p className="leading-relaxed">
                    Our measure of political engagement relies on people&apos;s <strong className="text-white">reported 
                    preferences</strong>, not their actual actions. This must be kept in mind when discussing our results.
                  </p>
                  <p className="leading-relaxed mt-3">
                    We asked respondents to assign a value to eight political engagement methods, ranging from more 
                    traditional (such as voting) to more informal and social media-based (sharing activist media). 
                    They were meant to rank these methods based on their perceived effectiveness for achieving 
                    political change.
                  </p>
                  <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-2">
                      Engagement Methods Evaluated
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>• Signing Petitions</span>
                      <span>• Sharing Activist Media</span>
                      <span>• Joining Political Parties</span>
                      <span>• Attending Protests</span>
                      <span>• Contacting Elected Officials</span>
                      <span>• Voting</span>
                      <span>• Debating Political Issues</span>
                      <span>• Staying Informed</span>
                    </div>
                  </div>
                </section>

                {/* Limitations */}
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Limitations</h3>
                  <p className="leading-relaxed">
                    Only two respondents reported that they never used social media, so we cannot meaningfully study 
                    ideological divergence between users and non-users.
                  </p>
                  <p className="leading-relaxed mt-3">
                    We also noticed that the survey allowed respondents to pick the same ranking for several engagement 
                    methods. To remedy this issue, we filtered out responses that used unique rankings 1-8 and kept 
                    only those that did not (the majority).
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
