'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, parseNumeric, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface EngagementByTime {
  timeCategory: string;
  methods: { [key: string]: number };
  avgOverall: number;
}

const TIME_ORDER = [
  'Less than 1 hour per day',
  'Between 1 and 3 hours per day',
  'Between 3 and 5 hours per day',
  'Between 5 and 7 hours per day',
];

const TIME_LABELS = ['<1h', '1-3h', '3-5h', '5-7h'];

const METHOD_NAMES = [
  'Signing Petitions',
  'Sharing activist media',
  'Joining a political party',
  'Attending protests',
  'Contacting elected officials',
  'Voting',
  'Debating about political issues',
  'Staying informed about politics',
];

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

export default function TimeEngagementChart() {
  const [plotData, setPlotData] = useState<EngagementByTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overall' | 'detailed'>('overall');

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const timeCol = headers[5]; // Time spent column
          
          // Engagement method columns (indices 11-18)
          const methodColumns = headers.slice(11, 19);
          
          // Group data by time category
          const timeStats: { [key: string]: { methods: { [key: string]: number[] }; count: number } } = {};
          
          TIME_ORDER.forEach(time => {
            timeStats[time] = { methods: {}, count: 0 };
            METHOD_SHORT.forEach(method => {
              timeStats[time].methods[method] = [];
            });
          });
          
          csvData.forEach((row: SurveyRow) => {
            const time = row[timeCol];
            if (!time || !TIME_ORDER.some(t => time.includes(t.split(' per')[0]))) return;
            
            // Find matching time category
            const timeCategory = TIME_ORDER.find(t => time.includes(t.split(' per')[0]));
            if (!timeCategory) return;
            
            timeStats[timeCategory].count++;
            
            // Get engagement values for each method
            // Note: Lower rank = more effective (1 is best, 8 is worst)
            // We invert so higher = more effective for visualization
            methodColumns.forEach((col, idx) => {
              const val = parseNumeric(row[col]);
              if (val !== null) {
                // Invert: 9 - val makes 1 -> 8 (most effective) and 8 -> 1 (least effective)
                timeStats[timeCategory].methods[METHOD_SHORT[idx]].push(9 - val);
              }
            });
          });
          
          // Calculate averages
          const engagementData: EngagementByTime[] = TIME_ORDER.map(time => {
            const methods: { [key: string]: number } = {};
            let totalSum = 0;
            let totalCount = 0;
            
            METHOD_SHORT.forEach(method => {
              const values = timeStats[time].methods[method];
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
              timeCategory: time,
              methods,
              avgOverall: totalCount > 0 ? totalSum / totalCount : 0,
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

  const colors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', 
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
  ];

  // Create traces for each method
  const traces = viewMode === 'detailed' 
    ? METHOD_SHORT.map((method, idx) => ({
        x: TIME_LABELS,
        y: plotData.map(d => d.methods[method]),
        name: method,
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
          color: colors[idx],
          width: 2,
        },
        marker: {
          size: 8,
          color: colors[idx],
        },
        hovertemplate: `<b>${method}</b><br>Time: %{x}<br>Effectiveness: %{y:.2f}<extra></extra>`,
      }))
    : [{
        x: TIME_LABELS,
        y: plotData.map(d => d.avgOverall),
        name: 'Average Effectiveness',
        type: 'bar' as const,
        marker: {
          color: plotData.map((d, i) => {
            // Color gradient from green (high) to red (low)
            const maxVal = Math.max(...plotData.map(p => p.avgOverall));
            const minVal = Math.min(...plotData.map(p => p.avgOverall));
            const normalized = (d.avgOverall - minVal) / (maxVal - minVal);
            return `rgba(${Math.round(255 * (1 - normalized))}, ${Math.round(200 * normalized)}, 100, 0.8)`;
          }),
        },
        text: plotData.map(d => d.avgOverall.toFixed(2)),
        textposition: 'outside' as const,
        hovertemplate: '<b>%{x}</b><br>Avg Effectiveness: %{y:.2f}<extra></extra>',
      }];

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-zinc-700 p-1">
          <button
            onClick={() => setViewMode('overall')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'overall'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overall Average
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'detailed'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            By Method
          </button>
        </div>
      </div>
      
      <Plot
        data={traces}
        layout={{
          xaxis: {
            title: {
              text: 'Time Spent on Social Media',
              font: { size: 12, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
          },
          yaxis: {
            title: {
              text: 'Perceived Effectiveness',
              font: { size: 12, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
            range: viewMode === 'overall' ? [0, 8] : [0, 8],
          },
          margin: { l: 60, r: 20, t: 20, b: 60 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa', size: 10 },
          showlegend: viewMode === 'detailed',
          legend: {
            x: 1.02,
            y: 1,
            xanchor: 'left',
            font: { size: 9 },
            bgcolor: 'rgba(0,0,0,0)',
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: viewMode === 'detailed' ? '400px' : '300px' }}
      />
      
      <p className="text-xs text-zinc-500 mt-2 text-center">
        Higher values = more effective perceived engagement method (inverted from original ranking where 1 = most effective)
      </p>
    </div>
  );
}

