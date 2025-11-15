'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  parseCSV,
  getOrdinalVariables,
  convertTimeToNumeric,
  convertLikertToNumeric,
  parseNumeric,
  getSocialMediaColor,
  getSocialMediaPlatforms,
  linearRegression,
  multipleLinearRegression,
  SurveyRow,
} from '../lib/dataUtils';
import SavedViewsManager from './SavedViewsManager';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot3D() {
  const [data, setData] = useState<SurveyRow[]>([]);
  const [ordinalVars, setOrdinalVars] = useState<Array<{ label: string; key: string; isLikert: boolean }>>([]);
  const [selectedY, setSelectedY] = useState<string>('');
  const [selectedZ, setSelectedZ] = useState<string>('');
  const [plotData, setPlotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrendline, setShowTrendline] = useState(false);
  const [trendlinePlatforms, setTrendlinePlatforms] = useState<string[]>([]);
  const [socialMediaPlatforms, setSocialMediaPlatforms] = useState<string[]>([]);
  const [trendlineStats, setTrendlineStats] = useState<{
    equation: string;
    r2: number;
    is2D: boolean;
    platforms: string;
  } | null>(null);
  const plotContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const csvData = await parseCSV('/digcul-study.csv');
        setData(csvData);
        
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const vars = getOrdinalVariables(headers);
          setOrdinalVars(vars);
          
          // Get social media platforms
          const socialMediaColumn = headers[4];
          const platforms = getSocialMediaPlatforms(csvData, socialMediaColumn);
          setSocialMediaPlatforms(platforms);
          // Set default trendline platforms to all
          setTrendlinePlatforms(platforms);
          
          // Set default selections
          if (vars.length >= 2) {
            setSelectedY(vars[0].key);
            setSelectedZ(vars[1].key);
          } else if (vars.length >= 1) {
            setSelectedY(vars[0].key);
            setSelectedZ('None'); // 2D plot
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  useEffect(() => {
    if (!data.length || !selectedY) return;
    
    const headers = Object.keys(data[0]);
    const timeColumn = headers[5]; // "How much time do you spend on social media per day on average?"
    const socialMediaColumn = headers[4]; // "What social media do you spend the most time on?"
    
    const yVar = ordinalVars.find(v => v.key === selectedY);
    if (!yVar) return;
    
    const is2D = !selectedZ || selectedZ === 'None';
    
    if (is2D) {
      // For 2D plot, process only X and Y data
      const x: number[] = [];
      const y: number[] = [];
      const colors: string[] = [];
      const labels: string[] = [];
      const platforms: string[] = [];
      
      data.forEach((row, index) => {
        // Get X value (time spent)
        const xVal = convertTimeToNumeric(row[timeColumn]);
        if (xVal === null) return;
        
        // Get Y value
        const yVal = yVar.isLikert 
          ? convertLikertToNumeric(row[selectedY])
          : parseNumeric(row[selectedY]);
        if (yVal === null) return;
        
        // Get color (social media platform)
        const platformRaw = row[socialMediaColumn] || 'Unknown';
        const platform = platformRaw.split(' / ')[0].trim(); // Remove French translation
        const color = getSocialMediaColor(platform);
        
        x.push(xVal);
        y.push(yVal);
        colors.push(color);
        labels.push(`Respondent ${index + 1}`);
        platforms.push(platform);
      });
      
      // Create 2D scatter plot trace
      const trace = {
        x: x,
        y: y,
        mode: 'markers' as const,
        type: 'scatter' as const,
        marker: {
          size: 10,
          color: colors,
          opacity: 0.7,
          line: {
            width: 1,
            color: 'rgba(255,255,255,0.3)',
          },
        },
        text: labels,
        hovertemplate: '<b>%{text}</b><br>' +
          'Social Media Time: %{x} hours/day<br>' +
          'Y: %{y}<extra></extra>',
      };
      
      const traces: any[] = [trace];
      
      // Add trendline if enabled
      if (showTrendline && trendlinePlatforms.length > 0) {
        // Filter data by selected platforms
        const filteredIndices: number[] = [];
        for (let i = 0; i < x.length; i++) {
          if (trendlinePlatforms.includes(platforms[i])) {
            filteredIndices.push(i);
          }
        }
        
        if (filteredIndices.length >= 2) {
          const filteredX = filteredIndices.map(i => x[i]);
          const filteredY = filteredIndices.map(i => y[i]);
          
          const regression = linearRegression(filteredX, filteredY);
          if (regression) {
            const minX = Math.min(...filteredX);
            const maxX = Math.max(...filteredX);
            const trendlineX = [minX, maxX];
            const trendlineY = trendlineX.map(xVal => regression.slope * xVal + regression.intercept);
            
            // Determine trendline color and name
            const platformNames = trendlinePlatforms.length === socialMediaPlatforms.length 
              ? 'All Platforms' 
              : trendlinePlatforms.join(', ');
            const trendlineColor = trendlinePlatforms.length === socialMediaPlatforms.length 
              ? '#FFFF00' 
              : trendlinePlatforms.length === 1 
                ? getSocialMediaColor(trendlinePlatforms[0])
                : '#FFFF00'; // Yellow for multiple selected
            
            // Store trendline statistics
            setTrendlineStats({
              equation: `y = ${regression.slope.toFixed(3)}x + ${regression.intercept.toFixed(3)}`,
              r2: regression.r2,
              is2D: true,
              platforms: platformNames,
            });
            
            traces.push({
              x: trendlineX,
              y: trendlineY,
              mode: 'lines' as const,
              type: 'scatter' as const,
              name: `Trendline (${platformNames}) (R² = ${regression.r2.toFixed(3)})`,
              line: {
                color: trendlineColor,
                width: 4,
                dash: 'dash',
              },
              hovertemplate: `Trendline: y = ${regression.slope.toFixed(3)}x + ${regression.intercept.toFixed(3)}<br>R² = ${regression.r2.toFixed(3)}<br>Platforms: ${platformNames}<extra></extra>`,
            });
          } else {
            setTrendlineStats(null);
          }
        } else {
          setTrendlineStats(null);
        }
      } else {
        setTrendlineStats(null);
      }
      
      setPlotData(traces);
    } else {
      // 3D plot
      const zVar = ordinalVars.find(v => v.key === selectedZ);
      if (!zVar) return;
      
      // Process data and track platforms
      const x: number[] = [];
      const y: number[] = [];
      const z: number[] = [];
      const colors: string[] = [];
      const labels: string[] = [];
      const platforms: string[] = [];
      
      data.forEach((row, index) => {
        const xVal = convertTimeToNumeric(row[timeColumn]);
        if (xVal === null) return;
        
        const yVal = yVar.isLikert 
          ? convertLikertToNumeric(row[selectedY])
          : parseNumeric(row[selectedY]);
        if (yVal === null) return;
        
        const zVal = zVar.isLikert
          ? convertLikertToNumeric(row[selectedZ])
          : parseNumeric(row[selectedZ]);
        if (zVal === null) return;
        
        const platformRaw = row[socialMediaColumn] || 'Unknown';
        const platform = platformRaw.split(' / ')[0].trim(); // Remove French translation
        const color = getSocialMediaColor(platform);
        
        x.push(xVal);
        y.push(yVal);
        z.push(zVal);
        colors.push(color);
        labels.push(`Respondent ${index + 1}`);
        platforms.push(platform);
      });
      
      // Create 3D scatter plot trace
      const trace = {
        x: x,
        y: y,
        z: z,
        mode: 'markers' as const,
        type: 'scatter3d' as const,
        marker: {
          size: 8,
          color: colors,
          opacity: 0.7,
          line: {
            width: 1,
            color: 'rgba(0,0,0,0.3)',
          },
        },
        text: labels,
        hovertemplate: '<b>%{text}</b><br>' +
          'Social Media Time: %{x} hours/day<br>' +
          'Y: %{y}<br>' +
          'Z: %{z}<extra></extra>',
      };
      
      const traces: any[] = [trace];
      
      // Add trendline if enabled
      if (showTrendline && trendlinePlatforms.length > 0) {
        // Filter data by selected platforms
        const filteredIndices: number[] = [];
        for (let i = 0; i < x.length; i++) {
          if (trendlinePlatforms.includes(platforms[i])) {
            filteredIndices.push(i);
          }
        }
        
        if (filteredIndices.length >= 3) {
          const filteredX = filteredIndices.map(i => x[i]);
          const filteredY = filteredIndices.map(i => y[i]);
          const filteredZ = filteredIndices.map(i => z[i]);
          
          const regression = multipleLinearRegression(filteredX, filteredY, filteredZ);
          if (regression) {
            // Create a grid for the regression plane surface
            const xRange = [Math.min(...filteredX), Math.max(...filteredX)];
            const yRange = [Math.min(...filteredY), Math.max(...filteredY)];
            const gridSize = 20;
            const planeX: number[][] = [];
            const planeY: number[][] = [];
            const planeZ: number[][] = [];
            
            for (let i = 0; i <= gridSize; i++) {
              planeX[i] = [];
              planeY[i] = [];
              planeZ[i] = [];
              for (let j = 0; j <= gridSize; j++) {
                const xVal = xRange[0] + (xRange[1] - xRange[0]) * (i / gridSize);
                const yVal = yRange[0] + (yRange[1] - yRange[0]) * (j / gridSize);
                const zVal = regression.coeffX * xVal + regression.coeffY * yVal + regression.intercept;
                planeX[i][j] = xVal;
                planeY[i][j] = yVal;
                planeZ[i][j] = zVal;
              }
            }
            
            // Determine trendline color and name
            const platformNames = trendlinePlatforms.length === socialMediaPlatforms.length 
              ? 'All Platforms' 
              : trendlinePlatforms.join(', ');
            const trendlineColor = trendlinePlatforms.length === socialMediaPlatforms.length 
              ? '#FFFF00' 
              : trendlinePlatforms.length === 1 
                ? getSocialMediaColor(trendlinePlatforms[0])
                : '#FFFF00'; // Yellow for multiple selected
            
            // Store trendline statistics
            setTrendlineStats({
              equation: `z = ${regression.coeffX.toFixed(3)}x + ${regression.coeffY.toFixed(3)}y + ${regression.intercept.toFixed(3)}`,
              r2: regression.r2,
              is2D: false,
              platforms: platformNames,
            });
            
            traces.push({
              x: planeX,
              y: planeY,
              z: planeZ,
              type: 'surface' as const,
              name: `Trendline (${platformNames}) (R² = ${regression.r2.toFixed(3)})`,
              opacity: 0.6, // Increased from 0.4 for better visibility
              colorscale: [[0, trendlineColor], [1, trendlineColor]],
              showscale: false,
              hovertemplate: `Trendline: z = ${regression.coeffX.toFixed(3)}x + ${regression.coeffY.toFixed(3)}y + ${regression.intercept.toFixed(3)}<br>R² = ${regression.r2.toFixed(3)}<br>Platforms: ${platformNames}<extra></extra>`,
            });
          } else {
            setTrendlineStats(null);
          }
        } else {
          setTrendlineStats(null);
        }
      } else {
        setTrendlineStats(null);
      }
      
      setPlotData(traces);
    }
  }, [data, selectedY, selectedZ, ordinalVars, showTrendline, trendlinePlatforms, socialMediaPlatforms]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const yVar = ordinalVars.find(v => v.key === selectedY);
  const zVar = ordinalVars.find(v => v.key === selectedZ);
  const is2D = !selectedZ || selectedZ === 'None';

  const getCurrentState = (): Record<string, any> => {
    return {
      selectedY,
      selectedZ,
      showTrendline,
      trendlinePlatforms,
    };
  };

  const handleLoadView = (state: Record<string, any>) => {
    if (state.selectedY) setSelectedY(state.selectedY);
    if (state.selectedZ !== undefined) setSelectedZ(state.selectedZ);
    if (state.showTrendline !== undefined) setShowTrendline(state.showTrendline);
    if (state.trendlinePlatforms) setTrendlinePlatforms(state.trendlinePlatforms);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-900 to-black pt-16">
      {/* Left Sidebar */}
      <div className="w-80 bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-white">
          Variable Selection
        </h2>
        
        <div className="space-y-6">
          {/* Y-axis selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">
              Y-Axis Variable
            </label>
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Y-axis variable...</option>
              {ordinalVars.map((var_) => (
                <option key={var_.key} value={var_.key}>
                  {var_.label}
                </option>
              ))}
            </select>
          </div>

          {/* Z-axis selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">
              Z-Axis Variable
            </label>
            <select
              value={selectedZ}
              onChange={(e) => setSelectedZ(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Z-axis variable...</option>
              <option value="None">None (2D Plot)</option>
              {ordinalVars.map((var_) => (
                <option key={var_.key} value={var_.key}>
                  {var_.label}
                </option>
              ))}
            </select>
          </div>

          {/* Trendline Controls */}
          <div className="mt-8 pt-6 border-t border-zinc-700">
            <h3 className="text-sm font-semibold mb-3 text-white">
              Trendline Options
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowTrendline(!showTrendline)}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  showTrendline
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {showTrendline ? 'Hide Trendline' : 'Show Trendline'}
              </button>
              
              {showTrendline && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Select Platforms for Trendline
                    </label>
                    <button
                      onClick={() => {
                        if (trendlinePlatforms.length === socialMediaPlatforms.length) {
                          setTrendlinePlatforms([]);
                        } else {
                          setTrendlinePlatforms([...socialMediaPlatforms]);
                        }
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {trendlinePlatforms.length === socialMediaPlatforms.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-700 rounded-md p-2 bg-zinc-800">
                    {socialMediaPlatforms.map((platform) => (
                      <label
                        key={platform}
                        className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={trendlinePlatforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTrendlinePlatforms([...trendlinePlatforms, platform]);
                            } else {
                              setTrendlinePlatforms(trendlinePlatforms.filter(p => p !== platform));
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: getSocialMediaColor(platform) }}
                          ></div>
                          <span className="text-sm text-zinc-300">{platform}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {trendlinePlatforms.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-2">Please select at least one platform</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Saved Views */}
          <div className="mt-8 pt-6 border-t border-zinc-700">
            <SavedViewsManager
              type="3d-plot"
              currentState={getCurrentState()}
              onLoadView={handleLoadView}
            />
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-zinc-700">
            <h3 className="text-sm font-semibold mb-3 text-white">
              Color Legend (Social Media Platform)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF006E' }}></div>
                <span className="text-zinc-300">Instagram</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9D4EDD' }}></div>
                <span className="text-zinc-300">TikTok</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00A8FF' }}></div>
                <span className="text-zinc-300">Facebook</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF1744' }}></div>
                <span className="text-zinc-300">Pinterest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFA500' }}></div>
                <span className="text-zinc-300">Other</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E0E0E0' }}></div>
                <span className="text-zinc-300">No Social Media</span>
              </div>
            </div>
          </div>

          {/* Likert Scale Explanation */}
        </div>
      </div>

      {/* Main Plot Area */}
      <div className="flex-1 p-6 flex flex-col">
        {plotData ? (
          <div ref={plotContainerRef} className="flex-1">
            <Plot
              data={plotData}
              layout={is2D ? {
                title: {
                  text: '2D Social Media Use Visualization',
                  font: { size: 20, color: '#ffffff' },
                },
                xaxis: {
                  title: {
                    text: 'Social Media Use (hours/day)',
                    font: { size: 16, color: '#ffffff' },
                    standoff: 10,
                  },
                  titlefont: { size: 16, color: '#ffffff' },
                  gridcolor: '#333333',
                  color: '#ffffff',
                  showticklabels: true,
                },
                yaxis: {
                  title: {
                    text: yVar?.label || 'Y-Axis',
                    font: { size: 16, color: '#ffffff' },
                    standoff: 10,
                  },
                  titlefont: { size: 16, color: '#ffffff' },
                  gridcolor: '#333333',
                  color: '#ffffff',
                  showticklabels: true,
                },
                margin: { l: 100, r: 100, t: 80, b: 100 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#ffffff' },
                showlegend: false,
              } : {
              title: {
                text: '3D Social Media Use Visualization',
                font: { size: 20, color: '#ffffff' },
              },
              scene: {
                xaxis: {
                  title: {
                    text: 'Social Media Use (hours/day)',
                    font: { size: 16, color: '#ffffff' },
                  },
                  titlefont: { size: 16, color: '#ffffff' },
                  gridcolor: '#333333',
                  color: '#ffffff',
                  showticklabels: true,
                },
                yaxis: {
                  title: {
                    text: yVar?.label || 'Y-Axis',
                    font: { size: 16, color: '#ffffff' },
                  },
                  titlefont: { size: 16, color: '#ffffff' },
                  gridcolor: '#333333',
                  color: '#ffffff',
                  showticklabels: true,
                },
                zaxis: {
                  title: {
                    text: zVar?.label || 'Z-Axis',
                    font: { size: 16, color: '#ffffff' },
                  },
                  titlefont: { size: 16, color: '#ffffff' },
                  gridcolor: '#333333',
                  color: '#ffffff',
                  showticklabels: true,
                },
                bgcolor: 'rgba(0,0,0,0)',
                camera: {
                  eye: { x: 1.5, y: 1.5, z: 1.5 },
                },
              },
              margin: { l: 0, r: 0, t: 50, b: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#ffffff' },
              showlegend: false,
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
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-zinc-400">
              Loading plot data...
            </div>
          </div>
        )}
        
        {/* Trendline Statistics - Below Plot */}
        {trendlineStats && trendlinePlatforms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Platforms:</span>
                <span className="text-zinc-200 font-medium">{trendlineStats.platforms}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Equation:</span>
                <span className="text-zinc-200 font-mono">{trendlineStats.equation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">R²:</span>
                <span className="text-zinc-200 font-medium">{trendlineStats.r2.toFixed(4)}</span>
                <span className="text-zinc-500">
                  ({trendlineStats.r2 >= 0.7 ? 'Strong' : trendlineStats.r2 >= 0.4 ? 'Moderate' : 'Weak'} fit)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

