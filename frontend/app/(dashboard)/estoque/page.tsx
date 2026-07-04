'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Info,
  DollarSign,
  Layers,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { ViewToggle } from '@/components/shared/view-toggle';

interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoria_id: string | null;
  unidade: string;
  preco_custo: number;
  preco_venda: number;
  margem_lucro: number;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  localizacao: string | null;
}

interface Categoria {
  id: string;
  nome: string;
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAjuste, setShowAjuste] = useState(false);
  const [selectedProdForAjuste, setSelectedProdForAjuste] = useState<Produto | null>(null);
  const [qtyAjuste, setQtyAjuste] = useState(0);
  const [motivoAjuste, setMotivoAjuste] = useState('Ajuste manual');

  // New product form fields
  const [newProduct, setNewProduct] = useState({
    codigo: '', nome: '', descricao: '', categoria_id: '', unidade: 'UN',
    preco_custo: 0, preco_venda: 0, estoque_inicial: 0, estoque_minimo: 2, estoque_maximo: 100,
    localizacao: ''
  });

  const loadEstoqueData = async () => {
    setLoading(true);
    try {
      let url = `/estoque/produtos?search=${encodeURIComponent(search)}`;
      if (selectedCat) url += `&categoria_id=${selectedCat}`;
      if (onlyCritical) url += `&estoque_critico=true`;

      const [prodsData, catsData] = await Promise.all([
        api.get<Produto[]>(url),
        api.get<Categoria[]>('/estoque/categorias')
      ]);

      setProdutos(prodsData);
      setCategorias(catsData);
    } catch (e) {
      console.error('Failed to load inventory data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstoqueData();
  }, [selectedCat, onlyCritical]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEstoqueData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/estoque/produtos', newProduct);
      setShowAddProduct(false);
      setNewProduct({
        codigo: '', nome: '', descricao: '', categoria_id: '', unidade: 'UN',
        preco_custo: 0, preco_venda: 0, estoque_inicial: 0, estoque_minimo: 2, estoque_maximo: 100,
        localizacao: ''
      });
      loadEstoqueData();
    } catch (err) {
      alert('Erro ao cadastrar produto.');
    }
  };

  const handleAjusteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdForAjuste) return;
    try {
      await api.post(`/estoque/produtos/${selectedProdForAjuste.id}/ajuste-estoque?quantidade=${qtyAjuste}&motivo=${encodeURIComponent(motivoAjuste)}`, {});
      setShowAjuste(false);
      setSelectedProdForAjuste(null);
      setQtyAjuste(0);
      setMotivoAjuste('Ajuste manual');
      loadEstoqueData();
    } catch (err) {
      alert('Erro ao ajustar estoque.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Upper header banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Controle de Estoque
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de produtos, controle de níveis críticos, localização física e inventário.
          </p>
        </div>

        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer transition-colors"
        >
          <Plus size={15} />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Control Actions Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/20 p-4 rounded-2xl border border-slate-800/40">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por código ou descrição de produto..."
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

        {/* Filters */}
        <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
          <select 
            className="glass-input text-xs py-2 pr-8"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="">Todas Categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>

          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              onlyCritical 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Estoque Crítico</span>
          </button>
        </div>
      </div>

      {/* Products list display grid */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : produtos.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Package className="mx-auto text-slate-500 mb-3" size={32} />
          <h3 className="text-sm font-semibold text-white">Nenhum produto em estoque</h3>
          <p className="text-xs text-slate-400 mt-1">Cadastre novos produtos ou limpe os filtros para ver listagens.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/40">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Código</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Produto</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Descrição</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Preço Venda</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Margem</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Estoque</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-semibold tracking-wider uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const isLow = p.estoque_atual <= p.estoque_minimo;
                  return (
                    <tr key={p.id} className={`border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors ${isLow ? 'bg-rose-500/5' : ''}`}>
                      <td className="py-3 px-4 text-indigo-400 font-mono font-semibold">{p.codigo}</td>
                      <td className="py-3 px-4 text-white font-semibold">{p.nome}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">{p.descricao || '-'}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">{formatCurrency(p.preco_venda)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono">{p.margem_lucro}%</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-semibold ${isLow ? 'text-rose-400' : 'text-white'}`}>
                          {p.estoque_atual} {p.unidade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                            <AlertTriangle size={10} /> CRÍTICO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => { setSelectedProdForAjuste(p); setQtyAjuste(0); setShowAjuste(true); }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-850 cursor-pointer"
                        >
                          Ajustar
                        </button>
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
          {produtos.map((p) => {
            const isLow = p.estoque_atual <= p.estoque_minimo;
            return (
              <div 
                key={p.id} 
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border-slate-800/80 ${
                  isLow ? 'border-rose-500/20 shadow-lg shadow-rose-500/5' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-indigo-400 font-mono font-semibold">{p.codigo}</span>
                    {isLow && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 animate-pulse">
                        <AlertTriangle size={10} /> CRÍTICO
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm tracking-tight line-clamp-1">{p.nome}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 h-8">{p.descricao || 'Sem descrição.'}</p>
                </div>

                <div className="my-4 grid grid-cols-2 gap-2 text-xs border-y border-slate-800/40 py-3">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Preço Venda</span>
                    <span className="text-white font-semibold font-mono">{formatCurrency(p.preco_venda)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Margem Lucro</span>
                    <span className="text-emerald-400 font-semibold font-mono">{p.margem_lucro}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Saldo Atual</span>
                    <p className="text-sm font-bold text-white font-mono">{p.estoque_atual} {p.unidade}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedProdForAjuste(p); setQtyAjuste(0); setShowAjuste(true); }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-850 cursor-pointer"
                  >
                    Ajustar Saldo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateProduct}
            className="w-full max-w-lg glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-md font-bold text-white mb-2">Cadastrar Novo Produto</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Código SKU</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" placeholder="EX: PROD001" value={newProduct.codigo} onChange={(e)=>setNewProduct({...newProduct, codigo: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Produto</label>
                <input required type="text" className="w-full glass-input text-xs mt-1" value={newProduct.nome} onChange={(e)=>setNewProduct({...newProduct, nome: e.target.value})}/>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descrição</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newProduct.descricao} onChange={(e)=>setNewProduct({...newProduct, descricao: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Categoria</label>
                <select className="w-full glass-input text-xs mt-1 block" value={newProduct.categoria_id} onChange={(e)=>setNewProduct({...newProduct, categoria_id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Unidade Medida</label>
                <input type="text" className="w-full glass-input text-xs mt-1" value={newProduct.unidade} onChange={(e)=>setNewProduct({...newProduct, unidade: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Preço Custo (R$)</label>
                <input type="number" step="any" className="w-full glass-input text-xs mt-1" value={newProduct.preco_custo} onChange={(e)=>setNewProduct({...newProduct, preco_custo: parseFloat(e.target.value) || 0})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Preço Venda (R$)</label>
                <input type="number" step="any" className="w-full glass-input text-xs mt-1" value={newProduct.preco_venda} onChange={(e)=>setNewProduct({...newProduct, preco_venda: parseFloat(e.target.value) || 0})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estoque Inicial</label>
                <input type="number" className="w-full glass-input text-xs mt-1" value={newProduct.estoque_inicial} onChange={(e)=>setNewProduct({...newProduct, estoque_inicial: parseFloat(e.target.value) || 0})}/>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estoque Mínimo</label>
                <input type="number" className="w-full glass-input text-xs mt-1" value={newProduct.estoque_minimo} onChange={(e)=>setNewProduct({...newProduct, estoque_minimo: parseFloat(e.target.value) || 0})}/>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowAddProduct(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Adjust Inventory Modal */}
      {showAjuste && selectedProdForAjuste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleAjusteSubmit}
            className="w-full max-w-sm glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <h3 className="text-md font-bold text-white mb-2">Ajuste de Estoque</h3>
            <p className="text-xs text-slate-400">
              Produto: <span className="font-semibold text-white">{selectedProdForAjuste.nome}</span><br/>
              Saldo Atual: <span className="font-semibold text-white">{selectedProdForAjuste.estoque_atual}</span>
            </p>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Quantidade de Ajuste (Use negativo para saídas)
              </label>
              <input 
                required 
                type="number" 
                className="w-full glass-input text-xs mt-1"
                placeholder="Ex: -5 ou 10"
                value={qtyAjuste}
                onChange={(e) => setQtyAjuste(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Motivo</label>
              <input 
                type="text" 
                className="w-full glass-input text-xs mt-1"
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>{setShowAjuste(false); setSelectedProdForAjuste(null);}} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Ajustar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
