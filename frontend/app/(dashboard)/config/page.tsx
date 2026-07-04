'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Check, 
  Sliders, 
  Lock, 
  UserCheck, 
  Settings,
  AlertCircle,
  Eye,
  Plus,
  Edit2,
  Trash
} from 'lucide-react';

interface PermissaoMatriz {
  roleName: string;
  roleKey: string;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
  aprovar: boolean;
}

export default function ConfigPage() {
  const [matrix, setMatrix] = useState<PermissaoMatriz[]>([
    { roleName: 'Administrador', roleKey: 'admin', visualizar: true, criar: true, editar: true, excluir: true, aprovar: true },
    { roleName: 'Diretor', roleKey: 'director', visualizar: true, criar: true, editar: true, excluir: true, aprovar: true },
    { roleName: 'Gerente', roleKey: 'manager', visualizar: true, criar: true, editar: true, excluir: false, aprovar: true },
    { roleName: 'Financeiro', roleKey: 'financial', visualizar: true, criar: true, editar: true, excluir: false, aprovar: true },
    { roleName: 'Comprador', roleKey: 'buyer', visualizar: true, criar: true, editar: true, excluir: false, aprovar: false },
    { roleName: 'Vendedor', roleKey: 'seller', visualizar: true, criar: true, editar: true, excluir: false, aprovar: false },
    { roleName: 'RH', roleKey: 'hr', visualizar: true, criar: true, editar: true, excluir: false, aprovar: true },
    { roleName: 'Operador', roleKey: 'operator', visualizar: true, criar: false, editar: false, excluir: false, aprovar: false }
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (roleKey: string, field: keyof Omit<PermissaoMatriz, 'roleName' | 'roleKey'>) => {
    setMatrix(matrix.map(row => {
      if (row.roleKey === roleKey) {
        return {
          ...row,
          [field]: !row[field]
        };
      }
      return row;
    }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            Configurações do Sistema
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Definições de controle de acesso (RBAC), chaves de segurança e perfil de empresa.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer transition-colors"
        >
          <Check size={15} />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          Configurações de permissão atualizadas com sucesso para o banco de dados.
        </div>
      )}

      {/* Grid panels */}
      <div className="grid grid-cols-1 gap-6">
        {/* RBAC Table Matrix Card */}
        <div className="glass-panel p-5 rounded-2xl border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Controle de Acesso Baseado em Função (RBAC)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Defina o que cada nível hierárquico pode visualizar ou operar.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="px-5 py-4">Perfil / Função</th>
                  <th className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1"><Eye size={12}/> Visualizar</span></th>
                  <th className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1"><Plus size={12}/> Criar</span></th>
                  <th className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1"><Edit2 size={12}/> Editar</span></th>
                  <th className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1"><Trash size={12}/> Excluir</span></th>
                  <th className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1"><UserCheck size={12}/> Aprovar</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                {matrix.map((row) => (
                  <tr key={row.roleKey} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 text-slate-800 dark:text-white font-semibold">{row.roleName}</td>
                    
                    {/* Visualizar */}
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={row.visualizar} 
                        onChange={() => handleToggle(row.roleKey, 'visualizar')}
                        className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-900 rounded border-slate-300 dark:border-slate-800 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Criar */}
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={row.criar} 
                        onChange={() => handleToggle(row.roleKey, 'criar')}
                        className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-900 rounded border-slate-300 dark:border-slate-800 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Editar */}
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={row.editar} 
                        onChange={() => handleToggle(row.roleKey, 'editar')}
                        className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-900 rounded border-slate-300 dark:border-slate-800 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Excluir */}
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={row.excluir} 
                        onChange={() => handleToggle(row.roleKey, 'excluir')}
                        className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-900 rounded border-slate-300 dark:border-slate-800 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Aprovar */}
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={row.aprovar} 
                        onChange={() => handleToggle(row.roleKey, 'aprovar')}
                        className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-900 rounded border-slate-300 dark:border-slate-800 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Security settings details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border-slate-200 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Chaves de API & Integrações</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Gerencie as conexões externas de APIs integradas ao faturamento SaaS.</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Mercado Pago / Stripe Webhook</label>
                <input readOnly type="text" className="w-full glass-input text-xs mt-1 bg-white/40 dark:bg-slate-950/20 text-slate-500 select-all" value="https://api.empresa.com/v1/integracao/stripe/webhook" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Chave JWT de Criptografia</label>
                <input readOnly type="password" className="w-full glass-input text-xs mt-1 bg-white/40 dark:bg-slate-950/20 text-slate-500" value="super-secret-jwt-signature-key-goes-here" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-slate-200 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Backup Automático do Banco</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Backup programado e logs de exportação local do banco de dados SQLite.</p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Status do Database</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Último backup: Hoje, às 03:00 AM</p>
              </div>
              <button className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer">
                Forçar Backup Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
