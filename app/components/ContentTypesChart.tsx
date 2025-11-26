'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ContentData {
  type: string;
  count: number;
  percentage: number;
}

export default function ContentTypesChart() {
  const [plotData, setPlotData] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const contentCol = headers[6]; // Content types column
          
          // Count content types (can have multiple per respondent)
          const contentCounts: { [key: string]: number } = {};
          let totalResponses = 0;
          
          csvData.forEach((row: SurveyRow) => {
            const content = row[contentCol];
            if (!content) return;
            
            // Split by semicolon (multiple selections)
            const types = content.split(';');
            types.forEach(type => {
              // Clean and take English version only
              let cleanType = type.split(' / ')[0].trim();
              if (!cleanType) return;
              
              // Shorten some labels
              if (cleanType.includes('Makeup')) cleanType = 'Beauty';
              if (cleanType.includes('Health')) cleanType = 'Health/Fitness';
              if (cleanType.includes('Entrepreneurship')) cleanType = 'Business';
              if (cleanType.includes('Advertisements')) cleanType = 'Ads';
              if (cleanType.includes('Gaming')) cleanType = 'Gaming';
              
              contentCounts[cleanType] = (contentCounts[cleanType] || 0) + 1;
              totalResponses++;
            });
          });
          
          // Convert to array and calculate percentages
          const contentData: ContentData[] = Object.entries(contentCounts)
            .map(([type, count]) => ({
              type,
              count,
              percentage: (count / totalResponses) * 100,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 content types
          
          setPlotData(contentData);
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

  const colors = [
    '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E',
  ];

  const trace = {
    y: plotData.map(d => d.type).reverse(),
    x: plotData.map(d => d.percentage).reverse(),
    type: 'bar' as const,
    orientation: 'h' as const,
    marker: {
      color: colors.slice(0, plotData.length).reverse(),
      opacity: 0.85,
    },
    text: plotData.map(d => `${d.percentage.toFixed(1)}%`).reverse(),
    textposition: 'outside' as const,
    hovertemplate: '<b>%{y}</b><br>%{x:.1f}% of content<extra></extra>',
  };

  return (
    <div className="w-full">
      <Plot
        data={[trace]}
        layout={{
          xaxis: {
            title: {
              text: '% of Total Content',
              font: { size: 10, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
            range: [0, Math.max(...plotData.map(d => d.percentage)) * 1.2],
          },
          yaxis: {
            gridcolor: '#27272a',
            color: '#a1a1aa',
            tickfont: { size: 10 },
          },
          margin: { l: 90, r: 50, t: 10, b: 40 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa', size: 9 },
          showlegend: false,
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '300px' }}
      />
    </div>
  );
}

