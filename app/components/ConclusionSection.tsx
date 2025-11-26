'use client';

import { useState } from 'react';

export default function ConclusionSection() {
  const [expandedBibliography, setExpandedBibliography] = useState(false);

  const bibliography = [
    {
      authors: "Dimitrova, D. V. & Matthes, J.",
      year: "2018",
      title: "Social Media in Political Campaigning Around the World: Theoretical and Methodological Challenges",
      journal: "Journalism & Mass Communication Quarterly",
      volume: "95(2), 333-342"
    },
    {
      authors: "Harff, D. & Schmuck, D.",
      year: "2024",
      title: "Who Relies on Social Media Influencers for Political Information? A Cross-Country Study Among Youth",
      journal: "The International Journal of Press/Politics",
      volume: "30(3), 841-864"
    },
    {
      authors: "Holt et al.",
      year: "2013",
      title: "Age and the effects of news media attention and social media use on political interest and participation: Do social media function as leveller?",
      journal: "European Journal of Communication",
      volume: "28(1), 19-34"
    },
    {
      authors: "Norris, P.",
      year: "2002",
      title: "Democratic Phoenix: Reinventing Political Participation",
      journal: "New York: Cambridge University Press",
      volume: ""
    },
    {
      authors: "Peter, C. & Muth, L.",
      year: "2023",
      title: "Social Media Influencers' Role in Shaping Political Opinions and Actions of Young Audiences",
      journal: "Media and Communication",
      volume: "11(3), 164-174"
    },
    {
      authors: "Schmuck et al.",
      year: "2022",
      title: "Politics – Simply Explained? How Influencers Affect Youth's Perceived Simplification of Politics, Political Cynicism, and Political Interest",
      journal: "The International Journal of Press/Politics",
      volume: "27(3), 738-762"
    },
    {
      authors: "Verba et al.",
      year: "1995",
      title: "Voice and Equality: Civic Voluntarism in American Politics",
      journal: "Harvard University Press",
      volume: ""
    },
    {
      authors: "Warren, R. & Wicks, R.H.",
      year: "2011",
      title: "Political Socialization: Modeling Teen Political and Civic Engagement",
      journal: "Journalism and Mass Communication Quarterly",
      volume: "88(1), 156-175"
    },
    {
      authors: "Zhou, Y. & Pinkleton, B. E.",
      year: "2012",
      title: "Modeling the Effects of Political Information Source Use and Online Expression on Young Adults' Political Efficacy",
      journal: "Mass Communication and Society",
      volume: ""
    }
  ];

  return (
    <section id="conclusion" className="relative py-24 bg-gradient-to-b from-black via-zinc-900 to-black">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
            Conclusion
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Findings & Reflections
          </h2>
        </div>

        <div className="space-y-8">
          {/* Hypotheses Recap */}
          <div className="bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-bold">
                H
              </span>
              Our Hypotheses Revisited
            </h3>
            <p className="text-zinc-300 mb-4">As a reminder, our main hypotheses were:</p>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <p className="text-zinc-300">That social media use <strong className="text-white">increases the political participation</strong> of young people</p>
              </div>
              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <p className="text-zinc-300">That it <strong className="text-white">influences their political opinion</strong></p>
              </div>
              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <p className="text-zinc-300">That it is their <strong className="text-white">main source of political information</strong></p>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </span>
              Key Findings
            </h3>

            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <div className="bg-zinc-800/30 rounded-lg p-4 border-l-2 border-orange-500/50">
                <h4 className="text-white font-medium mb-2">Limitations Acknowledged</h4>
                <p>
                  We acknowledge that our research was limited by logistical concerns. As a result, we were not able to evaluate 
                  the actual translation of social media use into political participation. Instead, we relied on people&apos;s 
                  ratings of political engagement methods.
                </p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4 border-l-2 border-amber-500/50">
                <h4 className="text-white font-medium mb-2">Hypothesis 1: Political Participation</h4>
                <p>
                  In our findings, intensifying social media use (especially if the content most watched is not political) 
                  <strong className="text-orange-400"> does not appear to increase political participation</strong>, whether 
                  traditional (like voting) or more modern (sharing activist media). Therefore, we <strong className="text-white">reject 
                  hypothesis 1</strong>.
                </p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4 border-l-2 border-green-500/50">
                <h4 className="text-white font-medium mb-2">Hypothesis 2: Influence on Political Opinion</h4>
                <p>
                  Concerning the influence of social media on political opinion, our data <strong className="text-white">supports 
                  hypothesis 2</strong>. Trusting peer-like accounts (such as influencers) is associated with a stronger sense 
                  that social media shapes political views. The selective exposure mechanism—reinforced by algorithms—creates 
                  echo chambers that tend to reinforce existing opinions and potentially shape new ones.
                </p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4 border-l-2 border-blue-500/50">
                <h4 className="text-white font-medium mb-2">Hypothesis 3: Main Source of Information</h4>
                <p>
                  Our data <strong className="text-white">supports hypothesis 3</strong>. Social media is indeed a primary source 
                  of political information for young people, though the quality and nature of this information varies significantly 
                  based on the types of accounts they follow and trust.
                </p>
              </div>
            </div>
          </div>

          {/* Literature Review Summary */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              Literature Review Summary
            </h3>

            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <p>
                Our research rests on a broad scientific literature on political participation and on the role of social media 
                in the politicization of the youth. As <strong className="text-white">Norris (2002)</strong> presented a model 
                of political activism emphasizing the role of mobilizing agencies (such as unions, parties, media), we sought 
                to study the role social media could play as a mobilizing agency.
              </p>

              <p>
                To define political participation properly, we chose to rely on the work of <strong className="text-white">Verba 
                et al. (1995)</strong>. Political participation is defined as an activity that has the intent or effect of 
                influencing government action either directly or indirectly. This definition goes beyond direct activities 
                such as voting, demonstrating, and signing petitions—it encompasses indirect actions: boycotting, sharing 
                political content, staying informed about politics, and debating about political issues.
              </p>

              <div className="bg-zinc-800/50 rounded-lg p-4 my-4">
                <p className="text-zinc-400 italic text-center">
                  &quot;Social media can thus be defined as a new mobilizing agency offering new ways to engage in politics.&quot;
                </p>
              </div>

              <p>
                The effects of social media political content exposure are consequential: it strongly shapes teen political 
                engagement, influencing socialization pathways, often supplanting the influence of parents on their child&apos;s 
                political views (<strong className="text-white">Warren & Wicks, 2011</strong>). Moreover, frequent social media 
                use can function like a leveler in terms of motivating political participation (<strong className="text-white">Holt 
                et al., 2013</strong>).
              </p>

              <p>
                According to the <strong className="text-orange-400">selective exposure theory</strong>, individuals tend to 
                favor information that confirms their pre-existing views. Thus, exposure increases the likelihood of interacting 
                with and sharing the content. This mechanism, further fueled by the algorithm pushing content people are likely 
                to interact with, will create an <strong className="text-white">echo chamber</strong>, likely to influence the 
                motivation of political engagement of young people (<strong className="text-white">Dimitrova & Matthes, 2018</strong>).
              </p>

              <p>
                The educational and social background also plays an important role. According to <strong className="text-white">Zhou 
                and Pinkleton (2012)</strong>, involvement in public affairs increases attention to political information sources, 
                online political expression, and increases political efficacy. Social science students should therefore be found 
                to be more cautious about the sources they consult and more likely to engage in politics.
              </p>

              <p>
                Overall, the existing literature supports the idea that social media can increase political interest among youth 
                through exposure, facilitated communication, and easy means of action. However, this can be conditioned by prior 
                engagement, social context, and content type. Social media is also likely to increase trust in peer-like sources 
                and reinforce existing opinions while decreasing trust in institutions and traditional media 
                (<strong className="text-white">Schmuck et al., 2022; Peter & Muth, 2023</strong>).
              </p>
            </div>
          </div>

          {/* Reflections */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              Reflections
            </h3>

            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Why Study Young People?</h4>
                <p>
                  Most young people inform themselves on social media. The European Parliament youth survey of 2024 revealed 
                  that social media was the top source of information for political and social issues for <strong className="text-orange-400">42% 
                  of respondents aged 16-30</strong>. Ofcom published research in July 2025 revealing that <strong className="text-orange-400">80% 
                  of 16-24-year-olds</strong> went online to get their news, with <strong className="text-orange-400">75%</strong> looking 
                  specifically on social media.
                </p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Information as the Foundation</h4>
                <p>
                  Since <strong className="text-white">information is the basis of engagement and interest</strong>, it is crucial 
                  to understand where it comes from and what effects it has. This is why we focused on examining social media&apos;s 
                  role as an information source for political content among youth.
                </p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Low-Cost Political Engagement</h4>
                <p>
                  Verba et al.&apos;s categories of direct and indirect political participation proved useful for framing our research. 
                  We considered that social media could help spread forms of <strong className="text-white">low-cost engagement</strong> among 
                  young people—activities like sharing political content, staying informed, and debating political issues that require 
                  minimal resources but can still influence government action indirectly.
                </p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">The Role of Exposure Time</h4>
                <p>
                  The nature and the frequency of content exposure play a significant role in political engagement. Considering 
                  the selective exposure mechanism and algorithmic amplification, we hypothesized that <strong className="text-white">time 
                  of exposure</strong>—the average time spent on social media each day—would be of importance in understanding 
                  political engagement patterns among youth.
                </p>
              </div>
            </div>
          </div>

          {/* Bibliography */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setExpandedBibliography(!expandedBibliography)}
              className="w-full p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
            >
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                Bibliography
              </h3>
              <svg 
                className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${expandedBibliography ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`overflow-hidden transition-all duration-500 ${expandedBibliography ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-6 pb-6 space-y-4">
                {bibliography.map((ref, index) => (
                  <div key={index} className="bg-zinc-800/30 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors">
                    <p className="text-zinc-300 leading-relaxed">
                      <strong className="text-white">{ref.authors}</strong> ({ref.year}). 
                      <em className="text-orange-400/90"> &quot;{ref.title}&quot;</em>. 
                      <span className="text-zinc-400"> {ref.journal}</span>
                      {ref.volume && <span className="text-zinc-500">, {ref.volume}</span>}.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Note */}
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-6 border border-orange-500/20 text-center">
            <p className="text-zinc-300 italic">
              &quot;Understanding how social media shapes political engagement is crucial in an era where digital platforms 
              increasingly mediate our relationship with civic life.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

