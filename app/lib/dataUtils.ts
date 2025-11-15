import Papa from 'papaparse';

export interface SurveyRow {
  [key: string]: string;
}

export interface ProcessedData {
  x: number[];
  y: number[];
  z: number[];
  colors: string[];
  labels: string[];
}

// Convert time spent on social media to numeric value
export function convertTimeToNumeric(timeStr: string): number | null {
  if (!timeStr || timeStr.trim() === '') return null;
  
  const time = timeStr.trim();
  if (time.includes('Less than 1 hour')) return 0.5;
  if (time.includes('Between 1 and 3 hours')) return 2;
  if (time.includes('Between 3 and 5 hours')) return 4;
  if (time.includes('Between 5 and 7 hours')) return 6;
  if (time.includes('More than 7 hours')) return 8;
  
  return null;
}

// Convert Likert scale to numeric value
export function convertLikertToNumeric(likertStr: string): number | null {
  if (!likertStr || likertStr.trim() === '') return null;
  
  const likert = likertStr.trim();
  if (likert === 'Strongly Support') return 5;
  if (likert === 'Support') return 4;
  if (likert === 'Somewhat Support') return 3;
  if (likert === 'Neither Oppose nor Support') return 2.5;
  if (likert === 'Somewhat Oppose') return 2;
  if (likert === 'Oppose') return 1;
  if (likert === 'Strongly Oppose') return 0;
  if (likert === "Don't Know") return null; // NaN equivalent
  
  return null;
}

// Parse numeric value (for ranking columns that are already numeric)
export function parseNumeric(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value.trim());
  return isNaN(num) ? null : num;
}

// Get color for social media platform
export function getSocialMediaColor(platform: string): string {
  // Remove French translation if present
  const cleanPlatform = platform.split(' / ')[0].trim();
  
  const colors: { [key: string]: string } = {
    'Instagram': '#FF006E', // Bright pink/magenta
    'Tiktok': '#9D4EDD', // Purplish/violet
    'Facebook': '#00A8FF', // Bright blue
    'Pinterest': '#FF1744', // Bright red
    'Other': '#FFA500', // Bright orange
    'I do not use social media': '#E0E0E0', // Light gray
  };
  
  return colors[cleanPlatform] || '#FFD700'; // Bright gold/yellow for unknown
}

// Parse CSV file
export async function parseCSV(filePath: string): Promise<SurveyRow[]> {
  const response = await fetch(filePath);
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as SurveyRow[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// Get ordinal variable options (columns that can be used for Y/Z axes)
export function getOrdinalVariables(headers: string[]): Array<{ label: string; key: string; isLikert: boolean }> {
  const ordinalVars: Array<{ label: string; key: string; isLikert: boolean }> = [];
  
  headers.forEach((header, index) => {
    // Skip non-ordinal columns (first 11 columns are demographics and other non-ordinal data)
    if (index < 11) return;
    
    // Columns 12-19 are political engagement rankings (numeric 1-8)
    if (index >= 11 && index <= 18) {
      // Extract the method name from the header
      const match = header.match(/\[([^\]]+)\]/);
      let label = match ? match[1] : header.substring(0, 50);
      // Remove French translation
      label = label.split(' / ')[0].trim();
      ordinalVars.push({ label, key: header, isLikert: false });
    }
    
    // Columns 20-25 are political opinion Likert scales
    if (index >= 19 && index <= 24) {
      // Extract the topic name (before the slash) and remove French
      let label = header.split(' / ')[0] || header.substring(0, 50);
      label = label.trim();
      ordinalVars.push({ label, key: header, isLikert: true });
    }
  });
  
  return ordinalVars;
}

// Process data for plotting
export function processDataForPlot(
  data: SurveyRow[],
  timeColumn: string,
  yColumn: string,
  zColumn: string,
  socialMediaColumn: string,
  yIsLikert: boolean,
  zIsLikert: boolean
): ProcessedData {
  const x: number[] = [];
  const y: number[] = [];
  const z: number[] = [];
  const colors: string[] = [];
  const labels: string[] = [];
  
  data.forEach((row, index) => {
    // Get X value (time spent)
    const xVal = convertTimeToNumeric(row[timeColumn]);
    if (xVal === null) return;
    
    // Get Y value
    const yVal = yIsLikert 
      ? convertLikertToNumeric(row[yColumn])
      : parseNumeric(row[yColumn]);
    if (yVal === null) return;
    
    // Get Z value
    const zVal = zIsLikert
      ? convertLikertToNumeric(row[zColumn])
      : parseNumeric(row[zColumn]);
    if (zVal === null) return;
    
    // Get color (social media platform)
    const platform = row[socialMediaColumn] || 'Unknown';
    const color = getSocialMediaColor(platform);
    
    x.push(xVal);
    y.push(yVal);
    z.push(zVal);
    colors.push(color);
    labels.push(`Respondent ${index + 1}`);
  });
  
  return { x, y, z, colors, labels };
}

// Linear regression for 2D data (y = mx + b)
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } | null {
  if (x.length !== y.length || x.length < 2) return null;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R²
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  
  return { slope, intercept, r2 };
}

