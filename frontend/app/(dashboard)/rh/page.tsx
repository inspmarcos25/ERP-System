'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Mail, 
  User, 
  DollarSign, 
  Award,
  Calendar,
  AlertCircle,
  LayoutGrid,
  List,
  Pencil,
  Trash2
} from 'lucide-react';
import { ViewToggle } from '@/components/shared/view-toggle';

interface Funcionario {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  cargo_id: string | null;
  departamento: string | null;
  status: string;
  salario: number;
  data_admissao: string | null;
}

interface Cargo {
  id: string;
  nome: string;
  departamento: string | null;
  salario_base: number;
}

export default function RHPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  
  // Modal state
  const [showAddFunc, setShowAddFunc] = useState(false);
  const [showEditFunc, setShowEditFunc] = useState(false);
  const [editFuncData, setEditFuncData] = useState<Funcionario | null>(null);
  
  // New employee form fields
  const [newFunc, setNewFunc] = useState({
    nome: '', cpf: '', email: '', cargo_id: '', departamento: 'Comercial', salario: 3000, data_admissao: ''
  });

  const loadRHData = async () => {
    setLoading(true);
    try {
      const [funcsList, cargosList] = await Promise.all([
        api.get<Funcionario[]>(`/rh/funcionarios?search=${encodeURIComponent(search)}`),
        api.get<Cargo[]>('/rh/cargos')
      ]);
      setFuncionarios(funcsList);
      setCargos(cargosList);
    } catch (e) {
      console.error('Failed to load HR data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRHData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRHData();
  };

  const handleCreateFunc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rh/funcionarios', newFunc);
      setShowAddFunc(false);
      setNewFunc({
        nome: '', cpf: '', email: '', cargo_id: '', departamento: 'Comercial', salario: 3000, data_admissao: ''
      });
      loadRHData();
    } catch (err) {
      alert('Erro ao admitir funcionário');
    }
  };

  const handleEditFuncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFuncData) return;
    try {
      await api.put(`/rh/funcionarios/${editFuncData.id}`, editFuncData);
      setShowEditFunc(false);
      setEditFuncData(null);
      loadRHData();
    } catch (err) {
      alert('Erro ao atualizar funcionário');
    }
  };

  const handleDeleteFunc = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este funcionário?')) return;
    try {
      await api.delete(`/rh/funcionarios/${id}`);
      loadRHData();
    } catch (err) {
      alert('Erro ao excluir funcionário');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'ferias':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'demitido':
      case 'inativo':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Recursos Humanos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle do quadro de funcionários, cargos, salários e novas admissões.
          </p>
        </div>

        <button
          onClick={() => setShowAddFunc(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer transition-colors"
        >
          <Plus size={15} />
          <span>Admitir Colaborador</span>
        </button>
      </div>

      {/* Control Actions Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/20 p-4 rounded-2xl border border-slate-800/40">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar colaborador por nome ou CPF..."
              className="w-full glass-input pl-10 text-xs py-2.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-xs font-semibold cursor-pointer">
            Buscar
          </button>
        </form>

        <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
      </div>

      {/* Grid of employees cards */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : funcionarios.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <AlertCircle className="mx-auto text-slate-500 mb-3" size={32} />
          <h3 className="text-sm font-semibold text-white">Nenhum funcionário cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1">Clique em admitir colaborador para começar o onboarding.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/40">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Nome</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Departamento</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Cargo</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Salário</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Admissão</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f) => {
                  const cargo = cargos.find(c => c.id === f.cargo_id);
                  return (
                    <tr key={f.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">
                            {f.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-semibold">{f.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{f.email || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{f.departamento || '-'}</td>
                      <td className="py-3 px-4 text-slate-300">{cargo?.nome || '-'}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono font-semibold">{formatCurrency(f.salario)}</td>
                      <td className="py-3 px-4 text-slate-400">{f.data_admissao ? new Date(f.data_admissao).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${getStatusColor(f.status)}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setEditFuncData(f); setShowEditFunc(true); }}
                            className="text-slate-400 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                            title="Editar Funcionário"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFunc(f.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Excluir Funcionário"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funcionarios.map((f) => {
            const cargo = cargos.find(c => c.id === f.cargo_id);
            return (
              <div key={f.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-slate-800/80">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                        {f.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{f.nome}</h3>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{f.departamento || 'Geral'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${getStatusColor(f.status)}`}>
                        {f.status}
                      </span>
                      <button 
                        onClick={() => { setEditFuncData(f); setShowEditFunc(true); }}
                        className="text-slate-500 hover:text-indigo-400 p-0.5 transition-colors cursor-pointer"
                        title="Editar Funcionário"
                      >
                        <Pencil size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteFunc(f.id)}
                        className="text-slate-500 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                        title="Excluir Funcionário"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mt-4">
                    {f.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-500" />
                        <span className="truncate">{f.email}</span>
                      </div>
                    )}
                    {f.data_admissao && (
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-500" />
                        <span>Admitido em: {new Date(f.data_admissao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Salário</span>
                    <p className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(f.salario)}</p>
                  </div>
                  {cargo && (
                    <span className="text-[10px] text-slate-300 font-semibold bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                      {cargo.nome}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddFunc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateFunc}
            className="w-full max-w-md glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Admitir Colaborador</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome Completo</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={newFunc.nome} onChange={(e)=>setNewFunc({...newFunc, nome: e.target.value})}/>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CPF</label>
                  <input type="text" className="w-full glass-input text-xs mt-1" placeholder="000.000.000-00" value={newFunc.cpf} onChange={(e)=>setNewFunc({...newFunc, cpf: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">E-mail Corporativo</label>
                  <input type="email" className="w-full glass-input text-xs mt-1" placeholder="nome@empresa.com" value={newFunc.email} onChange={(e)=>setNewFunc({...newFunc, email: e.target.value})}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cargo</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={newFunc.cargo_id} onChange={(e)=>setNewFunc({...newFunc, cargo_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Departamento</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={newFunc.departamento} onChange={(e)=>setNewFunc({...newFunc, departamento: e.target.value})}>
                    <option value="Comercial">Comercial</option>
                    <option value="TI">Tecnologia (TI)</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Salário Contratual (R$)</label>
                  <input required type="number" className="w-full glass-input text-xs mt-1" value={newFunc.salario} onChange={(e)=>setNewFunc({...newFunc, salario: parseFloat(e.target.value) || 0})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Data Admissão</label>
                  <input type="date" className="w-full glass-input text-xs mt-1" value={newFunc.data_admissao} onChange={(e)=>setNewFunc({...newFunc, data_admissao: e.target.value})}/>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddFunc(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditFunc && editFuncData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleEditFuncSubmit}
            className="w-full max-w-md glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Editar Colaborador</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome Completo</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={editFuncData.nome} onChange={(e)=>setEditFuncData({...editFuncData, nome: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CPF</label>
                  <input type="text" className="w-full glass-input text-xs mt-1" value={editFuncData.cpf || ''} onChange={(e)=>setEditFuncData({...editFuncData, cpf: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">E-mail Corporativo</label>
                  <input type="email" className="w-full glass-input text-xs mt-1" value={editFuncData.email || ''} onChange={(e)=>setEditFuncData({...editFuncData, email: e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Departamento</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={editFuncData.departamento || ''} onChange={(e)=>setEditFuncData({...editFuncData, departamento: e.target.value})}>
                    <option value="Comercial">Comercial</option>
                    <option value="TI">Tecnologia (TI)</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={editFuncData.status} onChange={(e)=>setEditFuncData({...editFuncData, status: e.target.value})}>
                    <option value="ativo">Ativo</option>
                    <option value="ferias">Férias</option>
                    <option value="inativo">Inativo</option>
                    <option value="demitido">Demitido</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Salário (R$)</label>
                  <input required type="number" className="w-full glass-input text-xs mt-1" value={editFuncData.salario} onChange={(e)=>setEditFuncData({...editFuncData, salario: parseFloat(e.target.value) || 0})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Data Admissão</label>
                  <input type="date" className="w-full glass-input text-xs mt-1" value={editFuncData.data_admissao || ''} onChange={(e)=>setEditFuncData({...editFuncData, data_admissao: e.target.value})}/>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>{setShowEditFunc(false); setEditFuncData(null)}} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
