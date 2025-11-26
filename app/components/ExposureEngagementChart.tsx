'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, parseNumeric, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface EngagementByExposure {
  exposureLevel: string;
  methods: { [key: string]: number };
  avgOverall: number;
  count: number;
}

const METHOD_SHORT = [
  'Petitions',
  'Sharing Media',
  'Joining Party',
  'Protests',
  'Contacting Officials',
  'Voting',
  'Debating',
  'Staying Informed',
];

export default function ExposureEngagementChart() {
  const [plotData, setPlotData] = useState<EngagementByExposure[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'comparison' | 'detailed'>('comparison');

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const contentCol = headers[6]; // Content types column
          
          // Engagement method columns (indices 11-18)
          const methodColumns = headers.slice(11, 19);
          
          // Categorize exposure levels based on whether politics is in their content types
          const exposureStats: { [key: string]: { methods: { [key: string]: number[] }; count: number } } = {
            'High Political Exposure': { methods: {}, count: 0 },
            'Low Political Exposure': { methods: {}, count: 0 },
          };
          
          METHOD_SHORT.forEach(method => {
            exposureStats['High Political Exposure'].methods[method] = [];
            exposureStats['Low Political Exposure'].methods[method] = [];
          });
          
          csvData.forEach((row: SurveyRow) => {
            const content = row[contentCol];
            if (!content) return;
            
            // Check if politics is mentioned in their content types
            const hasPolitics = content.toLowerCase().includes('politi');
            const exposureLevel = hasPolitics ? 'High Political Exposure' : 'Low Political Exposure';
            
            exposureStats[exposureLevel].count++;
            
            // Get engagement values for each method
            // Note: Lower rank = more effective (1 is best, 8 is worst)
            // We invert so higher = more effective for visualization
            methodColumns.forEach((col, idx) => {
              const val = parseNumeric(row[col]);
              if (val !== null) {
                // Invert: 9 - val makes 1 -> 8 (most effective) and 8 -> 1 (least effective)
                exposureStats[exposureLevel].methods[METHOD_SHORT[idx]].push(9 - val);
              }
            });
          });
          
          // Calculate averages
          const engagementData: EngagementByExposure[] = ['High Political Exposure', 'Low Political Exposure'].map(level => {
            const methods: { [key: string]: number } = {};
            let totalSum = 0;
            let totalCount = 0;
            
            METHOD_SHORT.forEach(method => {
              const values = exposureStats[level].methods[method];
              if (values.length > 0) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                methods[method] = avg;
                totalSum += avg;
                totalCount++;
              } else {
                methods[method] = 0;
              }
            });
            
            return {
              exposureLevel: level,
              methods,
              avgOverall: totalCount > 0 ? totalSum / totalCount : 0,
              count: exposureStats[level].count,
            };
          });
          
          setPlotData(engagementData);
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

  const highExposure = plotData.find(d => d.exposureLevel === 'High Political Exposure');
  const lowExposure = plotData.find(d => d.exposureLevel === 'Low Political Exposure');

  const traces = viewMode === 'comparison'
    ? [
        {
          x: METHOD_SHORT,
          y: METHOD_SHORT.map(m => highExposure?.methods[m] || 0),
          name: `High Exposure (n=${highExposure?.count || 0})`,
          type: 'bar' as const,
          marker: {
            color: '#F97316',
            opacity: 0.85,
          },
          hovertemplate: '<b>%{x}</b><br>High Exposure: %{y:.2f}<extra></extra>',
        },
        {
          x: METHOD_SHORT,
          y: METHOD_SHORT.map(m => lowExposure?.methods[m] || 0),
          name: `Low Exposure (n=${lowExposure?.count || 0})`,
          type: 'bar' as const,
          marker: {
            color: '#3B82F6',
            opacity: 0.85,
          },
          hovertemplate: '<b>%{x}</b><br>Low Exposure: %{y:.2f}<extra></extra>',
        },
      ]
    : [
        {
          x: METHOD_SHORT,
          y: METHOD_SHORT.map(m => {
            const high = highExposure?.methods[m] || 0;
            const low = lowExposure?.methods[m] || 0;
            return low > 0 ? ((high - low) / low) * 100 : 0;
          }),
          name: 'Difference (%)',
          type: 'bar' as const,
          marker: {
            color: METHOD_SHORT.map(m => {
              const high = highExposure?.methods[m] || 0;
              const low = lowExposure?.methods[m] || 0;
              const diff = low > 0 ? ((high - low) / low) * 100 : 0;
              return diff >= 0 ? '#22C55E' : '#EF4444';
            }),
            opacity: 0.85,
          },
          text: METHOD_SHORT.map(m => {
            const high = highExposure?.methods[m] || 0;
            const low = lowExposure?.methods[m] || 0;
            const diff = low > 0 ? ((high - low) / low) * 100 : 0;
            return `${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%`;
          }),
          textposition: 'outside' as const,
          hovertemplate: '<b>%{x}</b><br>Difference: %{y:.1f}%<extra></extra>',
        },
      ];

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-zinc-700 p-1">
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'comparison'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Compare Groups
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'detailed'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Show Difference
          </button>
        </div>
      </div>
      
      <Plot
        data={traces}
        layout={{
          barmode: viewMode === 'comparison' ? 'group' : undefined,
          xaxis: {
            title: {
              text: 'Engagement Method',
              font: { size: 12, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
            tickangle: -45,
            tickfont: { size: 9 },
          },
          yaxis: {
            title: {
              text: viewMode === 'comparison' ? 'Perceived Effectiveness' : 'Difference (%)',
              font: { size: 12, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
            zeroline: viewMode === 'detailed',
            zerolinecolor: '#52525b',
          },
          margin: { l: 60, r: 20, t: 20, b: 100 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa', size: 10 },
          showlegend: viewMode === 'comparison',
          legend: {
            x: 0.5,
            y: 1.1,
            xanchor: 'center',
            orientation: 'h',
            font: { size: 10 },
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '350px' }}
      />
      
      <p className="text-xs text-zinc-500 mt-2 text-center">
        {viewMode === 'comparison' 
          ? 'Comparing perceived effectiveness between those exposed to high vs low political content'
          : 'Green = high exposure values method more; Red = high exposure values method less'}
      </p>
    </div>
  );
}

