'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SavedView, getAllViews, getViewsByType, saveView, deleteView, updateViewName } from '../lib/savedViews';

interface SavedViewsManagerProps {
  type: 'parallel-categories' | '3d-plot';
  currentState: Record<string, any>;
  onLoadView: (state: Record<string, any>) => void;
}

export default function SavedViewsManager({ type, currentState, onLoadView }: SavedViewsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [views, setViews] = useState<SavedView[]>([]);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setViews(getViewsByType(type));
    }
  }, [isOpen, type]);

  const handleSave = () => {
    if (!saveName.trim()) {
      alert('Please enter a name for this view');
      return;
    }

    saveView(saveName.trim(), type, currentState);
    setSaveName('');
    setViews(getViewsByType(type));
  };

  const handleLoad = (view: SavedView) => {
    onLoadView(view.state);
    setIsOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved view?')) {
      deleteView(id);
      setViews(getViewsByType(type));
    }
  };

  const handleStartEdit = (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(view.id);
    setEditName(view.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      alert('Please enter a name');
      return;
    }
    updateViewName(id, editName.trim());
    setEditingId(null);
    setEditName('');
    setViews(getViewsByType(type));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const floatingWindow = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Floating Window */}
      <div
        className="fixed top-20 right-4 z-[9999] w-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Header with Close Button */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-white">Saved Views</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Close"
                aria-label="Close saved views"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">

              {/* Save New View */}
              <div className="p-6 border-b border-zinc-800">
                <h4 className="text-sm font-semibold text-white mb-3">Save Current View</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Enter view name..."
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Saved Views List */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-white mb-3">Load Saved View</h4>
                {views.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    No saved views yet. Save your current view to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {views.map((view) => (
                      <div
                        key={view.id}
                        className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors cursor-pointer"
                        onClick={() => handleLoad(view)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {editingId === view.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(view.id);
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                  className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit(view.id);
                                  }}
                                  className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="px-2 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="text-white font-medium">{view.name}</div>
                                <div className="text-xs text-zinc-500 mt-1">
                                  {new Date(view.timestamp).toLocaleString()}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {editingId !== view.id && (
                              <>
                                <button
                                  onClick={(e) => handleStartEdit(view, e)}
                                  className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors"
                                  title="Rename"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => handleDelete(view.id, e)}
                                  className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-zinc-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-700 hover:border-zinc-600 transition-colors"
        title="Manage saved views"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span>Saved Views</span>
      </button>

      {mounted && isOpen && createPortal(
        floatingWindow,
        document.body
      )}
    </>
  );
}

