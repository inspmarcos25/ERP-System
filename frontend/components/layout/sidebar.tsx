'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  FolderGit2,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Usuário');
  const [userRole, setUserRole] = useState('Operador');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name || 'Usuário');
        setUserRole(u.role || 'Operador');
      } catch (e) {}
    }
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'CRM (Clientes/Leads)', icon: Users, path: '/crm' },
    { name: 'Vendas', icon: ShoppingCart, path: '/vendas' },
    { name: 'Estoque', icon: Package, path: '/estoque' },
    { name: 'Financeiro', icon: DollarSign, path: '/financeiro' },
    { name: 'Projetos', icon: FolderGit2, path: '/projetos' },
    { name: 'RH / Funcionários', icon: Briefcase, path: '/rh' },
    { name: 'Configurações', icon: Settings, path: '/config' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside
      className={`glass-panel h-screen fixed left-0 top-0 z-40 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-[var(--sidebar-bg)] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                ERP Empresarial
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer hidden md:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white'}`} />
                {!collapsed && (
                  <span className="text-sm font-medium tracking-wide">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">{userRole}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 cursor-help" title={`${userName} (${userRole})`}>
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 border border-transparent cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
