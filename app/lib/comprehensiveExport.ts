interface ComprehensiveExportOptions {
  title?: string;
  keyInsights?: Array<{ title: string; value: string | number; subtitle?: string; icon: string }>;
  parallelCategoriesImage?: string;
  heatmapImage?: string;
  plot3DImage?: string;
  filters?: Record<string, any>;
}

export function generateComprehensiveReportHTML(options: ComprehensiveExportOptions): string {
  const {
    title = 'Digital Culture Study - Comprehensive Report',
    keyInsights = [],
    parallelCategoriesImage,
    heatmapImage,
    plot3DImage,
    filters = {},
  } = options;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filterSummary = Object.entries(filters)
    .filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    })
    .map(([key, value]) => {
      let displayValue = '';
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      } else {
        displayValue = String(value);
      }
      return `<div class="filter-item"><strong>${formatKey(key)}:</strong> ${displayValue}</div>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #18181b;
      color: #e4e4e7;
      padding: 0;
      line-height: 1.3;
      font-size: 11px;
    }
    
    .report-container {
      width: 1400px;
      margin: 0 auto;
      background: #18181b;
      overflow: hidden;
    }
    
    .report-header {
      background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
      padding: 16px 24px;
      border-bottom: 1px solid #3f3f46;
    }
    
    .report-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 4px;
    }
    
    .report-subtitle {
      font-size: 12px;
      color: #a1a1aa;
      margin-top: 2px;
    }
    
    .report-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #3f3f46;
      font-size: 10px;
      color: #71717a;
    }
    
    .report-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px 24px 24px 24px;
    }
    
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #3f3f46;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
      padding: 12px 10px;
      border-radius: 6px;
      border: 1px solid #3f3f46;
      text-align: center;
    }
    
    .stat-icon {
      font-size: 20px;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 3px;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 10px;
      font-weight: 600;
      color: #a1a1aa;
      margin-bottom: 2px;
      line-height: 1.1;
    }
    
    .stat-subtitle {
      font-size: 9px;
      color: #71717a;
      line-height: 1.1;
    }
    
    .filters-container {
      background: #27272a;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #3f3f46;
    }
    
    .filter-item {
      padding: 3px 0;
      font-size: 10px;
      color: #e4e4e7;
      border-bottom: 1px solid #3f3f46;
    }
    
    .filter-item:last-child {
      border-bottom: none;
    }
    
    .filter-item strong {
      color: #ffffff;
      margin-right: 4px;
    }
    
    .visualization-container {
      background: #27272a;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #3f3f46;
      text-align: center;
    }
    
    .visualization-title {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 8px;
      text-align: left;
    }
    
    .visualization-image {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      display: block;
      margin: 0 auto;
    }
    
    .visualization-placeholder {
      padding: 30px 10px;
      color: #71717a;
      font-size: 11px;
    }
    
    .visualizations-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <div class="report-title">${title}</div>
      <div class="report-subtitle">Digital Culture Study - Comprehensive Data Analysis Report</div>
      <div class="report-meta">
        <span>Generated: ${currentDate}</span>
        <span>Report Type: Comprehensive Analysis</span>
      </div>
    </div>
    
    <div class="report-content">
      <div class="left-column">
        ${keyInsights.length > 0 ? `
        <div>
          <div class="section-title">Key Insights</div>
          <div class="stats-grid">
            ${keyInsights.map(stat => `
              <div class="stat-card">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-value">${formatValue(stat.value)}</div>
                <div class="stat-label">${stat.title}</div>
                ${stat.subtitle ? `<div class="stat-subtitle">${stat.subtitle}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        ${heatmapImage ? `
        <div class="visualization-container">
          <div class="visualization-title">Correlation Heatmap</div>
          <img src="${heatmapImage}" alt="Correlation Heatmap" class="visualization-image" />
        </div>
        ` : ''}
      </div>
      
      <div class="right-column">
        ${parallelCategoriesImage ? `
        <div class="visualization-container">
          <div class="visualization-title">Parallel Categories Visualization</div>
          <img src="${parallelCategoriesImage}" alt="Parallel Categories Plot" class="visualization-image" />
        </div>
        ` : ''}
        
        ${plot3DImage ? `
        <div class="visualization-container">
          <div class="visualization-title">3D Scatter Plot Visualization</div>
          <img src="${plot3DImage}" alt="3D Scatter Plot" class="visualization-image" />
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

export async function exportComprehensivePDF(options: ComprehensiveExportOptions): Promise<void> {
  const html = generateComprehensiveReportHTML(options);
  
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1400px'; // Fixed width for consistent rendering
  container.innerHTML = html;
  document.body.appendChild(container);
  
  try {
    // Wait for images to load
    const images = container.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
            }
          })
      )
    );
    
    // Small delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    // Capture the report container
    const reportContainer = container.querySelector('.report-container') as HTMLElement;
    if (!reportContainer) {
      throw new Error('Report container not found');
    }
    
    const canvas = await html2canvas(reportContainer, {
      backgroundColor: '#18181b',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `digital-culture-report-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