// Multiple linear regression for 3D data (z = a*x + b*y + c)
export function multipleLinearRegression(
  x: number[],
  y: number[],
  z: number[]
): { coeffX: number; coeffY: number; intercept: number; r2: number } | null {
  if (x.length !== y.length || y.length !== z.length || x.length < 3) return null;
  
  const n = x.length;
  
  // Calculate means
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  const meanZ = z.reduce((a, b) => a + b, 0) / n;
  
  // Calculate sums for normal equations
  let sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    const dz = z[i] - meanZ;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
    sxz += dx * dz;
    syz += dy * dz;
  }
  
  // Solve for coefficients using Cramer's rule
  const det = sxx * syy - sxy * sxy;
  if (Math.abs(det) < 1e-10) return null; // Singular matrix
  
  const coeffX = (sxz * syy - syz * sxy) / det;
  const coeffY = (sxx * syz - sxz * sxy) / det;
  const intercept = meanZ - coeffX * meanX - coeffY * meanY;
  
  // Calculate R²
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = coeffX * x[i] + coeffY * y[i] + intercept;
    ssRes += Math.pow(z[i] - predicted, 2);
    ssTot += Math.pow(z[i] - meanZ, 2);
  }
  const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  
  return { coeffX, coeffY, intercept, r2 };
}

// Get unique social media platforms from data
export function getSocialMediaPlatforms(data: SurveyRow[], socialMediaColumn: string): string[] {
  const platforms = new Set<string>();
  data.forEach(row => {
    const platform = row[socialMediaColumn];
    if (platform && platform.trim()) {
      // Remove French translation if present
      const cleanPlatform = platform.split(' / ')[0].trim();
      platforms.add(cleanPlatform);
    }
  });
  return Array.from(platforms).sort();
}

// Abbreviate long labels for display
export function abbreviateLabel(label: string, maxLength: number = 25): string {
  if (!label) return '';
  
  // Remove French translation if present
  const cleanLabel = label.split(' / ')[0].trim();
  
  // Common abbreviations
  const abbreviations: { [key: string]: string } = {
    'I do not use social media': 'No Social Media',
  };
  
  if (abbreviations[cleanLabel]) {
    return abbreviations[cleanLabel];
  }
  
  if (cleanLabel.length <= maxLength) {
    return cleanLabel;
  }
  
  return cleanLabel.substring(0, maxLength) + '...';
}

// Convert age string to age group
export function getAgeGroup(ageStr: string): string {
  if (!ageStr) return 'Unknown';
  const age = parseInt(ageStr);
  if (isNaN(age)) return ageStr; // Return original if not numeric
  
  if (age < 18) return 'Under 18';
  if (age < 22) return '18-21';
  if (age < 26) return '22-25';
  if (age < 30) return '26-29';
  if (age < 35) return '30-34';
  if (age < 40) return '35-39';
  return '40+';
}

// Calculate Pearson correlation coefficient between two arrays
export function calculateCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }
  
  const denominator = Math.sqrt(sumSqX * sumSqY);
  if (denominator === 0) return null;
  
  return numerator / denominator;
}

// Get optimal category order for a dimension
export function getCategoryOrder(values: string[], dimensionLabel: string): string[] {
  const uniqueValues = Array.from(new Set(values)).filter(v => v);
  
  // Time Spent: custom order
  if (dimensionLabel.toLowerCase().includes('time')) {
    const timeOrder = [
      'Less than 1 hour',
      'Between 1 and 3 hours',
      'Between 3 and 5 hours',
      'Between 5 and 7 hours',
      'More than 7 hours',
    ];
    const ordered: string[] = [];
    const unordered: string[] = [];
    
    timeOrder.forEach(time => {
      if (uniqueValues.some(v => v.includes(time))) {
        const match = uniqueValues.find(v => v.includes(time));
        if (match) ordered.push(match);
      }
    });
    
    uniqueValues.forEach(val => {
      if (!ordered.includes(val)) unordered.push(val);
    });
    
    return [...ordered, ...unordered];
  }
  
  // Political Alignment: logical order (but not Political Info Source)
  if ((dimensionLabel.toLowerCase().includes('political') && dimensionLabel.toLowerCase().includes('alignment')) || 
      dimensionLabel.toLowerCase().includes('alignment')) {
    const politicalOrder = [
      'Strongly Support',
      'Support',
      'Somewhat Support',
      'Neither Oppose nor Support',
      'Somewhat Oppose',
      'Oppose',
      'Strongly Oppose',
    ];
    const ordered: string[] = [];
    const unordered: string[] = [];
    
    politicalOrder.forEach(pol => {
      if (uniqueValues.some(v => v.includes(pol))) {
        const match = uniqueValues.find(v => v.includes(pol));
        if (match) ordered.push(match);
      }
    });
    
    uniqueValues.forEach(val => {
      if (!ordered.includes(val)) unordered.push(val);
    });
    
    return [...ordered, ...unordered];
  }
  
  // Age: numeric order
  if (dimensionLabel.toLowerCase().includes('age')) {
    return uniqueValues.sort((a, b) => {
      const ageA = parseInt(a);
      const ageB = parseInt(b);
      if (!isNaN(ageA) && !isNaN(ageB)) {
        return ageA - ageB;
      }
      return a.localeCompare(b);
    });
  }
  
  // Default: frequency-based (most common first)
  const counts: { [key: string]: number } = {};
  values.forEach(v => {
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  
  return uniqueValues.sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
}

