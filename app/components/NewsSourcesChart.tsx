'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export default function NewsSourcesChart() {
  const [plotData, setPlotData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const sourceCol = headers[9]; // Political information source column
          
          // Count news sources
          const sourceCounts: { [key: string]: number } = {};
          let totalResponses = 0;
          
          csvData.forEach((row: SurveyRow) => {
            const sources = row[sourceCol];
            if (!sources) return;
            
            // Split by semicolon (multiple selections)
            const sourceList = sources.split(';');
            sourceList.forEach(source => {
              // Clean and take English version only
              let cleanSource = source.split(' / ')[0].trim();
              if (!cleanSource) return;
              
              // Shorten labels
              if (cleanSource.includes('Social media')) cleanSource = 'Social Media';
              if (cleanSource.includes('Newpapers')) cleanSource = 'Newspapers';
              if (cleanSource.includes('Family')) cleanSource = 'Family/Friends';
              
              sourceCounts[cleanSource] = (sourceCounts[cleanSource] || 0) + 1;
              totalResponses++;
            });
          });
          
          // Convert to array and calculate percentages
          const sourceData: SourceData[] = Object.entries(sourceCounts)
            .map(([source, count]) => ({
              source,
              count,
              percentage: (count / totalResponses) * 100,
            }))
            .sort((a, b) => b.count - a.count);
          
          setPlotData(sourceData);
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

  const colors = ['#F97316', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6', '#EC4899'];

  const trace = {
    labels: plotData.map(d => d.source),
    values: plotData.map(d => d.count),
    type: 'pie' as const,
    hole: 0.4,
    marker: {
      colors: colors.slice(0, plotData.length),
    },
    textinfo: 'percent' as const,
    textposition: 'outside' as const,
    textfont: { family: 'Arial, sans-serif', size: 10, color: '#a1a1aa' },
    hovertemplate: '<b>%{label}</b><br>%{value} responses<br>%{percent}<extra></extra>',
    pull: plotData.map((_, i) => i === 0 ? 0.05 : 0), // Pull out the largest slice slightly
  };

  return (
    <div className="w-full">
      <Plot
        data={[trace]}
        layout={{
          margin: { l: 20, r: 20, t: 20, b: 20 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa', size: 10 },
          showlegend: true,
          legend: {
            x: 0.5,
            y: -0.15,
            xanchor: 'center',
            orientation: 'h',
            font: { size: 9 },
          },
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

