'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect
    if (localStorage.getItem('access_token')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data: any = await api.post('/auth/login', { email, password });
      
      // Save credentials in storage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A13] relative overflow-hidden px-4">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />

      {/* Login Box */}
      <div className="w-full max-w-md glass-panel bg-[#0B0F19]/65 p-8 rounded-3xl relative z-10 border border-white/[0.06] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Acesse o Sistema</h2>
          <p className="text-xs text-slate-400 mt-1.5 text-center">
            Bem-vindo ao ERP Moderno. Entre com suas credenciais.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type="email"
                required
                className="w-full glass-input pl-10 text-sm"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              Senha de acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type="password"
                required
                className="w-full glass-input pl-10 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Suggestion */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-2">Acesso Demo</p>
          <p className="text-xs text-slate-400">
            Email: <code className="text-indigo-400 font-semibold">admin@erp.com</code>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Senha: <code className="text-indigo-400 font-semibold">Admin@123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
