'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'cards' | 'list';
  onToggle: (mode: 'cards' | 'list') => void;
}

export function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex bg-slate-950/40 p-1 rounded-lg border border-slate-800 shrink-0">
      <button
        onClick={() => onToggle('cards')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
          viewMode === 'cards'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutGrid size={14} />
        <span>Cards</span>
      </button>
      <button
        onClick={() => onToggle('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
          viewMode === 'list'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <List size={14} />
        <span>Lista</span>
      </button>
    </div>
  );
}
