'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  CheckSquare,
  ArrowRight,
  ChevronLeft,
  Briefcase,
  LayoutGrid,
  List,
  Pencil,
  Trash2
} from 'lucide-react';
import { ViewToggle } from '@/components/shared/view-toggle';

interface Task {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string | null;
  responsavel_id: string | null;
  status: 'todo' | 'em_andamento' | 'revisao' | 'concluido';
  prioridade: string;
  horas_estimadas: number | null;
  horas_realizadas: number;
}

interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  status: string;
  progresso: number;
  orcamento: number;
  custo_atual: number;
  tarefas: Task[];
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selectedProj, setSelectedProj] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProj, setShowAddProj] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditProj, setShowEditProj] = useState(false);
  const [editProjData, setEditProjData] = useState<Projeto | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState<Task | null>(null);

  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');

  // Form states
  const [newProj, setNewProj] = useState({ nome: '', descricao: '', orcamento: 0 });
  const [newTask, setNewTask] = useState({ titulo: '', descricao: '', status: 'todo', prioridade: 'media' });

  const loadProjetos = async () => {
    setLoading(true);
    try {
      const data = await api.get<Projeto[]>('/projetos/');
      setProjetos(data);
      if (selectedProj) {
        const refreshed = data.find(p => p.id === selectedProj.id);
        if (refreshed) setSelectedProj(refreshed);
      }
    } catch (e) {
      console.error('Failed to load projects list', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projetos/', newProj);
      setShowAddProj(false);
      setNewProj({ nome: '', descricao: '', orcamento: 0 });
      loadProjetos();
    } catch (err) {
      alert('Erro ao criar projeto');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj) return;
    try {
      await api.post(`/projetos/${selectedProj.id}/tarefas`, {
        ...newTask,
        projeto_id: selectedProj.id
      });
      setShowAddTask(false);
      setNewTask({ titulo: '', descricao: '', status: 'todo', prioridade: 'media' });
      loadProjetos();
    } catch (err) {
      alert('Erro ao criar tarefa');
    }
  };

  const handleMoveTask = async (taskId: string, nextStatus: string) => {
    try {
      await api.put(`/projetos/tarefas/${taskId}`, { status: nextStatus });
      loadProjetos();
    } catch (err) {
      console.error('Failed to move task status', err);
    }
  };

  const handleEditProjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjData) return;
    try {
      await api.put(`/projetos/${editProjData.id}`, {
        nome: editProjData.nome,
        descricao: editProjData.descricao,
        orcamento: editProjData.orcamento,
        status: editProjData.status
      });
      setShowEditProj(false);
      setEditProjData(null);
      loadProjetos();
    } catch (err) {
      alert('Erro ao atualizar projeto');
    }
  };

  const handleDeleteProj = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto e todas as suas tarefas?')) return;
    try {
      await api.delete(`/projetos/${id}`);
      setSelectedProj(null);
      loadProjetos();
    } catch (err) {
      alert('Erro ao excluir projeto');
    }
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskData) return;
    try {
      await api.put(`/projetos/tarefas/${editTaskData.id}`, {
        titulo: editTaskData.titulo,
        descricao: editTaskData.descricao,
        prioridade: editTaskData.prioridade,
        status: editTaskData.status
      });
      setShowEditTask(false);
      setEditTaskData(null);
      loadProjetos();
    } catch (err) {
      alert('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.delete(`/projetos/tarefas/${id}`);
      loadProjetos();
    } catch (err) {
      alert('Erro ao excluir tarefa');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const kanbanColumns = [
    { id: 'todo', name: 'A Fazer', color: 'border-slate-800 bg-slate-900/10' },
    { id: 'em_andamento', name: 'Em Progresso', color: 'border-indigo-500/20 bg-indigo-500/5' },
    { id: 'revisao', name: 'Revisão', color: 'border-cyan-500/20 bg-cyan-500/5' },
    { id: 'concluido', name: 'Concluído', color: 'border-emerald-500/20 bg-emerald-500/5' }
  ];

  return (
    <div className="space-y-6">
      {/* If Kanban Detail selected */}
      {selectedProj ? (
        <div className="space-y-6">
          {/* Header detail */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedProj(null)}
                className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{selectedProj.nome}</h1>
                <p className="text-xs text-slate-400 mt-1">{selectedProj.descricao}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus size={15} />
                <span>Nova Tarefa</span>
              </button>
              <button
                onClick={() => { setEditProjData(selectedProj); setShowEditProj(true); }}
                className="p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 cursor-pointer"
                title="Editar Projeto"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDeleteProj(selectedProj.id)}
                className="p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                title="Excluir Projeto"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Kanban Board Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {kanbanColumns.map((col) => {
              const colTasks = selectedProj.tarefas?.filter(t => t.status === col.id) || [];
              return (
                <div key={col.id} className={`p-4 rounded-2xl border ${col.color} min-h-[60vh] flex flex-col`}>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-2">
                    <span className="text-xs font-semibold text-white tracking-wide">{col.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950 text-[10px] text-slate-400 font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[55vh]">
                    {colTasks.map((t) => (
                      <div key={t.id} className="glass-panel p-3.5 rounded-xl border-slate-850 hover:border-slate-700 transition-all">
                        <h4 className="text-xs font-bold text-white mb-1.5">{t.titulo}</h4>
                        {t.descricao && <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">{t.descricao}</p>}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            t.prioridade === 'alta' || t.prioridade === 'urgente' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-slate-850 text-slate-400'
                          }`}>
                            {t.prioridade}
                          </span>
                          
                          {/* Fast move options */}
                          <div className="flex gap-1.5">
                            {col.id !== 'concluido' && (
                              <button 
                                onClick={() => {
                                  const idx = kanbanColumns.findIndex(c => c.id === col.id);
                                  handleMoveTask(t.id, kanbanColumns[idx+1].id);
                                }}
                                className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                                title="Avançar status"
                              >
                                <ArrowRight size={10} />
                              </button>
                            )}
                            <button 
                              onClick={() => { setEditTaskData(t); setShowEditTask(true); }}
                              className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-indigo-400 cursor-pointer"
                              title="Editar tarefa"
                            >
                              <Pencil size={10} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-rose-400 cursor-pointer"
                              title="Excluir tarefa"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Projects List Overview
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Projetos & Kanban
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Acompanhe o cronograma, orçamento e andamento das entregas corporativas.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
              <button
                onClick={() => setShowAddProj(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus size={15} />
                <span>Novo Projeto</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : projetos.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <FolderGit2 className="mx-auto text-slate-500 mb-3" size={32} />
              <h3 className="text-sm font-semibold text-white">Nenhum projeto registrado</h3>
              <p className="text-xs text-slate-400 mt-1">Crie um projeto para começar a gerenciar tarefas e times.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-900/40">
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Nome</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Descrição</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Progresso</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Orçamento</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Custo Atual</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Status</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase w-24">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projetos.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProj(p)}
                        className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 text-white font-semibold">{p.nome}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-[250px] truncate">{p.descricao || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-900 rounded-full h-1.5 border border-slate-800/50 max-w-[100px]">
                              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: `${p.progresso}%` }} />
                            </div>
                            <span className="text-indigo-400 font-mono text-[10px] font-bold">{p.progresso}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-mono">{formatCurrency(p.orcamento)}</td>
                        <td className="py-3 px-4 text-right text-white font-mono">{formatCurrency(p.custo_atual)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => { setEditProjData(p); setShowEditProj(true); }}
                              className="text-slate-400 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                              title="Editar Projeto"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProj(p.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                              title="Excluir Projeto"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projetos.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProj(p)}
                  className="glass-panel p-5 rounded-2xl border-slate-800/80 cursor-pointer hover:border-indigo-500/40 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-sm tracking-tight">{p.nome}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                        {p.status}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditProjData(p); setShowEditProj(true); }}
                        className="text-slate-500 hover:text-indigo-400 p-0.5 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProj(p.id); }}
                        className="text-slate-500 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">{p.descricao || 'Sem descrição cadastrada.'}</p>
                  
                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold uppercase">Progresso</span>
                      <span className="text-indigo-400 font-bold font-mono">{p.progresso}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800/50">
                      <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: `${p.progresso}%` }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Orçamento: <strong className="text-emerald-400">{formatCurrency(p.orcamento)}</strong></span>
                    <span>Custo: <strong className="text-white">{formatCurrency(p.custo_atual)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateProject}
            className="w-full max-w-sm glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Novo Projeto</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Projeto</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" placeholder="Ex: Novo App" value={newProj.nome} onChange={(e)=>setNewProj({...newProj, nome: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descrição</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newProj.descricao} onChange={(e)=>setNewProj({...newProj, descricao: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Orçamento Previsto (R$)</label>
                <input type="number" className="w-full glass-input text-xs mt-1" value={newProj.orcamento} onChange={(e)=>setNewProj({...newProj, orcamento: parseFloat(e.target.value) || 0})}/>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddProj(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Criar</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && selectedProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateTask}
            className="w-full max-w-sm glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Criar Tarefa no Kanban</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Título da Tarefa</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" placeholder="Ex: Refatorar layouts" value={newTask.titulo} onChange={(e)=>setNewTask({...newTask, titulo: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descrição / Detalhes</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newTask.descricao} onChange={(e)=>setNewTask({...newTask, descricao: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Prioridade</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={newTask.prioridade} onChange={(e)=>setNewTask({...newTask, prioridade: e.target.value})}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status Inicial</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={newTask.status} onChange={(e)=>setNewTask({...newTask, status: e.target.value})}>
                    <option value="todo">A Fazer</option>
                    <option value="em_andamento">Em Progresso</option>
                    <option value="revisao">Revisão</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddTask(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Criar</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProj && editProjData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleEditProjSubmit}
            className="w-full max-w-sm glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Editar Projeto</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Projeto</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={editProjData.nome} onChange={(e)=>setEditProjData({...editProjData, nome: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descrição</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={editProjData.descricao || ''} onChange={(e)=>setEditProjData({...editProjData, descricao: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Orçamento (R$)</label>
                  <input type="number" className="w-full glass-input text-xs mt-1" value={editProjData.orcamento} onChange={(e)=>setEditProjData({...editProjData, orcamento: parseFloat(e.target.value) || 0})}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={editProjData.status} onChange={(e)=>setEditProjData({...editProjData, status: e.target.value})}>
                    <option value="planejamento">Planejamento</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="pausado">Pausado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>{setShowEditProj(false); setEditProjData(null)}} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTask && editTaskData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleEditTaskSubmit}
            className="w-full max-w-sm glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Editar Tarefa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Título da Tarefa</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={editTaskData.titulo} onChange={(e)=>setEditTaskData({...editTaskData, titulo: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descrição / Detalhes</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={editTaskData.descricao || ''} onChange={(e)=>setEditTaskData({...editTaskData, descricao: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Prioridade</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={editTaskData.prioridade} onChange={(e)=>setEditTaskData({...editTaskData, prioridade: e.target.value})}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</label>
                  <select className="w-full glass-input text-xs mt-1 block" value={editTaskData.status} onChange={(e)=>setEditTaskData({...editTaskData, status: e.target.value as Task['status']})}>
                    <option value="todo">A Fazer</option>
                    <option value="em_andamento">Em Progresso</option>
                    <option value="revisao">Revisão</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>{setShowEditTask(false); setEditTaskData(null)}} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
