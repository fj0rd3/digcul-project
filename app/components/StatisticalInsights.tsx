'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { parseCSV, SurveyRow, getAgeGroup, getSocialMediaPlatforms, convertTimeToNumeric } from '../lib/dataUtils';

// Helper function to remove French translations from labels
function removeFrenchlabel(label: string): string {
  if (!label) return label;
  const parts = label.split(' / ');
  return parts[0].trim();
}

// Helper function to categorize emotional responses
function categorizeEmotion(emotion: string): string {
  if (!emotion) return emotion;
  const lower = emotion.toLowerCase();
  
  if (lower.includes('happy') || lower.includes('heureux') || 
      lower.includes('informed') || lower.includes('included') || 
      lower.includes('motivated') || lower.includes('hopeful')) {
    return 'Good';
  }
  if (lower.includes('sad') || lower.includes('triste') || 
      lower.includes('angry') || lower.includes('colère') || 
      lower.includes('anxious') || lower.includes('defeated') || 
      lower.includes('uncomfortable') || lower.includes('upsetting')) {
    return 'Bad';
  }
  if (lower.includes('indifferent') || lower.includes('indifférent') || 
      lower.includes('depends')) {
    return 'Neutral';
  }
  return 'Mixed';
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}

export default function StatisticalInsights() {
  const [data, setData] = useState<SurveyRow[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const visibilityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        setData(csvData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setScrollY(-rect.top);
      }
      
      if (visibilityRef.current && !isVisible) {
        const rect = visibilityRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Only set visible once when scrolling down into view
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  const stats = useMemo(() => {
    if (!data.length) return [];

    const headers = Object.keys(data[0]);
    const ageCol = headers[1];
    const genderCol = headers[2];
    const socialSciencesCol = headers[3];
    const socialMediaCol = headers[4];
    const timeCol = headers[5];
    const emotionCol = headers[7];
    const alignmentCol = headers[8];

    const total = data.length;

    // Age groups
    const ageGroups: { [key: string]: number } = {};
    data.forEach(row => {
      const ageGroup = getAgeGroup(row[ageCol]);
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
    });
    const topAgeGroup = Object.entries(ageGroups).sort((a, b) => b[1] - a[1])[0];
    const topAgeGroupPct = ((topAgeGroup[1] / total) * 100).toFixed(1);

    // Gender distribution
    const genders: { [key: string]: number } = {};
    data.forEach(row => {
      const gender = removeFrenchlabel(row[genderCol] || '');
      if (gender) {
        genders[gender] = (genders[gender] || 0) + 1;
      }
    });
    const topGender = Object.entries(genders).sort((a, b) => b[1] - a[1])[0];
    const topGenderPct = ((topGender[1] / total) * 100).toFixed(1);

    // Social sciences
    const socialSciencesYes = data.filter(row => 
      removeFrenchlabel(row[socialSciencesCol] || '') === 'Yes'
    ).length;
    const socialSciencesPct = ((socialSciencesYes / total) * 100).toFixed(1);

    // Social media platforms
    const platforms = getSocialMediaPlatforms(data, socialMediaCol);
    const platformCounts: { [key: string]: number } = {};
    data.forEach(row => {
      const platform = removeFrenchlabel(row[socialMediaCol] || '');
      if (platform) {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      }
    });
    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
    const topPlatformPct = ((topPlatform[1] / total) * 100).toFixed(1);

    // Average time spent
    const timeValues: number[] = [];
    data.forEach(row => {
      const timeVal = convertTimeToNumeric(row[timeCol] || '');
      if (timeVal !== null) {
        timeValues.push(timeVal);
      }
    });
    const avgTime = timeValues.length > 0 
      ? (timeValues.reduce((a, b) => a + b, 0) / timeValues.length).toFixed(1)
      : '0';

    // Political alignment
    const alignmentCounts: { [key: string]: number } = {};
    data.forEach(row => {
      const alignment = removeFrenchlabel(row[alignmentCol] || '');
      if (alignment && !alignment.includes('never')) {
        alignmentCounts[alignment] = (alignmentCounts[alignment] || 0) + 1;
      }
    });
    const alignedYes = alignmentCounts['Yes'] || 0;
    const alignedPct = total > 0 ? ((alignedYes / total) * 100).toFixed(1) : '0';

    // Emotional responses
    const emotions: { [key: string]: number } = {};
    data.forEach(row => {
      const emotion = categorizeEmotion(removeFrenchlabel(row[emotionCol] || ''));
      if (emotion) {
        emotions[emotion] = (emotions[emotion] || 0) + 1;
      }
    });
    const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];
    const topEmotionPct = topEmotion ? ((topEmotion[1] / total) * 100).toFixed(1) : '0';

    return [
      {
        title: 'Total Respondents',
        value: total,
        subtitle: 'Survey participants',
        icon: '👥',
      },
      {
        title: 'Top Age Group',
        value: topAgeGroup[0],
        subtitle: `${topAgeGroupPct}% of respondents`,
        icon: '📊',
      },
      {
        title: 'Gender Distribution',
        value: topGender[0],
        subtitle: `${topGenderPct}% of respondents`,
        icon: '⚖️',
      },
      {
        title: 'Social Sciences Students',
        value: `${socialSciencesPct}%`,
        subtitle: `${socialSciencesYes} out of ${total}`,
        icon: '🎓',
      },
      {
        title: 'Most Popular Platform',
        value: topPlatform[0],
        subtitle: `${topPlatformPct}% of users`,
        icon: '📱',
      },
      {
        title: 'Average Time Spent',
        value: `${avgTime} hours/day`,
        subtitle: 'On social media',
        icon: '⏱️',
      },
      {
        title: 'Content Alignment',
        value: `${alignedPct}%`,
        subtitle: 'Political content aligned with opinions',
        icon: '🎯',
      },
      {
        title: 'Top Emotional Response',
        value: topEmotion[0],
        subtitle: `${topEmotionPct}% feel ${topEmotion[0].toLowerCase()}`,
        icon: '😊',
      },
    ] as StatCard[];
  }, [data]);

  return (
    <section
      id="statistical-insights"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black py-16"
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

      {/* Content */}
      <div ref={visibilityRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Key Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 transform hover:scale-105"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible 
                  ? `translateY(${scrollY * 0.1}px)` 
                  : 'translateY(-30px)',
                transition: `opacity 0.5s ease-out ${index * 0.15}s, transform 0.5s ease-out ${index * 0.15}s`,
              }}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-2">
                {typeof stat.value === 'number' 
                  ? stat.value.toLocaleString() 
                  : stat.value}
              </div>
              <div className="text-sm font-semibold text-zinc-300 mb-1">
                {stat.title}
              </div>
              {stat.subtitle && (
                <div className="text-xs text-zinc-500">
                  {stat.subtitle}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

