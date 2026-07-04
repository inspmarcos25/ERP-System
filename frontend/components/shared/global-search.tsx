'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Package, FileText, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface SearchResult {
  tipo: 'cliente' | 'produto' | 'pedido';
  id: string;
  titulo: string;
  subtitulo: string;
  url: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Ctrl+K logic in keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Real-time API query with simple debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.get<{ resultados: SearchResult[] }>(`/search/global?q=${encodeURIComponent(query)}`);
        setResults(data.resultados);
      } catch (err) {
        console.error('Global search query failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  const handleResultClick = (url: string) => {
    router.push(url);
    onClose();
    setQuery('');
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'cliente':
        return <User className="text-cyan-400" size={16} />;
      case 'produto':
        return <Package className="text-indigo-400" size={16} />;
      case 'pedido':
        return <FileText className="text-amber-400" size={16} />;
      default:
        return <Search className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl glass-panel bg-[#0B0F19]/95 rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80">
          <Search className="text-slate-400 shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por cliente, produto, código, pedido..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading ? (
            <Loader2 className="animate-spin text-slate-500 shrink-0" size={16} />
          ) : (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Digite pelo menos 2 caracteres para começar a buscar.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {loading ? 'Pesquisando...' : 'Nenhum resultado encontrado.'}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={`${result.tipo}-${result.id}`}
                  onClick={() => handleResultClick(result.url)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 text-left transition-colors duration-150 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800/60 shrink-0">
                    {getIcon(result.tipo)}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{result.titulo}</h5>
                    <p className="text-xs text-slate-400 capitalize">{result.tipo} • {result.subtitulo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-950/20 text-[10px] text-slate-500 flex justify-between">
          <span>Pressione <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">ESC</kbd> para fechar</span>
          <span>Navegue com o mouse</span>
        </div>
      </div>
    </div>
  );
}
