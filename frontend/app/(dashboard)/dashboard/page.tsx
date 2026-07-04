'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  FileText,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface KPIs {
  vendas_mes: number;
  vendas_mes_anterior: number;
  crescimento_vendas: number;
  a_receber_vencido: number;
  a_pagar_vencido: number;
  total_clientes: number;
  produtos_criticos: number;
  pedidos_pendentes: number;
  projetos_ativos: number;
  total_funcionarios: number;
}

interface FluxoRef {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface StatusVenda {
  status: string;
  quantidade: number;
  total: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [fluxo, setFluxo] = useState<FluxoRef[]>([]);
  const [statusVendas, setStatusVendas] = useState<StatusVenda[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiData, fluxoData, statusData] = await Promise.all([
        api.get<KPIs>('/dashboard/kpis'),
        api.get<FluxoRef[]>('/dashboard/fluxo-caixa?meses=6'),
        api.get<StatusVenda[]>('/dashboard/vendas-por-status')
      ]);
      setKpis(kpiData);
      setFluxo(fluxoData);
      setStatusVendas(statusData);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  // Color mappings for Pie/Donut Chart
  const COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F87171', '#22D3EE', '#A78BFA'];

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Geral</h1>
          <p className="text-xs text-slate-400 mt-1">
            Resumo financeiro, operacional e de vendas da empresa.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 text-xs hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vendas */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendas do Mês</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(kpis?.vendas_mes || 0)}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              {kpis && kpis.crescimento_vendas >= 0 ? (
                <>
                  <span className="flex items-center text-xs font-semibold text-emerald-400">
                    <ArrowUpRight size={14} className="mr-0.5" />
                    +{kpis.crescimento_vendas}%
                  </span>
                  <span className="text-[10px] text-slate-400">vs mês anterior</span>
                </>
              ) : (
                <>
                  <span className="flex items-center text-xs font-semibold text-rose-400">
                    <ArrowDownRight size={14} className="mr-0.5" />
                    {kpis?.crescimento_vendas}%
                  </span>
                  <span className="text-[10px] text-slate-400">vs mês anterior</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Clientes */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clientes</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-mono">{kpis?.total_clientes || 0}</h3>
            <p className="text-[10px] text-slate-400 mt-2">Clientes ativos cadastrados no CRM</p>
          </div>
        </div>

        {/* Card 3: Contas Vencidas */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inadimplência (Vencido)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(kpis?.a_receber_vencido || 0)}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Pagar pendente vencido: </span>
              <span className="text-[10px] text-rose-400 font-semibold">{formatCurrency(kpis?.a_pagar_vencido || 0)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Alertas de Estoque */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estoque Crítico</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-mono">{kpis?.produtos_criticos || 0}</h3>
            <p className="text-[10px] text-slate-400 mt-2">Itens abaixo do estoque mínimo definido</p>
          </div>
        </div>
      </div>

      {/* Operação secundária / outros indicadores rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><FileText size={16} /></div>
          <div className="text-xs">
            <p className="text-slate-400 font-medium">Pedidos Pendentes</p>
            <p className="text-white font-bold text-sm">{kpis?.pedidos_pendentes || 0}</p>
          </div>
        </div>
        <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><FolderOpen size={16} /></div>
          <div className="text-xs">
            <p className="text-slate-400 font-medium">Projetos Ativos</p>
            <p className="text-white font-bold text-sm">{kpis?.projetos_ativos || 0}</p>
          </div>
        </div>
        <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400"><Users size={16} /></div>
          <div className="text-xs">
            <p className="text-slate-400 font-medium">Colaboradores ativos</p>
            <p className="text-white font-bold text-sm">{kpis?.total_funcionarios || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Fluxo de Caixa (Area Chart) */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2">
          <h4 className="text-sm font-semibold text-white tracking-wide mb-4">Fluxo de Caixa (Últimos 6 meses)</h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxo}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" stroke="#64748B" style={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" style={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }} 
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitas)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Vendas por Status (Donut Chart) */}
        <div className="glass-panel p-5 rounded-2xl">
          <h4 className="text-sm font-semibold text-white tracking-wide mb-4">Pedidos por Status</h4>
          <div className="h-60 w-full flex items-center justify-center">
            {statusVendas.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum pedido de venda registrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusVendas}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="quantidade"
                    nameKey="status"
                  >
                    {statusVendas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Status custom Legend list */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusVendas.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] text-slate-400 capitalize truncate" title={item.status}>
                  {item.status} ({item.quantidade})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
