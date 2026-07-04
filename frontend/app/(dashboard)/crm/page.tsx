'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Users, 
  Target, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Sparkles,
  TrendingUp,
  LayoutGrid,
  List,
  Pencil,
  Trash2
} from 'lucide-react';
import { ViewToggle } from '@/components/shared/view-toggle';

interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  cpf_cnpj: string | null;
  tipo: string;
  status: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  limite_credito: number;
}

interface Lead {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  status: string;
  valor_estimado: number;
  probabilidade: number;
  origem: string | null;
}

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<'clientes' | 'leads'>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  
  // Modals state
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showEditCliente, setShowEditCliente] = useState(false);
  const [showEditLead, setShowEditLead] = useState(false);
  const [editClientData, setEditClientData] = useState<Cliente | null>(null);
  const [editLeadData, setEditLeadData] = useState<Lead | null>(null);

  // New item form states
  const [newClient, setNewClient] = useState({
    nome: '', email: '', telefone: '', cpf_cnpj: '', tipo: 'PJ', limite_credito: 10000, endereco: '', cidade: '', estado: ''
  });
  const [newLead, setNewLead] = useState({
    nome: '', email: '', telefone: '', empresa: '', valor_estimado: 5000, probabilidade: 50, status: 'novo'
  });

  const loadCRMData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'clientes') {
        const data = await api.get<Cliente[]>(`/crm/clientes?search=${encodeURIComponent(searchQuery)}`);
        setClientes(data);
      } else {
        const data = await api.get<Lead[]>(`/crm/leads?search=${encodeURIComponent(searchQuery)}`);
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to load CRM entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCRMData();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCRMData();
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/clientes', newClient);
      setShowAddCliente(false);
      setNewClient({ nome: '', email: '', telefone: '', cpf_cnpj: '', tipo: 'PJ', limite_credito: 10000, endereco: '', cidade: '', estado: '' });
      loadCRMData();
    } catch (err) {
      alert('Erro ao criar cliente');
    }
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/leads', newLead);
      setShowAddLead(false);
      setNewLead({ nome: '', email: '', telefone: '', empresa: '', valor_estimado: 5000, probabilidade: 50, status: 'novo' });
      loadCRMData();
    } catch (err) {
      alert('Erro ao criar lead');
    }
  };

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClientData) return;
    try {
      await api.put(`/crm/clientes/${editClientData.id}`, editClientData);
      setShowEditCliente(false);
      setEditClientData(null);
      loadCRMData();
    } catch (err) {
      alert('Erro ao atualizar cliente');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await api.delete(`/crm/clientes/${id}`);
      loadCRMData();
    } catch (err) {
      alert('Erro ao excluir cliente');
    }
  };

  const handleEditLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLeadData) return;
    try {
      await api.put(`/crm/leads/${editLeadData.id}`, editLeadData);
      setShowEditLead(false);
      setEditLeadData(null);
      loadCRMData();
    } catch (err) {
      alert('Erro ao atualizar lead');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return;
    try {
      await api.delete(`/crm/leads/${id}`);
      loadCRMData();
    } catch (err) {
      alert('Erro ao excluir lead');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            CRM & Relacionamento
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie seu funil de leads comerciais e banco de dados de clientes unificados.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => { setActiveTab('clientes'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'clientes' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            <span>Clientes</span>
          </button>
          <button
            onClick={() => { setActiveTab('leads'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'leads' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target size={14} />
            <span>Funil de Leads</span>
          </button>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/20 p-4 rounded-2xl border border-slate-800/40">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
            <input
              type="text"
              placeholder={`Filtrar ${activeTab === 'clientes' ? 'clientes por nome/email...' : 'leads por nome/empresa...'}`}
              className="w-full glass-input pl-10 text-xs py-2.5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-xs font-semibold transition-colors duration-150 cursor-pointer"
          >
            Buscar
          </button>
        </form>

        <ViewToggle viewMode={viewMode} onToggle={setViewMode} />

        <button
          onClick={() => activeTab === 'clientes' ? setShowAddCliente(true) : setShowAddLead(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer shrink-0 transition-all duration-150"
        >
          <Plus size={15} />
          <span>Cadastrar {activeTab === 'clientes' ? 'Cliente' : 'Lead'}</span>
        </button>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : activeTab === 'clientes' ? (
        viewMode === 'list' ? (
          <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/40">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Nome</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Telefone</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Cidade</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Tipo</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Crédito</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4 text-white font-semibold">{c.nome}</td>
                      <td className="py-3 px-4 text-slate-400">{c.email || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{c.telefone || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{c.cidade ? `${c.cidade} - ${c.estado}` : '-'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          {c.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-white font-mono font-semibold">{formatCurrency(c.limite_credito)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setEditClientData(c); setShowEditCliente(true); }}
                            className="text-slate-400 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                            title="Editar Cliente"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(c.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Excluir Cliente"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-slate-800/80">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-sm tracking-tight truncate pr-2 flex-1" title={c.nome}>
                      {c.nome}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {c.tipo}
                      </span>
                      <button 
                        onClick={() => { setEditClientData(c); setShowEditCliente(true); }}
                        className="text-slate-500 hover:text-indigo-400 p-0.5 transition-colors cursor-pointer"
                        title="Editar Cliente"
                      >
                        <Pencil size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(c.id)}
                        className="text-slate-500 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                        title="Excluir Cliente"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-500" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-500" />
                        <span>{c.telefone}</span>
                      </div>
                    )}
                    {c.cidade && (
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-500" />
                        <span>{c.cidade} - {c.estado}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Crédito</p>
                    <p className="text-xs font-bold text-white font-mono">{formatCurrency(c.limite_credito)}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        viewMode === 'list' ? (
          <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/40">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Nome</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Empresa</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Telefone</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Valor Est.</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Conversão</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4 text-white font-semibold">{l.nome}</td>
                      <td className="py-3 px-4 text-slate-400">{l.empresa || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{l.email || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{l.telefone || '-'}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono font-semibold">{formatCurrency(l.valor_estimado)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-xs font-bold text-white">
                          <TrendingUp size={12} className="text-cyan-400" />
                          {l.probabilidade}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setEditLeadData(l); setShowEditLead(true); }}
                            className="text-slate-400 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                            title="Editar Lead"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(l.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Excluir Lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((l) => (
              <div key={l.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-slate-800/80">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-sm tracking-tight truncate pr-2 flex-1" title={l.nome}>
                      {l.nome}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                        {l.status}
                      </span>
                      <button 
                        onClick={() => { setEditLeadData(l); setShowEditLead(true); }}
                        className="text-slate-500 hover:text-indigo-400 p-0.5 transition-colors cursor-pointer"
                        title="Editar Lead"
                      >
                        <Pencil size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(l.id)}
                        className="text-slate-500 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                        title="Excluir Lead"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    {l.empresa && <p className="font-medium text-slate-300">Empresa: {l.empresa}</p>}
                    {l.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-500" />
                        <span className="truncate">{l.email}</span>
                      </div>
                    )}
                    {l.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-500" />
                        <span>{l.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Valor Estimado</p>
                    <p className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(l.valor_estimado)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Conversão</p>
                    <span className="flex items-center gap-1 text-xs font-bold text-white">
                      <TrendingUp size={12} className="text-cyan-400" />
                      {l.probabilidade}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Client Dialog Overlay */}
      {showAddCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleAddClientSubmit}
            className="w-full max-w-lg glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Cadastrar Novo Cliente</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome Completo / Razão Social</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={newClient.nome} onChange={(e)=>setNewClient({...newClient, nome: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">E-mail</label>
                <input type="email" className="w-full glass-input text-xs mt-1" value={newClient.email} onChange={(e)=>setNewClient({...newClient, email: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Telefone</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newClient.telefone} onChange={(e)=>setNewClient({...newClient, telefone: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CPF / CNPJ</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newClient.cpf_cnpj} onChange={(e)=>setNewClient({...newClient, cpf_cnpj: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Limite Crédito (R$)</label>
                <input type="number" className="w-full glass-input text-xs mt-1" value={newClient.limite_credito} onChange={(e)=>setNewClient({...newClient, limite_credito: parseFloat(e.target.value)})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cidade</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newClient.cidade} onChange={(e)=>setNewClient({...newClient, cidade: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estado (UF)</label>
                <input type="text" maxLength={2} className="w-full glass-input text-xs mt-1" value={newClient.estado} onChange={(e)=>setNewClient({...newClient, estado: e.target.value})}/>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddCliente(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Lead Dialog Overlay */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleAddLeadSubmit}
            className="w-full max-w-md glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Cadastrar Novo Lead</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Lead / Contato</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={newLead.nome} onChange={(e)=>setNewLead({...newLead, nome: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Empresa</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newLead.empresa} onChange={(e)=>setNewLead({...newLead, empresa: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">E-mail</label>
                  <input type="email" className="w-full glass-input text-xs mt-1" value={newLead.email} onChange={(e)=>setNewLead({...newLead, email: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Telefone</label>
                  <input type="text" className="w-full glass-input text-xs mt-1" value={newLead.telefone} onChange={(e)=>setNewLead({...newLead, telefone: e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Valor Estimado (R$)</label>
                  <input type="number" className="w-full glass-input text-xs mt-1" value={newLead.valor_estimado} onChange={(e)=>setNewLead({...newLead, valor_estimado: parseFloat(e.target.value)})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Probabilidade (%)</label>
                  <input type="number" min={0} max={100} className="w-full glass-input text-xs mt-1" value={newLead.probabilidade} onChange={(e)=>setNewLead({...newLead, probabilidade: parseInt(e.target.value)})}/>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddLead(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Client Dialog Overlay */}
      {showEditCliente && editClientData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleEditClientSubmit}
            className="w-full max-w-lg glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Editar Cliente</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome Completo / Razão Social</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={editClientData.nome} onChange={(e)=>setEditClientData({...editClientData, nome: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">E-mail</label>
                <input type="email" className="w-full glass-input text-xs mt-1" value={editClientData.email || ''} onChange={(e)=>setEditClientData({...editClientData, email: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Telefone</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={editClientData.telefone || ''} onChange={(e)=>setEditClientData({...editClientData, telefone: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CPF / CNPJ</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={editClientData.cpf_cnpj || ''} onChange={(e)=>setEditClientData({...editClientData, cpf_cnpj: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Limite Crédito (R$)</label>
                <input type="number" className="w-full glass-input text-xs mt-1" value={editClientData.limite_credito} onChange={(e)=>setEditClientData({...editClientData, limite_credito: parseFloat(e.target.value)})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cidade</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={editClientData.cidade || ''} onChange={(e)=>setEditClientData({...editClientData, cidade: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estado (UF)</label>
                <input type="text" maxLength={2} className="w-full glass-input text-xs mt-1" value={editClientData.estado || ''} onChange={(e)=>setEditClientData({...editClientData, estado: e.target.value})}/>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>{setShowEditCliente(false); setEditClientData(null)}} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Lead Dialog Overlay */}
      {showEditLead && editLeadData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleEditLeadSubmit}
            className="w-full max-w-md glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Editar Lead</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Lead / Contato</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={editLeadData.nome} onChange={(e)=>setEditLeadData({...editLeadData, nome: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Empresa</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={editLeadData.empresa || ''} onChange={(e)=>setEditLeadData({...editLeadData, empresa: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">E-mail</label>
                  <input type="email" className="w-full glass-input text-xs mt-1" value={editLeadData.email || ''} onChange={(e)=>setEditLeadData({...editLeadData, email: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Telefone</label>
                  <input type="text" className="w-full glass-input text-xs mt-1" value={editLeadData.telefone || ''} onChange={(e)=>setEditLeadData({...editLeadData, telefone: e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Valor Estimado (R$)</label>
                  <input type="number" className="w-full glass-input text-xs mt-1" value={editLeadData.valor_estimado} onChange={(e)=>setEditLeadData({...editLeadData, valor_estimado: parseFloat(e.target.value)})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Probabilidade (%)</label>
                  <input type="number" min={0} max={100} className="w-full glass-input text-xs mt-1" value={editLeadData.probabilidade} onChange={(e)=>setEditLeadData({...editLeadData, probabilidade: parseInt(e.target.value)})}/>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>{setShowEditLead(false); setEditLeadData(null)}} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
