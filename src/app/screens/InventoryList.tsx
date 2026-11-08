import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, Plus, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { BottomNav } from '../components/BottomNav';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { toast } from 'sonner';
import { expiryStatus, daysUntilExpiry, EXPIRY_WARNING_DAYS } from '../../lib/format';

type Filter = 'todos' | 'vencidos' | 'vencendo' | 'baixo';
type Sort = 'nome' | 'validade';

export function InventoryList() {
  const navigate = useNavigate();
  const { products, deleteProduct, requestReplenishment } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [replenishProduct, setReplenishProduct] = useState<Product | null>(null);

  const filterParam = searchParams.get('filtro') as Filter | null;
  const filter: Filter = filterParam && ['vencidos', 'vencendo', 'baixo'].includes(filterParam) ? filterParam : 'todos';
  const sort: Sort = searchParams.get('ordem') === 'validade' ? 'validade' : 'nome';

  const updateParams = (next: { filtro?: Filter; ordem?: Sort }) => {
    const f = next.filtro ?? filter;
    const o = next.ordem ?? sort;
    const params: Record<string, string> = {};
    if (f !== 'todos') params.filtro = f;
    if (o !== 'nome') params.ordem = o;
    setSearchParams(params, { replace: true });
  };

  const isLow = (p: Product) => p.minStock !== undefined && p.quantity < p.minStock;
  const expiredCount = products.filter((p) => expiryStatus(p.expiry).status === 'expired').length;
  const expiringCount = products.filter((p) => expiryStatus(p.expiry).status === 'soon').length;
  const lowStockCount = products.filter(isLow).length;

  const term = searchTerm.toLowerCase();
  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
    .filter((p) => {
      if (filter === 'vencidos') return expiryStatus(p.expiry).status === 'expired';
      if (filter === 'vencendo') return expiryStatus(p.expiry).status === 'soon';
      if (filter === 'baixo') return isLow(p);
      return true;
    })
    .sort((a, b) =>
      sort === 'validade'
        ? daysUntilExpiry(a.expiry) - daysUntilExpiry(b.expiry)
        : a.name.localeCompare(b.name, 'pt-BR')
    );

  const chips: { key: Filter; label: string; count?: number; color?: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'vencidos', label: 'Vencidos', count: expiredCount, color: '#C24141' },
    { key: 'vencendo', label: `Vencendo (${EXPIRY_WARNING_DAYS}d)`, count: expiringCount, color: '#B45309' },
    { key: 'baixo', label: 'Estoque baixo', count: lowStockCount, color: '#D95F5F' },
  ];

  const handleEdit = (product: Product) => navigate(`/edit/${product.id}`);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      const result = await deleteProduct(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    }
  };

  const handleReplenishmentRequest = (product: Product) => {
    setReplenishProduct(product);
  };

  const handleConfirmReplenishment = async () => {
    if (!replenishProduct) return;
    const result = await requestReplenishment(replenishProduct.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setReplenishProduct(null);
  };

  const suggestedQty = replenishProduct
    ? Math.max((replenishProduct.minStock ?? 0) - replenishProduct.quantity + 10, 10)
    : 0;

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)' }}
    >
      <div className="max-w-[390px] mx-auto">
        {/* Header */}
        <div
          className="px-6 pt-12 pb-6 rounded-b-3xl shadow-md"
          style={{ background: 'linear-gradient(135deg, #F4A0C0 0%, #E8839E 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                <span className="text-white text-lg">📦</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Estoque</h1>
                {lowStockCount > 0 && (
                  <p className="text-white/80 text-xs">{lowStockCount} produto(s) com estoque baixo ⚠️</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/new')}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.25)' }}
              aria-label="Novo Produto"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A07080' }} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl focus:outline-none text-sm font-medium"
              style={{ background: '#FFFFFF', color: '#3D1C1C' }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="px-4 mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center shadow-sm" style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}>
            <p className="text-lg font-bold" style={{ color: '#F4A0C0' }}>{products.length}</p>
            <p className="text-xs" style={{ color: '#A07080' }}>Produtos</p>
          </div>
          <div className="rounded-2xl p-3 text-center shadow-sm" style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}>
            <p className="text-lg font-bold" style={{ color: '#3D1C1C' }}>
              {new Set(products.map((p) => p.category)).size}
            </p>
            <p className="text-xs" style={{ color: '#A07080' }}>Categorias</p>
          </div>
          <div
            className="rounded-2xl p-3 text-center shadow-sm"
            style={{ background: lowStockCount > 0 ? '#FFF5F5' : '#FFFFFF', border: `1.5px solid ${lowStockCount > 0 ? 'rgba(217,95,95,0.3)' : 'rgba(244,160,192,0.2)'}` }}
          >
            <p className="text-lg font-bold" style={{ color: lowStockCount > 0 ? '#D95F5F' : '#3D1C1C' }}>{lowStockCount}</p>
            <p className="text-xs" style={{ color: '#A07080' }}>Est. Baixo</p>
          </div>
        </div>

        {/* Filtros e ordenação */}
        <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {chips.map((c) => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => updateParams({ filtro: c.key })}
                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: active ? (c.color ?? '#E8839E') : '#FFFFFF',
                  color: active ? '#FFFFFF' : (c.color ?? '#7A4A55'),
                  border: `1.5px solid ${active ? 'transparent' : 'rgba(244,160,192,0.35)'}`,
                }}
              >
                {c.label}
                {c.count !== undefined && ` · ${c.count}`}
              </button>
            );
          })}
        </div>
        <div className="px-4 mt-2 flex items-center justify-end gap-2 text-xs" style={{ color: '#A07080' }}>
          <span>Ordenar por:</span>
          {(['nome', 'validade'] as Sort[]).map((o) => (
            <button
              key={o}
              onClick={() => updateParams({ ordem: o })}
              className="font-semibold px-2 py-1 rounded-lg"
              style={{
                background: sort === o ? '#F9E4EC' : 'transparent',
                color: sort === o ? '#3D1C1C' : '#A07080',
              }}
            >
              {o === 'nome' ? 'Nome' : 'Validade'}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="px-4 mt-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍡</div>
              <p className="font-medium" style={{ color: '#A07080' }}>
                {searchTerm || filter !== 'todos' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </p>
              {filter !== 'todos' && (
                <button
                  onClick={() => updateParams({ filtro: 'todos' })}
                  className="mt-3 text-xs font-semibold underline"
                  style={{ color: '#E8839E' }}
                >
                  Ver todos os produtos
                </button>
              )}
              {!searchTerm && filter === 'todos' && (
                <button
                  onClick={() => navigate('/new')}
                  className="mt-4 px-6 py-3 rounded-2xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F4A0C0, #E8839E)' }}
                >
                  Cadastrar primeiro produto
                </button>
              )}
            </div>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReplenishment={handleReplenishmentRequest}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal de reposição */}
      {replenishProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(61,28,28,0.45)' }}
          onClick={() => setReplenishProduct(null)}
        >
          <div
            className="w-full max-w-[390px] rounded-t-3xl p-6 shadow-2xl"
            style={{ background: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1.5 rounded-full mx-auto mb-4" style={{ background: '#F9E4EC' }} />

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#3D1C1C' }}>Solicitar Reposição</h3>
              <button
                onClick={() => setReplenishProduct(null)}
                className="p-2 rounded-xl"
                style={{ background: '#F9E4EC' }}
              >
                <X className="w-4 h-4" style={{ color: '#A07080' }} />
              </button>
            </div>

            {/* Product info */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl" style={{ background: '#F9E4EC' }}>
              <span className="text-3xl">{replenishProduct.emoji}</span>
              <div>
                <p className="font-bold" style={{ color: '#3D1C1C' }}>{replenishProduct.name}</p>
                <p className="text-sm" style={{ color: '#A07080' }}>{replenishProduct.category}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Quantidade atual', value: `${replenishProduct.quantity} unidades`, color: replenishProduct.quantity < (replenishProduct.minStock ?? 0) ? '#D95F5F' : '#3D1C1C' },
                { label: 'Estoque mínimo', value: `${replenishProduct.minStock ?? 0} unidades`, color: '#3D1C1C' },
                { label: 'Quantidade sugerida para reposição', value: `${suggestedQty} unidades`, color: '#F4A0C0', bold: true },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: '#FDF0F5', border: '1px solid rgba(244,160,192,0.2)' }}
                >
                  <span className="text-sm" style={{ color: '#7A4A55' }}>{row.label}</span>
                  <span className={`text-sm ${row.bold ? 'font-bold' : 'font-semibold'}`} style={{ color: row.color }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center mb-4" style={{ color: '#A07080' }}>
              Esta solicitação será registrada e não altera automaticamente o estoque.
            </p>

            <button
              onClick={handleConfirmReplenishment}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #F4A0C0 0%, #E8839E 100%)',
                boxShadow: '0 4px 16px rgba(244,160,192,0.4)',
              }}
            >
              📦 Confirmar Solicitação
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
