export interface SavedView {
  id: string;
  name: string;
  timestamp: number;
  type: 'parallel-categories' | '3d-plot';
  state: Record<string, any>;
}

const STORAGE_KEY = 'digital-culture-saved-views';

export function saveView(name: string, type: 'parallel-categories' | '3d-plot', state: Record<string, any>): SavedView {
  const view: SavedView = {
    id: `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    timestamp: Date.now(),
    type,
    state,
  };

  const views = getAllViews();
  views.push(view);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  
  return view;
}

export function getAllViews(): SavedView[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading saved views:', error);
    return [];
  }
}

export function getViewsByType(type: 'parallel-categories' | '3d-plot'): SavedView[] {
  return getAllViews().filter(view => view.type === type);
}

export function getView(id: string): SavedView | null {
  const views = getAllViews();
  return views.find(view => view.id === id) || null;
}

export function deleteView(id: string): boolean {
  const views = getAllViews();
  const filtered = views.filter(view => view.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered.length < views.length;
}

export function updateViewName(id: string, newName: string): boolean {
  const views = getAllViews();
  const view = views.find(v => v.id === id);
  if (!view) return false;
  
  view.name = newName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  return true;
}

export function clearAllViews(): void {
  localStorage.removeItem(STORAGE_KEY);
}

