interface ExportOptions {
  title?: string;
  filters?: Record<string, any>;
  visualizationType?: 'parallel-categories' | '3d-plot';
  stats?: Record<string, any>;
}

export function generateReportHTML(options: ExportOptions): string {
  const {
    title = 'Digital Culture Study Report',
    filters = {},
    visualizationType,
    stats = {},
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
        if (Array.isArray(value)) return value.length > 0;
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
      background: linear-gradient(to bottom, #000000, #18181b, #000000);
      color: #e4e4e7;
      padding: 40px 20px;
      line-height: 1.6;
    }
    
    .report-container {
      max-width: 1200px;
      margin: 0 auto;
      background: #18181b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .report-header {
      background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
      padding: 40px;
      border-bottom: 2px solid #3f3f46;
    }
    
    .report-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    
    .report-subtitle {
      font-size: 14px;
      color: #a1a1aa;
      margin-top: 8px;
    }
    
    .report-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #3f3f46;
      font-size: 12px;
      color: #71717a;
    }
    
    .report-section {
      padding: 30px 40px;
      border-bottom: 1px solid #3f3f46;
    }
    
    .report-section:last-child {
      border-bottom: none;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3f3f46;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #3f3f46;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .filters-container {
      background: #27272a;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #3f3f46;
    }
    
    .filter-item {
      padding: 8px 0;
      font-size: 14px;
      color: #e4e4e7;
      border-bottom: 1px solid #3f3f46;
    }
    
    .filter-item:last-child {
      border-bottom: none;
    }
    
    .filter-item strong {
      color: #ffffff;
      margin-right: 8px;
    }
    
    .visualization-container {
      background: #27272a;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #3f3f46;
      margin-top: 20px;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #71717a;
    }
    
    .visualization-placeholder {
      text-align: center;
      font-size: 14px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .report-container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .report-header {
        background: #18181b !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .stat-card {
        background: #27272a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
      }
      
      .filters-container {
        background: #27272a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
      }
      
      .visualization-container {
        background: #27272a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <div class="report-title">${title}</div>
      <div class="report-subtitle">Digital Culture Study - Data Analysis Report</div>
      <div class="report-meta">
        <span>Generated: ${currentDate}</span>
        <span>Report Type: ${visualizationType || 'General'}</span>
      </div>
    </div>
    
    ${filterSummary ? `
    <div class="report-section">
      <div class="section-title">Applied Filters</div>
      <div class="filters-container">
        ${filterSummary}
      </div>
    </div>
    ` : ''}
    
    ${Object.keys(stats).length > 0 ? `
    <div class="report-section">
      <div class="section-title">Statistical Summary</div>
      <div class="stats-grid">
        ${Object.entries(stats).map(([key, value]) => `
          <div class="stat-card">
            <div class="stat-value">${formatValue(value)}</div>
            <div class="stat-label">${formatKey(key)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="report-section">
      <div class="section-title">Visualization</div>
      <div class="visualization-container">
        <div class="visualization-placeholder">
          ${visualizationType === 'parallel-categories' 
            ? 'Parallel Categories visualization would appear here. Please use the browser print function to capture the visualization from the main page.' 
            : visualizationType === '3d-plot'
            ? '3D Scatter Plot visualization would appear here. Please use the browser print function to capture the visualization from the main page.'
            : 'Visualization data'}
        </div>
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

export function exportToPDF(options: ExportOptions): void {
  const html = generateReportHTML(options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        URL.revokeObjectURL(url);
      }, 250);
    };
  }
}

export function exportToHTML(options: ExportOptions): void {
  const html = generateReportHTML(options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

