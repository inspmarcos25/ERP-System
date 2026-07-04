'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';

interface HeaderProps {
  collapsed: boolean;
  onSearchClick: () => void;
}

interface Alerta {
  tipo: 'warning' | 'danger' | 'info';
  mensagem: string;
  modulo: string;
}

export default function Header({ collapsed, onSearchClick }: HeaderProps) {
  const pathname = usePathname();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showAlertsList, setShowAlertsList] = useState(false);

  // Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.get<Alerta[]>('/dashboard/alertas');
        setAlertas(data);
      } catch (err) {
        console.error('Failed to load alerts', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  // Format breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Início', path: '/' }];
    
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      
      // Customize specific labels
      if (part === 'crm') label = 'CRM';
      if (part === 'rh') label = 'RH & Equipe';
      if (part === 'financeiro') label = 'Financeiro';
      if (part === 'estoque') label = 'Estoque & Produtos';
      if (part === 'vendas') label = 'Vendas & Pedidos';
      if (part === 'projetos') label = 'Projetos';
      if (part === 'config') label = 'Configurações';
      if (part === 'dashboard') label = 'Visão Geral';
      
      return { label, path };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header 
      className={`h-16 fixed top-0 right-0 z-30 flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#0B0F19]/65 backdrop-blur-md transition-all duration-300 ease-in-out ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <span className="text-slate-600">/</span>}
              <span 
                className={`${
                  isLast 
                    ? 'text-indigo-400 font-semibold font-medium' 
                    : 'text-slate-400 font-normal'
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Ctrl+K Trigger Search Bar */}
        <button 
          onClick={onSearchClick}
          className="flex items-center justify-between w-64 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-150 text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-500" />
            <span>Pesquisar...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-500 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications / Alerts Indicator */}
        <div className="relative">
          <button 
            onClick={() => setShowAlertsList(!showAlertsList)}
            className="p-2 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white cursor-pointer relative transition-colors duration-150"
          >
            <Bell size={18} />
            {alertas.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Alerts Dropdown List */}
          {showAlertsList && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl border border-slate-800 bg-[#0F172A]/95 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Alertas do Sistema</h4>
                <button 
                  onClick={() => setShowAlertsList(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              
              {alertas.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum alerta ativo no momento.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {alertas.map((alerta, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 p-2.5 rounded-xl border ${
                        alerta.tipo === 'danger' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}
                    >
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold capitalize text-[10px] tracking-wide text-slate-400 mb-0.5">{alerta.modulo}</p>
                        <p>{alerta.mensagem}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
