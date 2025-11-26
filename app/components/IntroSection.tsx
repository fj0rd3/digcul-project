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
    <>
      {/* Hero Section */}
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

      <div
        className="absolute inset-0 opacity-10"
        style={{
          transform: `translateY(${scrollY * 0.7}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-zinc-700/20 to-black/40"></div>
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
                href="#results"
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
              Explore Data
            </a>
            <a
              href="#about"
              className="px-8 py-3 border-2 border-zinc-600 text-zinc-300 rounded-lg font-semibold hover:border-zinc-400 hover:text-white transition-colors"
            >
                Methodology
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

      {/* Literature Review Section */}
      <section className="relative py-24 bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
              Introduction & Motivation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why Study Social Media&apos;s Impact on Youth Politics?
            </h2>
          </div>

          <div className="space-y-8 text-zinc-300 leading-relaxed">
            {/* Theoretical Framework */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-orange-400">01</span> Theoretical Framework
              </h3>
              <p className="mb-4">
                Norris&apos;s (2002) model of political activism emphasizes the role of mobilizing agencies such as unions, 
                parties, and media. We wanted to study the particular role social media can play as mobilizing agencies, 
                where resources and motivation are essential to political activism.
              </p>
              <p>
                Verba et al. (1995) defined political participation as an activity that has the intent or effect of 
                influencing government action either directly or indirectly. This definition encompasses more than 
                classical direct activities (voting, demonstrating, signing petitions), but also indirect forms: 
                boycotting, sharing political content, staying informed about politics, and debating political issues. 
                We hypothesized that social media may help spread these forms of low-cost engagement among young people.
              </p>
            </div>

            {/* Key Statistics */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-orange-400">02</span> Youth Information Habits
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-400 mb-2">42%</div>
                  <p className="text-sm">
                    of respondents aged 16-30 use social media as their top source of information for political 
                    and social issues (European Parliament Youth Survey, 2024)
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-400 mb-2">75%</div>
                  <p className="text-sm">
                    of 16-24-year-olds look specifically to social media for news, with 80% going online for news 
                    (Ofcom UK Research, July 2025)
                  </p>
                </div>
              </div>
            </div>

            {/* Research Evidence */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-orange-400">03</span> What Research Tells Us
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <p>
                    <strong className="text-white">Warren & Wicks (2011)</strong> confirmed that online political media 
                    activity strongly shapes teen political engagement, with social media sometimes replacing parental 
                    influence on political views.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <p>
                    <strong className="text-white">Holt et al. (2013)</strong> suggested that frequent social media use 
                    among young citizens can function as a leveller in terms of motivating political participation.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <p>
                    <strong className="text-white">Zhou & Pinkleton (2012)</strong> found that involvement in public affairs 
                    increases attention to political information sources, online political expression, and political efficacy.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <p>
                    <strong className="text-white">Selective Exposure Theory</strong> (Dimitrova & Matthes, 2018) suggests 
                    individuals favor information confirming their pre-existing views, making time spent on social media 
                    potentially significant for youth political engagement.
                  </p>
                </li>
              </ul>
            </div>

            {/* Hypotheses */}
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-6 border border-orange-500/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-orange-400">04</span> Our Hypotheses
              </h3>
              <p className="mb-4 text-zinc-400">
                The literature supports that social media can increase political interest among youth through exposure, 
                facilitated communication, and easy means of action. However, effects may be conditioned by prior engagement, 
                social context, and content type. Our main hypotheses were:
              </p>
              <ol className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="bg-orange-500/20 text-orange-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                  <p>Social media use would <strong className="text-white">increase political participation</strong> of young people</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-orange-500/20 text-orange-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                  <p>It would <strong className="text-white">influence their political opinion</strong></p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-orange-500/20 text-orange-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                  <p>It would compose their <strong className="text-white">main source of political information</strong></p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
