'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  parseCSV,
  SurveyRow,
  getOrdinalVariables,
  convertTimeToNumeric,
  convertLikertToNumeric,
  parseNumeric,
  calculateCorrelation,
} from '../lib/dataUtils';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function CorrelationHeatmap() {
  const [data, setData] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const plotContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        setData(csvData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const correlationMatrix = useMemo(() => {
    if (!data.length) return null;

    const headers = Object.keys(data[0]);
    const timeColumn = headers[5];
    const ordinalVars = getOrdinalVariables(headers);

    // Build list of all variables (time + ordinal)
    const variableKeys: Array<{ label: string; key: string; isTime?: boolean; isLikert?: boolean }> = [];
    
    // Add time spent
    const cleanTimeLabel = timeColumn.split(' / ')[0].trim();
    const displayLabel = cleanTimeLabel.includes('How much time') ? 'Time Spent on Social Media' : cleanTimeLabel;
    variableKeys.push({
      label: displayLabel,
      key: timeColumn,
      isTime: true,
    });

    // Add ordinal variables
    ordinalVars.forEach(var_ => {
      variableKeys.push({
        label: var_.label,
        key: var_.key,
        isLikert: var_.isLikert,
      });
    });

    // Calculate correlation matrix with proper row alignment
    const matrix: number[][] = [];
    const labels: string[] = variableKeys.map(v => v.label);

    for (let i = 0; i < variableKeys.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < variableKeys.length; j++) {
        if (i === j) {
          row.push(1.0); // Perfect correlation with itself
        } else {
          // Extract values for both variables, aligned by row
          const valuesI: number[] = [];
          const valuesJ: number[] = [];
          
          data.forEach(dataRow => {
            let valI: number | null = null;
            let valJ: number | null = null;
            
            // Get value for variable i
            if (variableKeys[i].isTime) {
              valI = convertTimeToNumeric(dataRow[variableKeys[i].key] || '');
            } else if (variableKeys[i].isLikert) {
              valI = convertLikertToNumeric(dataRow[variableKeys[i].key] || '');
            } else {
              valI = parseNumeric(dataRow[variableKeys[i].key] || '');
            }
            
            // Get value for variable j
            if (variableKeys[j].isTime) {
              valJ = convertTimeToNumeric(dataRow[variableKeys[j].key] || '');
            } else if (variableKeys[j].isLikert) {
              valJ = convertLikertToNumeric(dataRow[variableKeys[j].key] || '');
            } else {
              valJ = parseNumeric(dataRow[variableKeys[j].key] || '');
            }
            
            // Only include if both have valid values
            if (valI !== null && valJ !== null) {
              valuesI.push(valI);
              valuesJ.push(valJ);
            }
          });
          
          const correlation = calculateCorrelation(valuesI, valuesJ);
          row.push(correlation !== null ? correlation : 0);
        }
      }
      matrix.push(row);
    }

    return { matrix, labels };
  }, [data]);

  useEffect(() => {
    if (!correlationMatrix) return;

    const { matrix, labels } = correlationMatrix;

    const trace = {
      z: matrix,
      x: labels,
      y: labels,
      type: 'heatmap' as const,
      colorscale: [
        [0, '#3b82f6'], // Blue for negative
        [0.5, '#18181b'], // Dark gray for zero
        [1, '#ef4444'], // Red for positive
      ],
      zmin: -1,
      zmax: 1,
      colorbar: {
        title: 'Correlation',
        titleside: 'right',
        tickmode: 'linear',
        tick0: -1,
        dtick: 0.5,
      },
      hovertemplate: 'Correlation: %{z:.3f}<br>%{x} vs %{y}<extra></extra>',
    };

    setPlotData([trace]);
  }, [correlationMatrix]);

  if (loading) {
    return (
      <section
        id="correlation-heatmap"
        className="relative bg-gradient-to-b from-black via-zinc-900 to-black py-16"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-zinc-400">Loading correlation heatmap...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="correlation-heatmap"
        className="relative bg-gradient-to-b from-black via-zinc-900 to-black py-16"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="correlation-heatmap"
      className="relative bg-gradient-to-b from-black via-zinc-900 to-black py-16"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg text-zinc-400">Correlation Analysis</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Explore relationships between variables. Values range from -1 (strong negative correlation) to +1 (strong positive correlation).
          </p>
        </div>

        {plotData ? (
          <div ref={plotContainerRef} className="bg-zinc-900/50 rounded-lg p-6 backdrop-blur-sm">
            <Plot
              data={plotData}
              layout={{
                font: { color: '#ffffff', size: 11 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                height: Math.max(800, correlationMatrix ? correlationMatrix.labels.length * 50 : 800),
                margin: { l: 200, r: 50, t: 50, b: 200 },
                xaxis: {
                  tickangle: -45,
                  side: 'bottom',
                },
                yaxis: {
                  autorange: 'reversed',
                },
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                responsive: true,
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px] bg-zinc-900/50 rounded-lg">
            <div className="text-lg text-zinc-400">Preparing correlation matrix...</div>
          </div>
        )}
      </div>
    </section>
  );
}

