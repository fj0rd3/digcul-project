'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { parseCSV, SurveyRow, abbreviateLabel, getCategoryOrder, getAgeGroup, getSocialMediaColor, getSocialMediaPlatforms } from '../lib/dataUtils';
import { exportToPDF } from '../lib/exportUtils';
import SavedViewsManager from './SavedViewsManager';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIsMobile } from '../hooks/useIsMobile';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Helper function to remove French translations from labels
function removeFrenchlabel(label: string): string {
  if (!label) return label;
  // Split on " / " and take only the first part (English)
  const parts = label.split(' / ');
  return parts[0].trim();
}

// Helper function to shorten time spent labels
function shortenTimeLabel(label: string): string {
  if (!label) return label;
  
  // Match patterns like "Less than 1 hour", "Between X and Y hours", "More than X hours"
  if (label.includes('Less than 1')) {
    return '0-1 hours/day';
  } else if (label.includes('Between 1 and 3')) {
    return '1-3 hours/day';
  } else if (label.includes('Between 3 and 5')) {
    return '3-5 hours/day';
  } else if (label.includes('Between 5 and 7')) {
    return '5-7 hours/day';
  } else if (label.includes('More than 7')) {
    return '7+ hours/day';
  }
  
  return label;
}

// Helper function to categorize emotional responses
function categorizeEmotion(emotion: string): string {
  if (!emotion) return emotion;
  
  const lower = emotion.toLowerCase();
  
  // Positive emotions
  if (lower.includes('happy') || lower.includes('heureux') || 
      lower.includes('informed') || lower.includes('included') || 
      lower.includes('motivated') || lower.includes('hopeful')) {
    return 'Good';
  }
  
  // Negative emotions
  if (lower.includes('sad') || lower.includes('triste') || 
      lower.includes('angry') || lower.includes('colère') || 
      lower.includes('anxious') || lower.includes('defeated') || 
      lower.includes('uncomfortable') || lower.includes('upsetting')) {
    return 'Bad';
  }
  
  // Neutral emotions
  if (lower.includes('indifferent') || lower.includes('indifférent') || 
      lower.includes('depends')) {
    return 'Neutral';
  }
  
  // If it's a complex response or unrecognized, return "Mixed"
  return 'Mixed';
}

interface Dimension {
  key: string;
  label: string;
  columnIndex: number;
}

interface FilterState {
  socialMedia: string[];
  ageRange: [number, number];
  gender: string[];
  socialSciences: string | null;
}

interface HoverTooltipData {
  x: number;
  y: number;
  dimension: string;
  category: string;
  total: number;
  breakdown: { label: string; pct: number; count: number; color: string }[];
}

