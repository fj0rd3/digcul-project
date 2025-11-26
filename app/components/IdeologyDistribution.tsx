'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, convertLikertToNumeric, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function IdeologyDistribution() {
  const [plotData, setPlotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          
          // Economic ideology columns (indices 22-24): taxes, public health, inequality
          // Social ideology columns (indices 19-21): same-sex marriage, abortion, immigration, environmental
          const socialColumns = headers.slice(19, 22); // Columns 20-22 (0-indexed 19-21)
          const economicColumns = headers.slice(22, 25); // Columns 23-25 (0-indexed 22-24)
          
          const socialScores: number[] = [];
          const economicScores: number[] = [];
          const labels: string[] = [];
          
          csvData.forEach((row: SurveyRow, index: number) => {
            // Calculate social ideology average
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
            
            if (socialValues.length > 0 && economicValues.length > 0) {
              const socialAvg = socialValues.reduce((a, b) => a + b, 0) / socialValues.length;
              const economicAvg = economicValues.reduce((a, b) => a + b, 0) / economicValues.length;
              
              socialScores.push(socialAvg);
              economicScores.push(economicAvg);
              labels.push(`Respondent ${index + 1}`);
            }
          });
          
          // Create scatter plot
          const trace = {
            x: economicScores,
            y: socialScores,
            mode: 'markers' as const,
            type: 'scatter' as const,
            marker: {
              size: 10,
              color: economicScores.map((e, i) => {
                // Color based on overall position (average of social and economic)
                const avg = (e + socialScores[i]) / 2;
                return avg;
              }),
              colorscale: [
                [0, '#EF4444'],    // Left (red)
                [0.5, '#A855F7'],  // Center (purple)
                [1, '#3B82F6'],    // Right (blue)
              ],
              opacity: 0.7,
              line: {
                width: 1,
                color: 'rgba(255,255,255,0.3)',
              },
            },
            text: labels,
            hovertemplate: '<b>%{text}</b><br>' +
              'Economic: %{x:.2f}<br>' +
              'Social: %{y:.2f}<extra></extra>',
          };
          
          // Add quadrant lines
          const shapes = [
            // Vertical center line
            {
              type: 'line',
              x0: 2.5,
              x1: 2.5,
              y0: 0,
              y1: 5,
              line: {
                color: 'rgba(255,255,255,0.2)',
                width: 1,
                dash: 'dash',
              },
            },
            // Horizontal center line
            {
              type: 'line',
              x0: 0,
              x1: 5,
              y0: 2.5,
              y1: 2.5,
              line: {
                color: 'rgba(255,255,255,0.2)',
                width: 1,
                dash: 'dash',
              },
            },
          ];
          
          setPlotData({ trace, shapes });
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

  if (!plotData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Plot
        data={[plotData.trace]}
        layout={{
          xaxis: {
            title: {
              text: 'Economic Ideology',
              font: { size: 12, color: '#a1a1aa' },
            },
            range: [0, 5],
            gridcolor: '#27272a',
            color: '#a1a1aa',
            tickvals: [0, 1, 2, 3, 4, 5],
            ticktext: ['Left', '', '', '', '', 'Right'],
          },
          yaxis: {
            title: {
              text: 'Social Ideology',
              font: { size: 12, color: '#a1a1aa' },
            },
            range: [0, 5],
            gridcolor: '#27272a',
            color: '#a1a1aa',
            tickvals: [0, 1, 2, 3, 4, 5],
            ticktext: ['Left', '', '', '', '', 'Right'],
          },
          shapes: plotData.shapes,
          margin: { l: 60, r: 20, t: 20, b: 60 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa' },
          showlegend: false,
          annotations: [
            {
              x: 1,
              y: 4.5,
              text: 'Social Left<br>Economic Left',
              showarrow: false,
              font: { size: 9, color: '#71717a' },
            },
            {
              x: 4,
              y: 4.5,
              text: 'Social Left<br>Economic Right',
              showarrow: false,
              font: { size: 9, color: '#71717a' },
            },
            {
              x: 1,
              y: 0.5,
              text: 'Social Right<br>Economic Left',
              showarrow: false,
              font: { size: 9, color: '#71717a' },
            },
            {
              x: 4,
              y: 0.5,
              text: 'Social Right<br>Economic Right',
              showarrow: false,
              font: { size: 9, color: '#71717a' },
            },
          ],
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '350px' }}
      />
      <p className="text-xs text-zinc-500 mt-2 text-center">
        Lower values = more left-leaning; Higher values = more right-leaning
      </p>
    </div>
  );
}

