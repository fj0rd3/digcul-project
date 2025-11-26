'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, SurveyRow } from '../lib/dataUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface AccountData {
  account: string;
  count: number;
  percentage: number;
  isIndividual: boolean;
}

export default function TrustedAccountsChart() {
  const [plotData, setPlotData] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const accountCol = headers[10]; // Trusted accounts column
          
          // Count trusted accounts
          const accountCounts: { [key: string]: number } = {};
          let totalResponses = 0;
          
          // Define which accounts are "individuals" vs "traditional media"
          const individuals = ['hugo décrypte', 'hugodecrypte', 'hugo decrypte'];
          const traditionalMedia = ['le monde', 'bbc', 'guardian', 'nyt', 'cnn', 'mediapart', 'brut', 'france info'];
          
          csvData.forEach((row: SurveyRow) => {
            const accounts = row[accountCol];
            if (!accounts || accounts.trim() === '' || accounts.toLowerCase() === 'non' || accounts.toLowerCase() === 'no') return;
            
            totalResponses++;
            
            // Normalize account names
            const accountLower = accounts.toLowerCase();
            
            // Check for Hugo Décrypte
            if (individuals.some(ind => accountLower.includes(ind))) {
              accountCounts['Hugo Décrypte'] = (accountCounts['Hugo Décrypte'] || 0) + 1;
            }
            
            // Check for Le Monde
            if (accountLower.includes('monde')) {
              accountCounts['Le Monde'] = (accountCounts['Le Monde'] || 0) + 1;
            }
            
            // Check for BBC
            if (accountLower.includes('bbc')) {
              accountCounts['BBC'] = (accountCounts['BBC'] || 0) + 1;
            }
            
            // Check for Brut
            if (accountLower.includes('brut') && !accountLower.includes('breton')) {
              accountCounts['Brut'] = (accountCounts['Brut'] || 0) + 1;
            }
            
            // Check for Mediapart
            if (accountLower.includes('mediapart')) {
              accountCounts['Mediapart'] = (accountCounts['Mediapart'] || 0) + 1;
            }
            
            // Check for Guardian
            if (accountLower.includes('guardian')) {
              accountCounts['The Guardian'] = (accountCounts['The Guardian'] || 0) + 1;
            }
            
            // Check for other newspapers
            if (accountLower.includes('quotidien')) {
              accountCounts['Quotidien'] = (accountCounts['Quotidien'] || 0) + 1;
            }
            
            // Check for France Info
            if (accountLower.includes('france info')) {
              accountCounts['France Info'] = (accountCounts['France Info'] || 0) + 1;
            }
          });
          
          // Convert to array and calculate percentages
          const accountData: AccountData[] = Object.entries(accountCounts)
            .map(([account, count]) => ({
              account,
              count,
              percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
              isIndividual: account === 'Hugo Décrypte',
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Top 8 accounts
          
          setPlotData(accountData);
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

  const trace = {
    y: plotData.map(d => d.account).reverse(),
    x: plotData.map(d => d.percentage).reverse(),
    type: 'bar' as const,
    orientation: 'h' as const,
    marker: {
      color: plotData.map(d => d.isIndividual ? '#F97316' : '#3B82F6').reverse(),
      opacity: 0.85,
    },
    text: plotData.map(d => `${d.percentage.toFixed(0)}%`).reverse(),
    textposition: 'outside' as const,
    hovertemplate: '<b>%{y}</b><br>%{x:.1f}% trust this source<extra></extra>',
  };

  return (
    <div className="w-full">
      <Plot
        data={[trace]}
        layout={{
          xaxis: {
            title: {
              text: '% of Respondents',
              font: { size: 10, color: '#a1a1aa' },
            },
            gridcolor: '#27272a',
            color: '#a1a1aa',
            range: [0, Math.max(...plotData.map(d => d.percentage)) * 1.3],
          },
          yaxis: {
            gridcolor: '#27272a',
            color: '#a1a1aa',
            tickfont: { size: 10 },
          },
          margin: { l: 100, r: 50, t: 10, b: 40 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#a1a1aa', size: 9 },
          showlegend: false,
          annotations: [
            {
              x: Math.max(...plotData.map(d => d.percentage)) * 0.95,
              y: plotData.length - 0.5,
              text: '<span style="color:#F97316">●</span> Individual',
              showarrow: false,
              font: { size: 9, color: '#71717a' },
              xanchor: 'right',
            },
            {
              x: Math.max(...plotData.map(d => d.percentage)) * 0.95,
              y: plotData.length - 1.3,
              text: '<span style="color:#3B82F6">●</span> Media Outlet',
              showarrow: false,
              font: { size: 9, color: '#71717a' },
              xanchor: 'right',
            },
          ],
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

