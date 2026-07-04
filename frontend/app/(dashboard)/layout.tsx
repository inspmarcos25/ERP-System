'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import GlobalSearch from '@/components/shared/global-search';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`min-h-screen flex flex-col pt-16 transition-all duration-300 ease-in-out ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Header collapsed={collapsed} onSearchClick={() => setSearchOpen(true)} />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