function SortableDimensionItem({ id, label, isSelected, onToggle, isSortable }: { id: string; label: string; isSelected: boolean; onToggle: () => void; isSortable: boolean }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ 
    id, 
    disabled: !isSortable 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={isSortable ? setNodeRef : undefined}
      style={style}
      className={`flex items-center gap-2 p-2 rounded bg-zinc-800/50 border ${isSelected ? 'border-zinc-500' : 'border-zinc-700'} ${isSortable ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div 
        className="flex-shrink-0 checkbox-container"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="cursor-pointer"
        />
      </div>
      <span 
        className="text-sm text-zinc-300 flex-1 select-none cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {label}
      </span>
      {isSortable && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="w-5 h-5 text-zinc-500 flex-shrink-0 cursor-grab active:cursor-grabbing flex items-center justify-center rounded hover:bg-zinc-700/40"
          aria-label={`Reorder ${label}`}
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function ParallelCategories() {
  const [data, setData] = useState<SurveyRow[]>([]);
  const [plotData, setPlotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Define all available dimensions
  const availableDimensions: Dimension[] = useMemo(() => [
    { key: 'age', label: 'Age Group', columnIndex: 1 },
    { key: 'gender', label: 'Gender', columnIndex: 2 },
    { key: 'socialSciences', label: 'Studies Social Sciences', columnIndex: 3 },
    { key: 'timeSpent', label: 'Time Spent on Social Media', columnIndex: 5 },
    { key: 'emotionalResponseCompact', label: 'Emotional Response Compact', columnIndex: 7 },
    { key: 'emotionalResponseComprehensive', label: 'Emotional Response Comprehensive', columnIndex: 7 },
    { key: 'politicalAlignment', label: 'Content Aligned with Own Opinions', columnIndex: 8 },
    { key: 'politicalInfoSource', label: 'Political Info Source', columnIndex: 9 },
  ], []);
  
  // Dimension management - start with default selections
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    'gender', 'socialSciences', 'politicalAlignment', 'timeSpent'
  ]);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    socialMedia: [],
    ageRange: [0, 100],
    gender: [],
    socialSciences: null,
  });
  
  // Color by variable
  const [colorBy, setColorBy] = useState<string>('socialMedia');
  
  // Content type filter
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  
  // Legend data and breakdown information
  const [legendData, setLegendData] = useState<{ label: string; colorMap: { [key: string]: string } }>({ label: '', colorMap: {} });
  const [breakdownData, setBreakdownData] = useState<{ [key: string]: { [colorCat: string]: number } }>({});
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltipData | null>(null);
  const plotContainerRef = useRef<HTMLDivElement | null>(null);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dimensionDefinitions = useMemo(() => {
    return selectedDimensions
      .map(key => availableDimensions.find(d => d.key === key))
      .filter((d): d is Dimension => d !== undefined);
  }, [selectedDimensions, availableDimensions]);

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

  // Initialize filters with all available values
  useEffect(() => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const socialMediaCol = headers[4];
    const platforms = getSocialMediaPlatforms(data, socialMediaCol);
    
    setFilters(prev => {
      // Only update if socialMedia filter is empty
      if (prev.socialMedia.length === 0) {
        return {
          ...prev,
          socialMedia: platforms,
        };
      }
      return prev;
    });
  }, [data]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    const headers = Object.keys(data[0]);
    const ageCol = headers[1];
    const genderCol = headers[2];
    const socialSciencesCol = headers[3];
    const socialMediaCol = headers[4];
    const contentCol = headers[6];
    
    return data.filter(row => {
      // Social media filter
      if (filters.socialMedia.length > 0) {
        const platform = row[socialMediaCol];
        const cleanPlatform = platform ? removeFrenchlabel(platform.trim()) : '';
        if (!cleanPlatform || !filters.socialMedia.includes(cleanPlatform)) {
          return false;
        }
      }
      
      // Age filter
      const ageStr = row[ageCol];
      if (ageStr) {
        const age = parseInt(ageStr);
        if (!isNaN(age)) {
          if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
            return false;
          }
        }
      }
      
      // Gender filter
      if (filters.gender.length > 0) {
        const gender = row[genderCol];
        const cleanGender = gender ? removeFrenchlabel(gender.trim()) : '';
        if (!cleanGender || !filters.gender.includes(cleanGender)) {
          return false;
        }
      }
      
      // Social sciences filter
      if (filters.socialSciences !== null) {
        const socialSci = row[socialSciencesCol];
        const cleanSocialSci = socialSci ? removeFrenchlabel(socialSci) : '';
        const expected = filters.socialSciences === 'yes' ? 'Yes' : 'No';
        if (cleanSocialSci !== expected) {
          return false;
        }
      }
      
      // Content type filter
      if (selectedContentType) {
        const contentStr = row[contentCol];
        if (!contentStr) return false;
        const types = contentStr.split(';').map(t => removeFrenchlabel(t.trim()));
        if (!types.includes(selectedContentType)) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, filters, selectedContentType]);

  // Generate plot data
  useEffect(() => {
    if (!filteredData.length || dimensionDefinitions.length < 2) {
      setPlotData(null);
      return;
    }

    const headers = Object.keys(filteredData[0]);
    const socialMediaCol = headers[4];
    
    // Check if political info source dimension is selected
    const hasPoliticalInfoSource = dimensionDefinitions.some(dim => dim.key === 'politicalInfoSource');
    
    // Filter rows that have all required data
    let validRows = filteredData.filter(row => {
      return dimensionDefinitions.every(dim => {
        const col = headers[dim.columnIndex];
        return row[col] && row[col].trim();
      });
    });
    
    // If political info source is selected, expand rows to have one row per source
    if (hasPoliticalInfoSource) {
      const politicalInfoDim = dimensionDefinitions.find(dim => dim.key === 'politicalInfoSource');
      if (politicalInfoDim) {
        const sourceCol = headers[politicalInfoDim.columnIndex];
        const expandedRows: SurveyRow[] = [];
        
        validRows.forEach(row => {
          const sourcesStr = row[sourceCol];
          if (sourcesStr) {
            // Split by semicolon to get individual sources
            const sources = sourcesStr.split(';').map(s => s.trim()).filter(s => s);
            if (sources.length > 0) {
              // Create one row for each source
              sources.forEach(source => {
                const newRow = { ...row };
                newRow[sourceCol] = removeFrenchlabel(source); // Replace with single source (English only)
                expandedRows.push(newRow);
              });
            } else {
              expandedRows.push(row);
            }
          } else {
            expandedRows.push(row);
          }
        });
        
        validRows = expandedRows;
      }
    }
    
    if (validRows.length === 0) {
      setPlotData(null);
      return;
    }
    
    // Determine color variable FIRST (before building dimensions)
    let colorValues: string[] = [];
    let colorLabel = 'Social Media Platform';
    
    if (colorBy === 'socialMedia') {
      colorValues = validRows.map(row => removeFrenchlabel(row[socialMediaCol]));
      colorLabel = 'Social Media Platform';
    } else if (colorBy === 'gender') {
      const genderCol = headers[2];
      colorValues = validRows.map(row => removeFrenchlabel(row[genderCol]));
      colorLabel = 'Gender';
    } else if (colorBy === 'age') {
      const ageCol = headers[1];
      colorValues = validRows.map(row => getAgeGroup(row[ageCol]));
      colorLabel = 'Age Group';
    } else if (colorBy === 'socialSciences') {
      const socialSciencesCol = headers[3];
      colorValues = validRows.map(row => removeFrenchlabel(row[socialSciencesCol]));
      colorLabel = 'Social Sciences';
    } else if (colorBy === 'emotionalResponseCompact') {
      const emotionCol = headers[7];
      colorValues = validRows.map(row => categorizeEmotion(removeFrenchlabel(row[emotionCol])));
      colorLabel = 'Emotional Response (Compact)';
    } else if (colorBy === 'emotionalResponseComprehensive') {
      const emotionCol = headers[7];
      colorValues = validRows.map(row => removeFrenchlabel(row[emotionCol]));
      colorLabel = 'Emotional Response (Comprehensive)';
    }
    
    // Build dimensions array with color category breakdown
    const dimensions = dimensionDefinitions.map((dim) => {
      const col = headers[dim.columnIndex];
      let values = validRows.map(row => {
        let val = row[col];
        // Convert age to age group if needed
        if (dim.key === 'age') {
          val = getAgeGroup(val);
        }
        // Trim and clean the value
        if (val) {
          val = val.trim();
        }
        return val;
      }).filter(v => v); // Remove empty values
      
      // Normalize values: ensure consistent formatting, remove French translations, and abbreviate
      const normalizedValues = values.map(v => {
        if (!v) return '';
        let normalized = removeFrenchlabel(v.trim());
        // Apply time label shortening for time spent dimension
        if (dim.key === 'timeSpent') {
          normalized = shortenTimeLabel(normalized);
        }
        // Categorize emotional responses for compact version
        if (dim.key === 'emotionalResponseCompact') {
          normalized = categorizeEmotion(normalized);
        }
        // For comprehensive version, just clean and don't categorize
        if (dim.key === 'emotionalResponseComprehensive') {
          // Already cleaned by removeFrenchlabel, just use as-is
        }
        return abbreviateLabel(normalized, 35);
      }).filter(v => v);
      
      // Get unique values - Plotly will use these for the category axis
      const uniqueValuesSet = new Set(normalizedValues);
      const uniqueValues = Array.from(uniqueValuesSet);
      
      // Get category order based on all values (for frequency calculation)
      const categoryOrder = getCategoryOrder(normalizedValues, dim.label);
      
      // Build final category array: use ordered values, then add any missing unique values
      const orderedSet = new Set(categoryOrder);
      const missingValues = uniqueValues.filter(v => !orderedSet.has(v));
      const finalCategoryArray = [...categoryOrder, ...missingValues];
      
      // Ensure finalCategoryArray contains exactly all unique values (no duplicates)
      const finalUniqueArray = Array.from(new Set(finalCategoryArray));
      
      // Calculate color category breakdown for each category in this dimension
      const categoryBreakdowns: { [key: string]: { [colorCat: string]: number } } = {};
      normalizedValues.forEach((val, idx) => {
        if (!categoryBreakdowns[val]) {
          categoryBreakdowns[val] = {};
        }
        const colorCat = colorValues[idx] || 'Unknown';
        categoryBreakdowns[val][colorCat] = (categoryBreakdowns[val][colorCat] || 0) + 1;
      });
      
      return {
        label: dim.label,
        values: normalizedValues,
        categoryorder: finalUniqueArray.length > 0 ? 'array' as const : 'category ascending' as const,
        categoryarray: finalUniqueArray.length > 0 ? finalUniqueArray : undefined,
        categoryBreakdowns,
      };
    });
    
    // Get unique values for color mapping
    const uniqueColorValues = Array.from(new Set(colorValues)).sort();
    
    // Create color mapping
    let colorMap: { [key: string]: string } = {};
    const brightColors = ['#FF006E', '#9D4EDD', '#00A8FF', '#00F5FF', '#FFA500', '#FF1744', '#E0E0E0', '#FFD700'];
    
    if (colorBy === 'socialMedia') {
      // Use existing social media colors
      uniqueColorValues.forEach(val => {
        colorMap[val] = getSocialMediaColor(val);
      });
    } else {
      // Assign distinct colors to other variables
      uniqueColorValues.forEach((val, idx) => {
        colorMap[val] = brightColors[idx % brightColors.length];
      });
    }
    
    // Create simple color array for parallel categories
    const lineColor = colorValues.map(val => colorMap[val] || '#FFD700');

    // Create simple colorscale
    const customColorscale: [number, string][] = [];
    uniqueColorValues.forEach((val, idx) => {
      const color = colorMap[val] || brightColors[idx % brightColors.length];
      const position = uniqueColorValues.length === 1 ? 0.5 : idx / (uniqueColorValues.length - 1);
      customColorscale.push([position, color]);
    });
    
    // Calculate responsive height
    const baseHeight = Math.max(400, Math.min(800, dimensions.length * 120));
    const height = typeof window !== 'undefined' 
      ? Math.min(window.innerHeight * 0.6, baseHeight)
      : baseHeight;
    
    // Store breakdown info for potential future use (parcats has limited hover customization)
    // For now, we'll show the breakdown in a separate display or tooltip
    const allCategoryBreakdowns = dimensions.reduce((acc, dim) => {
      Object.entries(dim.categoryBreakdowns || {}).forEach(([cat, breakdown]) => {
        acc[`${dim.label}: ${cat}`] = breakdown;
      });
      return acc;
    }, {} as { [key: string]: { [colorCat: string]: number } });
    
    // Clean dimensions for plotly and add hover info
    const cleanDimensions = dimensions.map(dim => ({
      label: dim.label,
      values: dim.values,
      categoryorder: dim.categoryorder,
      categoryarray: dim.categoryarray,
    }));
    
    const trace = {
      type: 'parcats' as const,
      dimensions: cleanDimensions,
      line: {
        color: lineColor,
        colorscale: customColorscale,
        showscale: false, // Remove colorbar for parallel categories
        shape: 'linear',
        smoothing: 0.5,
      },
      counts: validRows.length,
      // Hover template showing dimension, category, and probability
      // Note: Color category breakdown is shown in the custom tooltip via handlePlotHover
      hovertemplate: `%{category} - %{probability:.1%}<extra></extra>`,
      hoveron: 'category',
    };

    // Update legend data and breakdown information
    setLegendData({ label: colorLabel, colorMap });
    setBreakdownData(allCategoryBreakdowns);
    setPlotData([trace]);
  }, [filteredData, dimensionDefinitions, colorBy]);

  useEffect(() => {
    setHoverTooltip(null);
  }, [plotData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSelectedDimensions((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleDimension = (key: string) => {
    setSelectedDimensions(prev => {
      const isCurrentlySelected = prev.includes(key);
      
      if (isCurrentlySelected) {
        // Remove the dimension
        return prev.filter(k => k !== key);
      } else {
        // Add dimension - check max limit
        if (prev.length >= 8) return prev;
        
        // Find where to insert based on availableDimensions order
        const newList = [...prev, key];
        
        // Sort to maintain order from availableDimensions
        return newList.sort((a, b) => {
          const indexA = availableDimensions.findIndex(d => d.key === a);
          const indexB = availableDimensions.findIndex(d => d.key === b);
          return indexA - indexB;
        });
      }
    });
  };

  const handlePlotHover = useCallback((event: any) => {
    if (!event?.points?.length || !plotContainerRef.current) {
      return;
    }

    const point = event.points[0];
    const dimensionIndex = typeof point?.dimension === 'number'
      ? point.dimension
      : typeof point?.dimension?.index === 'number'
        ? point.dimension.index
        : null;

    const dimensionLabel =
      dimensionIndex !== null && dimensionDefinitions[dimensionIndex]
        ? dimensionDefinitions[dimensionIndex].label
        : (point?.axis?.label ?? '');

    const categoryLabel = typeof point?.label === 'string'
      ? point.label
      : typeof point?.value === 'string'
        ? point.value
        : '';

    if (!dimensionLabel || !categoryLabel) {
      setHoverTooltip(null);
      return;
    }

    const breakdownKey = `${dimensionLabel}: ${categoryLabel}`;
    const breakdown = breakdownData[breakdownKey];

    if (!breakdown) {
      setHoverTooltip(null);
      return;
    }

    const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
      setHoverTooltip(null);
      return;
    }

    const breakdownList = Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        count,
        pct: (count / total) * 100,
        color: legendData.colorMap[label] || '#ffffff',
      }));

    const containerRect = plotContainerRef.current.getBoundingClientRect();
    const clientX = event.event?.clientX ?? 0;
    const clientY = event.event?.clientY ?? 0;
    let relativeX = clientX - containerRect.left;
    let relativeY = clientY - containerRect.top;
    const horizontalPadding = 32;
    const verticalPadding = 80;
    relativeX = Math.min(Math.max(relativeX, horizontalPadding), containerRect.width - horizontalPadding);
    relativeY = Math.min(Math.max(relativeY, verticalPadding), containerRect.height - 24);

    setHoverTooltip({
      x: relativeX,
      y: relativeY,
      dimension: dimensionLabel,
      category: categoryLabel,
      total,
      breakdown: breakdownList,
    });
  }, [breakdownData, dimensionDefinitions, legendData]);

  const handlePlotUnhover = useCallback(() => {
    setHoverTooltip(null);
  }, []);

  // Get unique values for filters
  const uniqueGenders = useMemo(() => {
    if (!data.length) return [];
    const headers = Object.keys(data[0]);
    const genderCol = headers[2];
    return Array.from(new Set(data.map(row => {
      const val = row[genderCol];
      return val ? removeFrenchlabel(val) : '';
    }).filter(Boolean))).sort();
  }, [data]);

  const uniqueSocialMedia = useMemo(() => {
    if (!data.length) return [];
    const headers = Object.keys(data[0]);
    const socialMediaCol = headers[4];
    return getSocialMediaPlatforms(data, socialMediaCol);
  }, [data]);

  const ageRange = useMemo(() => {
    if (!data.length) return [0, 100];
    const headers = Object.keys(data[0]);
    const ageCol = headers[1];
    const ages = data
      .map(row => parseInt(row[ageCol]))
      .filter(age => !isNaN(age));
    if (ages.length === 0) return [0, 100];
    return [Math.min(...ages), Math.max(...ages)];
  }, [data]);

  const uniqueContentTypes = useMemo(() => {
    if (!data.length) return [];
    const headers = Object.keys(data[0]);
    const contentCol = headers[6];
    const typesSet = new Set<string>();
    
    data.forEach(row => {
      const contentStr = row[contentCol];
      if (contentStr) {
        const types = contentStr.split(';').map(t => t.trim()).filter(t => t);
        types.forEach(type => typesSet.add(removeFrenchlabel(type)));
      }
    });
    
    return Array.from(typesSet).sort();
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-b from-zinc-900 to-black">
        <div className="text-lg text-zinc-400">Loading parallel categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-b from-zinc-900 to-black">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const totalRespondents = data.length;
  const filteredRespondents = filteredData.length;
  const dimensionCount = selectedDimensions.length;

  const handleExport = () => {
    const exportFilters: Record<string, any> = {
      socialMedia: filters.socialMedia.length > 0 ? filters.socialMedia : 'All',
      ageRange: filters.ageRange,
      gender: filters.gender.length > 0 ? filters.gender : 'All',
      socialSciences: filters.socialSciences || 'All',
      contentType: selectedContentType || 'All',
      colorBy: colorBy,
      dimensions: selectedDimensions,
    };

    const exportStats: Record<string, any> = {
      'Total Respondents': totalRespondents,
      'Filtered Respondents': filteredRespondents,
      'Active Dimensions': dimensionCount,
    };

    exportToPDF({
      title: 'Parallel Categories Analysis Report',
      filters: exportFilters,
      visualizationType: 'parallel-categories',
      stats: exportStats,
    });
  };

  const getCurrentState = (): Record<string, any> => {
    return {
      filters,
      colorBy,
      selectedContentType,
      selectedDimensions,
    };
  };

  const handleLoadView = (state: Record<string, any>) => {
    if (state.filters) setFilters(state.filters);
    if (state.colorBy) setColorBy(state.colorBy);
    if (state.selectedContentType !== undefined) setSelectedContentType(state.selectedContentType);
    if (state.selectedDimensions) setSelectedDimensions(state.selectedDimensions);
  };

  // Dimension selection panel content (shared between desktop sidebar and mobile sheet)
  const dimensionPanelContent = (
    <>
      <div className="space-y-2 mb-4">
        {/* Selected dimensions with drag and drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedDimensions} strategy={verticalListSortingStrategy}>
            {selectedDimensions.map(key => {
              const dim = availableDimensions.find(d => d.key === key);
              if (!dim) return null;
              return (
                <SortableDimensionItem
                  key={dim.key}
                  id={dim.key}
                  label={dim.label}
                  isSelected={true}
                  isSortable={true}
                  onToggle={() => toggleDimension(dim.key)}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Unselected dimensions without drag and drop */}
        {availableDimensions
          .filter(dim => !selectedDimensions.includes(dim.key))
          .map(dim => (
            <SortableDimensionItem
              key={dim.key}
              id={dim.key}
              label={dim.label}
              isSelected={false}
              isSortable={false}
              onToggle={() => toggleDimension(dim.key)}
            />
          ))}
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        {isMobile ? 'Tap to select • Select 2-9 dimensions' : 'Drag to reorder • Select 2-9 dimensions'}
      </div>
    </>
  );

  return (
    <section
      id="parallel-categories"
      className="relative bg-gradient-to-b from-black via-zinc-900 to-black py-16"
    >
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg text-zinc-400">Data Flow</h2>
        </div>
        
        <div className={isMobile ? 'flex flex-col gap-4' : 'flex gap-4'}>
          {/* Left Sidebar - Dimension Selection (Desktop only) */}
          {!isMobile && (
            sidebarOpen ? (
              <div className="w-80 transition-all duration-300">
                <div className="bg-zinc-900/80 rounded-lg p-4 backdrop-blur-sm h-fit sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Dimensions</h3>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {dimensionPanelContent}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="h-fit sticky top-4 text-zinc-400 hover:text-white p-2 bg-zinc-900/80 rounded-lg backdrop-blur-sm"
                title="Show dimensions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )
          )}
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Summary Statistics (Desktop only - mobile shows in bottom sheet) */}
            {!isMobile && (
              <div className="bg-zinc-900/50 rounded-lg p-4 mb-4 backdrop-blur-sm">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Total Respondents:</span>
                    <span className="text-white font-semibold">{totalRespondents}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Filtered:</span>
                    <span className="text-white font-semibold">{filteredRespondents}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Dimensions:</span>
                    <span className="text-white font-semibold">{dimensionCount}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Controls Bar */}
            <div className={`bg-zinc-900/50 rounded-lg mb-4 backdrop-blur-sm ${isMobile ? 'p-3' : 'p-4'}`}>
              {isMobile ? (
                /* Mobile: Simplified controls bar */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-400">Showing</span>
                    <span className="text-white font-semibold">{filteredRespondents}</span>
                    <span className="text-zinc-400">of {totalRespondents}</span>
                  </div>
                  <button
                    onClick={handleExport}
                    className="text-sm text-zinc-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-700 hover:border-zinc-600 transition-colors"
                    title="Export report as PDF"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Desktop: Full controls bar */
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">Color by:</span>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: 'socialMedia', label: 'Social Media' },
                        { value: 'gender', label: 'Gender' },
                        { value: 'age', label: 'Age' },
                        { value: 'socialSciences', label: 'Social Sciences' },
                        { value: 'emotionalResponseCompact', label: 'Emotional Response (Compact)' },
                        { value: 'emotionalResponseComprehensive', label: 'Emotional Response (Full)' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="colorBy"
                            value={option.value}
                            checked={colorBy === option.value}
                            onChange={(e) => setColorBy(e.target.value)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm text-zinc-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Type Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">Content most often encountered</span>
                    <select
                      value={selectedContentType || ''}
                      onChange={(e) => setSelectedContentType(e.target.value || null)}
                      className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 cursor-pointer text-sm max-w-xs"
                    >
                      <option value="">All Content Types</option>
                      {uniqueContentTypes.map(type => (
                        <option key={type} value={type}>
                          {type.length > 40 ? type.substring(0, 40) + '...' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <SavedViewsManager
                    type="parallel-categories"
                    currentState={getCurrentState()}
                    onLoadView={handleLoadView}
                  />
                  <button
                    onClick={handleExport}
                    className="text-sm text-zinc-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-700 hover:border-zinc-600 transition-colors"
                    title="Export report as PDF"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="text-sm text-zinc-400 hover:text-white flex items-center gap-2"
                  >
                    <span>Filters</span>
                    <svg className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Filters Panel (Desktop only - mobile uses bottom sheet) */}
              {!isMobile && filtersOpen && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Social Media Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Social Media Platform</label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {uniqueSocialMedia.map(platform => (
                          <label key={platform} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.socialMedia.includes(platform)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    socialMedia: [...prev.socialMedia, platform],
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    socialMedia: prev.socialMedia.filter(p => p !== platform),
                                  }));
                                }
                              }}
                              className="cursor-pointer"
                            />
                            <span className="text-xs text-zinc-300">{abbreviateLabel(platform)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Gender Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Gender</label>
                      <div className="space-y-1">
                        {uniqueGenders.map(gender => (
                          <label key={gender} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.gender.includes(gender)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    gender: [...prev.gender, gender],
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    gender: prev.gender.filter(g => g !== gender),
                                  }));
                                }
                              }}
                              className="cursor-pointer"
                            />
                            <span className="text-xs text-zinc-300">{gender}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Age Range Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">
                        Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min={ageRange[0]}
                          max={ageRange[1]}
                          value={filters.ageRange[0]}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            ageRange: [parseInt(e.target.value), prev.ageRange[1]],
                          }))}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min={ageRange[0]}
                          max={ageRange[1]}
                          value={filters.ageRange[1]}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            ageRange: [prev.ageRange[0], parseInt(e.target.value)],
                          }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {/* Social Sciences Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Social Sciences Study</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="socialSciences"
                            checked={filters.socialSciences === null}
                            onChange={() => setFilters(prev => ({ ...prev, socialSciences: null }))}
                            className="cursor-pointer"
                          />
                          <span className="text-xs text-zinc-300">All</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="socialSciences"
                            checked={filters.socialSciences === 'yes'}
                            onChange={() => setFilters(prev => ({ ...prev, socialSciences: 'yes' }))}
                            className="cursor-pointer"
                          />
                          <span className="text-xs text-zinc-300">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="socialSciences"
                            checked={filters.socialSciences === 'no'}
                            onChange={() => setFilters(prev => ({ ...prev, socialSciences: 'no' }))}
                            className="cursor-pointer"
                          />
                          <span className="text-xs text-zinc-300">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Plot */}
            <div>
              {plotData ? (
                <>
                  <div className={`bg-zinc-900/50 rounded-lg backdrop-blur-sm ${isMobile ? 'p-3' : 'p-6'}`}>
                    <div ref={plotContainerRef} className="relative w-full h-full">
                      <Plot
                        data={plotData}
                        layout={{
                          font: { color: '#ffffff', size: isMobile ? 9 : 11 },
                          paper_bgcolor: 'rgba(0,0,0,0)',
                          plot_bgcolor: 'rgba(0,0,0,0)',
                          height: typeof window !== 'undefined' 
                            ? isMobile 
                              ? Math.min(window.innerHeight * 0.5, 400) 
                              : Math.min(window.innerHeight * 0.6, Math.max(400, Math.min(800, dimensionCount * 120)))
                            : Math.max(400, Math.min(800, dimensionCount * 120)),
                          margin: isMobile ? { l: 40, r: 40, t: 20, b: 20 } : { l: 80, r: 80, t: 40, b: 40 },
                          autosize: true,
                        }}
                        config={{
                          displayModeBar: !isMobile,
                          displaylogo: false,
                          responsive: true,
                        }}
                        style={{ width: '100%', height: '100%' }}
                        onHover={handlePlotHover}
                        onUnhover={handlePlotUnhover}
                      />
                      {hoverTooltip && (
                        <div
                          className="pointer-events-none absolute z-20 min-w-[220px] rounded-lg border border-zinc-700 bg-black/80 p-3 text-white shadow-2xl backdrop-blur"
                          style={{
                            left: hoverTooltip.x,
                            top: hoverTooltip.y,
                            transform: 'translate(-50%, -110%)',
                          }}
                        >
                          <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                            {hoverTooltip.dimension}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {hoverTooltip.category}
                          </div>
                          <div className="text-[11px] text-zinc-400 mb-2">
                            Total responses: {hoverTooltip.total}
                          </div>
                          <div className="space-y-1.5">
                            {hoverTooltip.breakdown.map(item => (
                              <div key={item.label} className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs text-zinc-200 flex-1 truncate">
                                  {item.label}
                                </span>
                                <span className="text-xs font-semibold text-white">
                                  {item.pct.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  {Object.keys(legendData.colorMap).length > 0 && (
                    <div className={`bg-zinc-900/50 rounded-lg mt-4 backdrop-blur-sm ${isMobile ? 'p-3' : 'p-4'}`}>
                      <h4 className="text-sm font-semibold text-white mb-3">
                        Legend: {legendData.label}
                      </h4>
                      <div className={isMobile ? 'flex gap-3 overflow-x-auto pb-2 -mx-1 px-1' : 'flex flex-wrap gap-3'}>
                        {Object.entries(legendData.colorMap).map(([category, color]) => (
                          <div key={category} className={`flex items-center gap-2 ${isMobile ? 'flex-shrink-0' : ''}`}>
                            <div 
                              className="w-4 h-4 rounded-sm flex-shrink-0" 
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-zinc-300 whitespace-nowrap">{category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Category Breakdown Info - Collapsible */}
                  {Object.keys(breakdownData).length > 0 && (
                    <div className="bg-zinc-900/50 rounded-lg p-4 mt-4 backdrop-blur-sm">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setBreakdownOpen(!breakdownOpen)}
                      >
                        <h4 className="text-sm font-semibold text-white">
                          {legendData.label} Breakdown by Category
                        </h4>
                        <svg 
                          className={`w-5 h-5 text-white transition-transform ${breakdownOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {breakdownOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto mt-3">
                          {Object.entries(breakdownData).map(([categoryKey, breakdown]) => {
                            const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
                            return (
                              <div key={categoryKey} className="bg-zinc-800/50 rounded p-3">
                                <div className="text-xs font-semibold text-white mb-2">{categoryKey}</div>
                                <div className="space-y-1">
                                  {Object.entries(breakdown)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([colorCat, count]) => {
                                      const pct = ((count / total) * 100).toFixed(1);
                                      const color = legendData.colorMap[colorCat] || '#888';
                                      return (
                                        <div key={colorCat} className="flex items-center gap-2">
                                          <div 
                                            className="w-2 h-2 rounded-full flex-shrink-0" 
                                            style={{ backgroundColor: color }}
                                          />
                                          <span className="text-xs text-zinc-400 flex-1">{colorCat}</span>
                                          <span className="text-xs text-zinc-300 font-medium">{pct}%</span>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center min-h-[400px] bg-zinc-900/50 rounded-lg">
                  <div className="text-lg text-zinc-400">
                    {selectedDimensions.length < 2 
                      ? 'Please select at least 2 dimensions'
                      : filteredRespondents === 0
                      ? 'No data matches the current filters'
                      : 'Preparing visualization...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <>
          {/* Floating Action Button */}
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
            aria-label="Open controls"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          {/* Bottom Sheet Overlay */}
          {mobileSheetOpen && (
            <div 
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSheetOpen(false)}
            />
          )}

          {/* Bottom Sheet */}
          <div 
            className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-2xl border-t border-zinc-700 transform transition-transform duration-300 ease-out ${
              mobileSheetOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ maxHeight: '80vh' }}
          >
            {/* Sheet Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-zinc-700">
              <h3 className="text-lg font-semibold text-white">Chart Controls</h3>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sheet Content */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {/* Dimensions Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Dimensions</h4>
                {dimensionPanelContent}
              </div>

              {/* Color By Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Color By</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'socialMedia', label: 'Social Media' },
                    { value: 'gender', label: 'Gender' },
                    { value: 'age', label: 'Age' },
                    { value: 'socialSciences', label: 'Social Sciences' },
                    { value: 'emotionalResponseCompact', label: 'Emotion (Compact)' },
                    { value: 'emotionalResponseComprehensive', label: 'Emotion (Full)' },
                  ].map(option => (
                    <label 
                      key={option.value} 
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                        colorBy === option.value 
                          ? 'bg-orange-500/20 border border-orange-500/50' 
                          : 'bg-zinc-800/50 border border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="colorByMobile"
                        value={option.value}
                        checked={colorBy === option.value}
                        onChange={(e) => setColorBy(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-sm text-zinc-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Content Type Filter</h4>
                <select
                  value={selectedContentType || ''}
                  onChange={(e) => setSelectedContentType(e.target.value || null)}
                  className="w-full px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 text-sm"
                >
                  <option value="">All Content Types</option>
                  {uniqueContentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.length > 40 ? type.substring(0, 40) + '...' : type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filters Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Filters</h4>
                
                {/* Social Media Filter */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-400 mb-2 block">Social Media Platform</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSocialMedia.map(platform => (
                      <label 
                        key={platform} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          filters.socialMedia.includes(platform)
                            ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300'
                            : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.socialMedia.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                socialMedia: [...prev.socialMedia, platform],
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                socialMedia: prev.socialMedia.filter(p => p !== platform),
                              }));
                            }
                          }}
                          className="sr-only"
                        />
                        {abbreviateLabel(platform)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-400 mb-2 block">Gender</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueGenders.map(gender => (
                      <label 
                        key={gender} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          filters.gender.includes(gender)
                            ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300'
                            : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                gender: [...prev.gender, gender],
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                gender: prev.gender.filter(g => g !== gender),
                              }));
                            }
                          }}
                          className="sr-only"
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Social Sciences Filter */}
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Social Sciences Study</label>
                  <div className="flex gap-2">
                    {[
                      { value: null, label: 'All' },
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ].map(option => (
                      <label 
                        key={option.label} 
                        className={`flex-1 text-center px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          filters.socialSciences === option.value
                            ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300'
                            : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="socialSciencesMobile"
                          checked={filters.socialSciences === option.value}
                          onChange={() => setFilters(prev => ({ ...prev, socialSciences: option.value }))}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-white">{totalRespondents}</div>
                    <div className="text-xs text-zinc-400">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{filteredRespondents}</div>
                    <div className="text-xs text-zinc-400">Filtered</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{dimensionCount}</div>
                    <div className="text-xs text-zinc-400">Dimensions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
