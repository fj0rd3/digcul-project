'use client';

import { useState, useRef, useEffect } from 'react';
import { exportComprehensivePDF, capturePlotlyImage } from '../lib/comprehensiveExport';
import { parseCSV, SurveyRow, getAgeGroup, getSocialMediaPlatforms, convertTimeToNumeric } from '../lib/dataUtils';

// Helper functions (same as StatisticalInsights)
function removeFrenchlabel(label: string): string {
  if (!label) return label;
  const parts = label.split(' / ');
  return parts[0].trim();
}

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

interface ComprehensiveExportProps {
  parallelCategoriesFilters?: Record<string, any>;
}

export default function ComprehensiveExport({
  parallelCategoriesFilters,
}: ComprehensiveExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [keyInsights, setKeyInsights] = useState<Array<{ title: string; value: string | number; subtitle?: string; icon: string }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadInsights() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        const headers = Object.keys(csvData[0]);
        const ageCol = headers[1];
        const genderCol = headers[2];
        const socialSciencesCol = headers[3];
        const socialMediaCol = headers[4];
        const timeCol = headers[5];
        const emotionCol = headers[7];
        const alignmentCol = headers[8];

        const total = csvData.length;

        // Age groups
        const ageGroups: { [key: string]: number } = {};
        csvData.forEach(row => {
          const ageGroup = getAgeGroup(row[ageCol]);
          ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
        });
        const topAgeGroup = Object.entries(ageGroups).sort((a, b) => b[1] - a[1])[0];
        const topAgeGroupPct = ((topAgeGroup[1] / total) * 100).toFixed(1);

        // Gender distribution
        const genders: { [key: string]: number } = {};
        csvData.forEach(row => {
          const gender = removeFrenchlabel(row[genderCol] || '');
          if (gender) {
            genders[gender] = (genders[gender] || 0) + 1;
          }
        });
        const topGender = Object.entries(genders).sort((a, b) => b[1] - a[1])[0];
        const topGenderPct = ((topGender[1] / total) * 100).toFixed(1);

        // Social sciences
        const socialSciencesYes = csvData.filter(row => 
          removeFrenchlabel(row[socialSciencesCol] || '') === 'Yes'
        ).length;
        const socialSciencesPct = ((socialSciencesYes / total) * 100).toFixed(1);

        // Social media platforms
        const platforms = getSocialMediaPlatforms(csvData, socialMediaCol);
        const platformCounts: { [key: string]: number } = {};
        csvData.forEach(row => {
          const platform = removeFrenchlabel(row[socialMediaCol] || '');
          if (platform) {
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
          }
        });
        const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
        const topPlatformPct = ((topPlatform[1] / total) * 100).toFixed(1);

        // Average time spent
        const timeValues: number[] = [];
        csvData.forEach(row => {
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
        csvData.forEach(row => {
          const alignment = removeFrenchlabel(row[alignmentCol] || '');
          if (alignment && !alignment.includes('never')) {
            alignmentCounts[alignment] = (alignmentCounts[alignment] || 0) + 1;
          }
        });
        const alignedYes = alignmentCounts['Yes'] || 0;
        const alignedPct = total > 0 ? ((alignedYes / total) * 100).toFixed(1) : '0';

        // Emotional responses
        const emotions: { [key: string]: number } = {};
        csvData.forEach(row => {
          const emotion = categorizeEmotion(removeFrenchlabel(row[emotionCol] || ''));
          if (emotion) {
            emotions[emotion] = (emotions[emotion] || 0) + 1;
          }
        });
        const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];
        const topEmotionPct = topEmotion ? ((topEmotion[1] / total) * 100).toFixed(1) : '0';

        setKeyInsights([
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
        ]);
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    }
    loadInsights();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Capture images from Plotly plots using querySelector
      let parallelCategoriesImage: string | null = null;
      let heatmapImage: string | null = null;
      let plot3DImage: string | null = null;

      // Dynamically import Plotly only in the browser
      if (typeof window === 'undefined') {
        console.error('Export can only be done in browser');
        return;
      }
      
      const Plotly = (await import('plotly.js-dist-min')).default;

      // Capture Parallel Categories plot
      try {
        const parallelSection = document.querySelector('#parallel-categories');
        const parallelPlotElement = parallelSection?.querySelector('.js-plotly-plot') as HTMLElement;
        if (parallelPlotElement) {
          parallelCategoriesImage = await Plotly.toImage(parallelPlotElement, {
            format: 'png',
            width: 900,
            height: 500,
            scale: 1.5,
          });
        }
      } catch (error) {
        console.error('Error capturing parallel categories:', error);
      }

      // Capture Heatmap
      try {
        const heatmapSection = document.querySelector('#correlation-heatmap');
        const heatmapPlotElement = heatmapSection?.querySelector('.js-plotly-plot') as HTMLElement;
        if (heatmapPlotElement) {
          heatmapImage = await Plotly.toImage(heatmapPlotElement, {
            format: 'png',
            width: 700,
            height: 600,
            scale: 1.5,
          });
        }
      } catch (error) {
        console.error('Error capturing heatmap:', error);
      }

      // Capture 3D Plot
      try {
        const plot3DSection = document.querySelector('#visualization');
        const plot3DElement = plot3DSection?.querySelector('.js-plotly-plot') as HTMLElement;
        if (plot3DElement) {
          plot3DImage = await Plotly.toImage(plot3DElement, {
            format: 'png',
            width: 900,
            height: 500,
            scale: 1.5,
          });
        }
      } catch (error) {
        console.error('Error capturing 3D plot:', error);
      }

      // Get filters from ParallelCategories summary stats
      const filters: Record<string, any> = {};
      try {
        const parallelSection = document.querySelector('#parallel-categories');
        const summaryStats = parallelSection?.querySelector('.bg-zinc-900\\/50.rounded-lg.p-4');
        if (summaryStats) {
          const statsText = summaryStats.textContent || '';
          const totalMatch = statsText.match(/Total Respondents:\s*(\d+)/);
          const filteredMatch = statsText.match(/Filtered:\s*(\d+)/);
          const dimensionsMatch = statsText.match(/Dimensions:\s*(\d+)/);
          
          if (totalMatch) filters['Total Respondents'] = totalMatch[1];
          if (filteredMatch) filters['Filtered Respondents'] = filteredMatch[1];
          if (dimensionsMatch) filters['Active Dimensions'] = dimensionsMatch[1];
        }
      } catch (error) {
        console.error('Error extracting filters:', error);
      }

      // Generate and export PDF
      await exportComprehensivePDF({
        title: 'Digital Culture Study - Comprehensive Report',
        keyInsights,
        parallelCategoriesImage: parallelCategoriesImage || undefined,
        heatmapImage: heatmapImage || undefined,
        plot3DImage: plot3DImage || undefined,
        filters: Object.keys(filters).length > 0 ? filters : (parallelCategoriesFilters || {}),
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-12">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-8 py-4 bg-black text-white rounded-lg border border-zinc-700 hover:bg-zinc-900 hover:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold text-lg shadow-lg"
        title="Download comprehensive report as PNG"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Report</span>
          </>
        )}
      </button>
    </div>
  );
}

