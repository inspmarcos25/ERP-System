'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Tag,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface PedidoItem {
  id?: string;
  produto_id: string;
  produto_nome?: string;
  quantidade: number;
  preco_unitario: number;
  desconto: number;
  total: number;
}

interface Pedido {
  id: string;
  numero: string;
  cliente_id: string;
  status: string;
  subtotal: number;
  desconto: number;
  total: number;
  data_pedido: string;
  forma_pagamento: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  preco_venda: number;
}

export default function VendasPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPedido, setShowAddPedido] = useState(false);

  // Lists for dropdown selectors
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // New order form fields
  const [selectedCliente, setSelectedCliente] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [orderItems, setOrderItems] = useState<PedidoItem[]>([]);

  // Current item builder fields
  const [currentProdutoId, setCurrentProdutoId] = useState('');
  const [currentQty, setCurrentQty] = useState(1);
  const [currentDiscount, setCurrentDiscount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const orders = await api.get<Pedido[]>('/vendas/pedidos');
      setPedidos(orders);

      // Pre-load clients and products for selectors
      const clientsList = await api.get<Cliente[]>('/crm/clientes');
      const productsList = await api.get<Produto[]>('/estoque/produtos');
      setClientes(clientsList);
      setProdutos(productsList);
    } catch (e) {
      console.error('Failed to load Sales modules data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    if (!currentProdutoId) return;
    const prod = produtos.find(p => p.id === currentProdutoId);
    if (!prod) return;

    const unitPrice = prod.preco_venda;
    const itemTotal = (currentQty * unitPrice) - currentDiscount;

    const newItem: PedidoItem = {
      produto_id: currentProdutoId,
      produto_nome: prod.nome,
      quantidade: currentQty,
      preco_unitario: unitPrice,
      desconto: currentDiscount,
      total: itemTotal
    };

    setOrderItems([...orderItems, newItem]);
    
    // reset builder inputs
    setCurrentProdutoId('');
    setCurrentQty(1);
    setCurrentDiscount(0);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) {
      alert('Selecione um cliente.');
      return;
    }
    if (orderItems.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    try {
      const payload = {
        cliente_id: selectedCliente,
        forma_pagamento: formaPagamento,
        observacoes,
        itens: orderItems.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          desconto: item.desconto
        }))
      };

      await api.post('/vendas/pedidos', payload);
      
      // Reset form states
      setShowAddPedido(false);
      setSelectedCliente('');
      setFormaPagamento('PIX');
      setObservacoes('');
      setOrderItems([]);
      
      loadData();
    } catch (err) {
      alert('Erro ao processar pedido de venda.');
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((acc, item) => acc + item.total, 0);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregue':
      case 'aprovado':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'pendente':
      case 'em_producao':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'cancelado':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Vendas & Pedidos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Faturamento, controle de orçamentos e registro de novos pedidos de venda.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddPedido(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer transition-colors"
        >
          <Plus size={15} />
          <span>Novo Pedido</span>
        </button>
      </div>

      {/* Orders List Table Card */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <AlertCircle className="mx-auto text-slate-500 mb-3" size={32} />
          <h3 className="text-sm font-semibold text-white">Nenhum pedido de venda</h3>
          <p className="text-xs text-slate-400 mt-1">Crie um novo pedido para começar a registrar faturamento.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="px-5 py-4">Número</th>
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Forma Pagto</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 text-white font-semibold">{p.numero}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {new Date(p.data_pedido).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-slate-400">{p.forma_pagamento}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-emerald-400 font-bold font-mono">
                      {formatCurrency(p.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Order Dialog */}
      {showAddPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateOrder}
            className="w-full max-w-2xl glass-panel bg-[#0B0F19] p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-md font-bold text-white mb-2">Novo Pedido de Venda</h3>
            
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cliente</label>
                <select 
                  required
                  className="w-full glass-input text-xs mt-1 block"
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Forma de Pagamento</label>
                <select 
                  className="w-full glass-input text-xs mt-1 block"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Cartão">Cartão de Crédito</option>
                  <option value="Transferência">TED / DOC</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Observações</label>
                <input 
                  type="text" 
                  className="w-full glass-input text-xs mt-1"
                  placeholder="Ex: Entrega urgente"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </div>

            {/* Item Builder Box */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-semibold text-white">Adicionar Itens ao Pedido</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[9px] text-slate-400 font-semibold uppercase">Produto</label>
                  <select
                    className="w-full glass-input text-xs mt-1 block"
                    value={currentProdutoId}
                    onChange={(e) => setCurrentProdutoId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - ({formatCurrency(p.preco_venda)})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold uppercase">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full glass-input text-xs mt-1"
                    value={currentQty}
                    onChange={(e) => setCurrentQty(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold uppercase">Desconto (R$)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full glass-input text-xs mt-1"
                    value={currentDiscount}
                    onChange={(e) => setCurrentDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                + Adicionar Item
              </button>
            </div>

            {/* Current Items List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold pl-1">Itens Adicionados</p>
              {orderItems.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">Nenhum item adicionado.</p>
              ) : (
                orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/40 border border-slate-800/50 text-xs">
                    <div className="truncate pr-4">
                      <p className="font-semibold text-white truncate">{item.produto_nome}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantidade} x {formatCurrency(item.preco_unitario)} (Desc: {formatCurrency(item.desconto)})</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-white font-mono">{formatCurrency(item.total)}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Row */}
            <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Valor Total do Pedido</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(calculateSubtotal())}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddPedido(false)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer">Confirmar Pedido</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
