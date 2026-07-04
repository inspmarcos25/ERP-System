'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Check, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface Conta {
  id: string;
  descricao: string;
  valor: number;
  valor_pago: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string | null;
  numero_documento: string | null;
}

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<'receber' | 'pagar'>('receber');
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal creation states
  const [showAddConta, setShowAddConta] = useState(false);
  const [newConta, setNewConta] = useState({
    descricao: '', valor: 0, data_vencimento: '', forma_pagamento: 'PIX', numero_documento: '', observacoes: ''
  });

  const loadFinanceiroData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'receber' ? '/financeiro/contas-receber' : '/financeiro/contas-pagar';
      const data = await api.get<Conta[]>(endpoint);
      setContas(data);
    } catch (e) {
      console.error('Failed to fetch accounts list', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceiroData();
  }, [activeTab]);

  const handleCreateConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'receber' ? '/financeiro/contas-receber' : '/financeiro/contas-pagar';
      await api.post(endpoint, newConta);
      setShowAddConta(false);
      setNewConta({
        descricao: '', valor: 0, data_vencimento: '', forma_pagamento: 'PIX', numero_documento: '', observacoes: ''
      });
      loadFinanceiroData();
    } catch (err) {
      alert('Erro ao criar registro financeiro');
    }
  };

  const handlePagarConta = async (id: string, valor: number) => {
    try {
      const endpoint = activeTab === 'receber' ? `/financeiro/contas-receber/${id}` : `/financeiro/contas-pagar/${id}`;
      await api.put(endpoint, {
        status: 'pago',
        valor_pago: valor,
        data_pagamento: new Date().toISOString().split('T')[0]
      });
      loadFinanceiroData();
    } catch (err) {
      alert('Erro ao liquidar conta.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'pendente':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'vencido':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Gestão Financeira
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de fluxo de caixa, liquidação de títulos a pagar e a receber.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('receber')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'receber' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight size={14} className="text-emerald-400" />
            <span>Contas a Receber</span>
          </button>
          <button
            onClick={() => setActiveTab('pagar')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'pagar' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight size={14} className="text-rose-400" />
            <span>Contas a Pagar</span>
          </button>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex justify-between items-center bg-slate-900/20 p-4 rounded-2xl border border-slate-800/40">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Listagem de Lançamentos ({activeTab === 'receber' ? 'Receber' : 'Pagar'})
        </h4>
        <button
          onClick={() => setShowAddConta(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer transition-colors"
        >
          <Plus size={15} />
          <span>Registrar Lançamento</span>
        </button>
      </div>

      {/* Tabela de Contas */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : contas.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <AlertCircle className="mx-auto text-slate-500 mb-3" size={32} />
          <h3 className="text-sm font-semibold text-white">Nenhum lançamento pendente</h3>
          <p className="text-xs text-slate-400 mt-1">Clique em registrar para adicionar uma movimentação.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="px-5 py-4">Descrição</th>
                  <th className="px-5 py-4">Vencimento</th>
                  <th className="px-5 py-4">Valor</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {contas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 text-white font-semibold">
                      <p>{c.descricao}</p>
                      {c.numero_documento && <p className="text-[10px] text-slate-500 mt-0.5">Doc: {c.numero_documento}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {new Date(c.data_vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-white font-bold font-mono">
                      {formatCurrency(c.valor)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {c.status.toLowerCase() !== 'pago' ? (
                        <button
                          onClick={() => handlePagarConta(c.id, c.valor)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Check size={12} />
                          <span>Baixar</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Liquidado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Title Modal */}
      {showAddConta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateConta}
            className="w-full max-w-md glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">
              Registrar Conta a {activeTab === 'receber' ? 'Receber' : 'Pagar'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descrição / Título</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" placeholder="Ex: Fatura Internet" value={newConta.descricao} onChange={(e)=>setNewConta({...newConta, descricao: e.target.value})}/>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Valor (R$)</label>
                  <input required type="number" step="any" className="w-full glass-input text-xs mt-1" value={newConta.valor} onChange={(e)=>setNewConta({...newConta, valor: parseFloat(e.target.value) || 0})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Vencimento</label>
                  <input required type="date" className="w-full glass-input text-xs mt-1" value={newConta.data_vencimento} onChange={(e)=>setNewConta({...newConta, data_vencimento: e.target.value})}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Forma de Pagamento</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={newConta.forma_pagamento} onChange={(e)=>setNewConta({...newConta, forma_pagamento: e.target.value})}>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nº Documento</label>
                  <input type="text" className="w-full glass-input text-xs mt-1" value={newConta.numero_documento} onChange={(e)=>setNewConta({...newConta, numero_documento: e.target.value})}/>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddConta(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Registrar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
