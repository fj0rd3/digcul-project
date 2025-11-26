'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, convertLikertToNumeric, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PlatformData {
  platform: string;
  socialAvg: number;
  economicAvg: number;
  count: number;
}

export default function PlatformIdeology() {
  const [plotData, setPlotData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const platformCol = headers[4]; // Social media platform column
          
          // Social ideology columns (indices 19-21)
          // Economic ideology columns (indices 22-24)
          const socialColumns = headers.slice(19, 22);
          const economicColumns = headers.slice(22, 25);
          
          // Group data by platform
          const platformStats: { [key: string]: { social: number[]; economic: number[] } } = {};
          
          csvData.forEach((row: SurveyRow) => {
            let platform = row[platformCol];
            if (!platform) return;
            
            // Clean platform name
            platform = platform.split(' / ')[0].trim();
            
            // Normalize platform names
            if (platform === 'I do not use social media') return;
            if (!['Instagram', 'Tiktok', 'TikTok'].includes(platform)) {
              platform = 'Other';
            }
            if (platform === 'TikTok') platform = 'Tiktok';
            
            if (!platformStats[platform]) {
              platformStats[platform] = { social: [], economic: [] };
            }
            
            // Calculate social ideology average for this respondent
            const socialValues: number[] = [];
            socialColumns.forEach((col: string) => {
              const val = convertLikertToNumeric(row[col]);
              if (val !== null) socialValues.push(val);
            });
            
            // Calculate economic ideology average
            const economicValues: number[] = [];
            economicColumns.forEach((col: string) => {
              const val = convertLikertToNumeric(row[col]);
              if (val !== null) economicValues.push(val);
            });
            
            if (socialValues.length > 0) {
              const socialAvg = socialValues.reduce((a, b) => a + b, 0) / socialValues.length;
              platformStats[platform].social.push(socialAvg);
            }
            
            if (economicValues.length > 0) {
              const economicAvg = economicValues.reduce((a, b) => a + b, 0) / economicValues.length;
              platformStats[platform].economic.push(economicAvg);
            }
          });
          
          // Calculate averages per platform
          const platformData: PlatformData[] = Object.entries(platformStats).map(([platform, data]) => ({
            platform,
            socialAvg: data.social.length > 0 
              ? data.social.reduce((a, b) => a + b, 0) / data.social.length 
              : 0,
            economicAvg: data.economic.length > 0 
              ? data.economic.reduce((a, b) => a + b, 0) / data.economic.length 
              : 0,
            count: data.social.length,
          }));
          
          // Sort by platform order
          const platformOrder = ['Instagram', 'Tiktok', 'Other'];
          platformData.sort((a, b) => platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform));
          
          setPlotData(platformData);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading chart...</div>
      </div>
    );
  }

  if (!plotData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">No data available</div>
      </div>
    );
  }

  const platforms = plotData.map(d => d.platform);
  const socialValues = plotData.map(d => d.socialAvg);
  const economicValues = plotData.map(d => d.economicAvg);
  const counts = plotData.map(d => d.count);

  const socialTrace = {
    x: platforms,
    y: socialValues,
    name: 'Social Ideology',
    type: 'bar' as const,
    marker: {
      color: '#A855F7',
      opacity: 0.8,
    },
    text: socialValues.map((v, i) => `${v.toFixed(2)} (n=${counts[i]})`),
    textposition: 'outside' as const,
    hovertemplate: '<b>%{x}</b><br>Social: %{y:.2f}<extra></extra>',
  };

  const economicTrace = {
    x: platforms,
    y: economicValues,
    name: 'Economic Ideology',
    type: 'bar' as const,
    marker: {
      color: '#F97316',
      opacity: 0.8,
    },
    text: economicValues.map(v => v.toFixed(2)),
    textposition: 'outside' as const,
    hovertemplate: '<b>%{x}</b><br>Economic: %{y:.2f}<extra></extra>',
  };

  return (
    <div className="w-full">
      <Plot
        data={[socialTrace, economicTrace]}
        layout={{
          barmode: 'group',
          xaxis: {
            title: {
              text: 'Platform',
              font: { size: 12, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
          },
          yaxis: {
            title: {
              text: 'Average Ideology Score',
              font: { size: 12, color: '#a1a1aa' },
            },
            range: [0, 5],
            gridcolor: '#27272a',
            color: '#a1a1aa',
            tickvals: [0, 1, 2, 3, 4, 5],
            ticktext: ['Left', '', '', '', '', 'Right'],
          },
          margin: { l: 60, r: 20, t: 40, b: 60 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa', size: 10 },
          showlegend: true,
          legend: {
            x: 0.5,
            y: 1.1,
            xanchor: 'center',
            orientation: 'h',
            font: { size: 10 },
          },
          // Add reference line at 2.5 (center)
          shapes: [{
            type: 'line',
            x0: -0.5,
            x1: 2.5,
            y0: 2.5,
            y1: 2.5,
            line: {
              color: 'rgba(255,255,255,0.2)',
              width: 1,
              dash: 'dash',
            },
          }],
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '350px' }}
      />
      <p className="text-xs text-zinc-500 mt-2 text-center">
        Scale: 0 (Left) to 5 (Right) | Center line at 2.5
      </p>
    </div>
  );
}

