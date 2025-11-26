'use client';

import { useRef, useState, useEffect } from 'react';
import DigitalCultureGame from './DigitalCultureGame';
import IdeologyDistribution from './IdeologyDistribution';
import PlatformIdeology from './PlatformIdeology';
import ContentTypesChart from './ContentTypesChart';
import NewsSourcesChart from './NewsSourcesChart';
import TrustedAccountsChart from './TrustedAccountsChart';
import TimeEngagementChart from './TimeEngagementChart';
import ExposureEngagementChart from './ExposureEngagementChart';

export default function ResultsSection() {
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
      id="results"
      ref={sectionRef}
      className="relative bg-gradient-to-b from-black via-zinc-900 to-black"
    >
      {/* Background decorations */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      >
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Results Header */}
      <div className="relative z-10 py-16 text-center">
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
          Research Results
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Our Findings
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto px-4">
          Explore the results of our survey on social media use and political engagement among young people.
        </p>
      </div>

      {/* Interactive Game Section */}
      <div className="relative z-10 py-12 bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
              Interactive Demo
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Discover Our Results Through Simulation
            </h3>
          </div>
          <DigitalCultureGame />
        </div>
      </div>

      {/* Political Opinion Section */}
      <div className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
              Political Opinion
            </span>
            <h3 className="text-3xl font-bold text-white mb-4">
              Ideology Distribution
            </h3>
            <p className="text-zinc-400 max-w-3xl">
              To estimate political opinion, we asked respondents about economic and social policies, 
              coding responses from 1 (left) to 7 (right). A majority of respondents were located on 
              the left of the ideological spectrum.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Social vs Economic Ideology</h4>
              <IdeologyDistribution />
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Ideology by Platform</h4>
              <PlatformIdeology />
            </div>
          </div>

          <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Key Finding</h4>
            <p className="text-zinc-300 leading-relaxed">
              We found no significant difference in people&apos;s social and economic ideology based on time spent 
              on social media per day. However, we noticed small differences depending on which platform individuals 
              used most. <strong className="text-orange-400">TikTok users</strong> were slightly more economically 
              conservative and more socially on the left than Instagram users. Users of <strong className="text-orange-400">
              other platforms</strong> are noticeably more economically and politically conservative—further to the 
              right by about <strong className="text-orange-400">8%</strong> than users of both other platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Political Engagement Section */}
      <div className="relative z-10 py-16 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
              Political Engagement
            </span>
            <h3 className="text-3xl font-bold text-white mb-4">
              Staying Informed on Social Media
            </h3>
            <p className="text-zinc-400 max-w-3xl">
              We asked respondents about the content they encounter, where they get their political news, 
              and which accounts they trust for reliable information.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Content Types Encountered</h4>
              <ContentTypesChart />
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Political News Sources</h4>
              <NewsSourcesChart />
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Trusted Accounts</h4>
              <TrustedAccountsChart />
            </div>
          </div>

          <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-6 mb-16">
            <h4 className="text-lg font-semibold text-white mb-3">Key Findings</h4>
            <ul className="space-y-3 text-zinc-300">
              <li className="flex gap-3">
                <span className="text-orange-400">•</span>
                <span>
                  Humor, politics, art, and music were the leading categories of content, representing about 
                  <strong className="text-orange-400"> 50%</strong> of all content. Politics represents around 
                  <strong className="text-orange-400"> 12%</strong> of primary content exposure.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400">•</span>
                <span>
                  A majority of respondents (<strong className="text-orange-400">34%</strong>) answered 
                  &quot;social media&quot; when asked where they get their political news.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400">•</span>
                <span>
                  About <strong className="text-orange-400">35%</strong> of respondents trust Hugo Décrypte 
                  for accurate news, while <strong className="text-orange-400">16%</strong> trust Le Monde. 
                  About <strong className="text-orange-400">54%</strong> consult traditional/independent newspaper 
                  accounts, while <strong className="text-orange-400">46%</strong> trust individuals instead.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Impact of Time Spent Section */}
      <div className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
              Time Analysis
            </span>
            <h3 className="text-3xl font-bold text-white mb-4">
              Impact of Time Spent on Social Media
            </h3>
            <p className="text-zinc-400 max-w-3xl">
              We examined how time spent on social media correlates with perceived effectiveness of 
              different political engagement methods.
            </p>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 mb-8">
            <TimeEngagementChart />
          </div>

          <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Key Findings</h4>
            <p className="text-zinc-300 leading-relaxed mb-4">
              As time spent on social media per day increases, individuals rate the efficiency of political 
              engagement methods for enacting political change <strong className="text-orange-400">17% lower</strong> on 
              average. We observe a negative correlation for each of the eight engagement methods.
            </p>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Between individuals who spend less than an hour on social media per day and those who spend 
              between five and seven hours, we observe sharp declines in perceived effectiveness of:
            </p>
            <ul className="grid md:grid-cols-2 gap-2 text-zinc-300">
              <li className="flex gap-2 items-center">
                <span className="text-red-400 font-semibold">-41%</span>
                <span>Signing petitions</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-red-400 font-semibold">-33%</span>
                <span>Staying informed about politics</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-red-400 font-semibold">-23%</span>
                <span>Sharing activist media</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-red-400 font-semibold">-23%</span>
                <span>Debating political issues</span>
              </li>
            </ul>
            <p className="text-zinc-400 mt-4 text-sm">
              Interestingly, these are activities most easily performed on social media or the internet. 
              Heavy social media users seem to distrust political engagement in general, and especially 
              online political engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Impact of Political Content Exposure Section */}
      <div className="relative z-10 py-16 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
              Exposure Analysis
            </span>
            <h3 className="text-3xl font-bold text-white mb-4">
              Impact of Political Content Exposure
            </h3>
            <p className="text-zinc-400 max-w-3xl">
              We analyzed how the rate of exposure to political content on social media affects 
              perceptions of political engagement effectiveness.
            </p>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 mb-8">
            <ExposureEngagementChart />
          </div>

          <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Key Findings</h4>
            <p className="text-zinc-300 leading-relaxed mb-4">
              We did not find any significant difference in the overall rating of political engagement methods 
              based on individuals&apos; exposure to political content on social media. However, those who are 
              exposed to <strong className="text-orange-400">much political content</strong> value six of the 
              methods more highly than those who are exposed to little political content.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Interestingly, <strong className="text-orange-400">sharing activist media</strong> (-7%) and 
              <strong className="text-orange-400"> signing petitions</strong> (-13%) are rated as less effective 
              by those who view a high amount of political content. This aligns with the finding that heavy 
              social media users distrust these specific online-focused political engagement methods, though 
              viewing more political content can heterogeneously reinforce or temper this effect.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

