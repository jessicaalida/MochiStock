import React, { useState, useMemo } from 'react';
import { ShoppingBag, History, ChevronDown } from 'lucide-react';
import { useProducts, useSales } from '../context/ProductContext';
import { BottomNav } from '../components/BottomNav';
import { PaymentMethod } from '../types';
import { toast } from 'sonner';
import { formatBRL } from '../../lib/format';

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'pix', label: 'Pix', icon: '⚡' },
  { key: 'debito', label: 'Débito', icon: '💳' },
  { key: 'credito', label: 'Crédito', icon: '💳' },
  { key: 'dinheiro', label: 'Dinheiro', icon: '💵' },
];

const paymentLabel: Record<string, string> = {
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
  dinheiro: 'Dinheiro',
};

export function Sales() {
  const { products } = useProducts();
  const { sales, addSale } = useSales();

  const [tab, setTab] = useState<'nova' | 'historico'>('nova');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  const qty = parseFloat(quantity) || 0;
  const disc = parseFloat(discount) || 0;
  const subtotal = selectedProduct ? selectedProduct.price * qty : 0;
  const total = Math.max(0, subtotal - disc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!productId || qty <= 0) {
      toast.error('Selecione um produto e informe a quantidade.');
      return;
    }

    const result = await addSale({ productId, quantity: qty, discount: disc, paymentMethod });
    if (result.success) {
      toast.success(result.message);
      setProductId('');
      setQuantity('');
      setDiscount('');
      setPaymentMethod('pix');
      setSubmitted(false);
    } else {
      toast.error(result.message);
    }
  };

  const inputStyle = {
    background: '#FDF0F5',
    border: '1.5px solid rgba(244,160,192,0.4)',
    color: '#3D1C1C',
  };

  const inputClass = 'w-full px-4 py-4 rounded-2xl text-sm font-medium focus:outline-none transition-all';

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)' }}
    >
      <div className="max-w-[390px] mx-auto">
        {/* Header */}
        <div
          className="px-6 pt-12 pb-6 rounded-b-3xl shadow-md"
          style={{ background: 'linear-gradient(135deg, #E8839E 0%, #C86080 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vendas</h1>
              <p className="text-white/70 text-xs">{sales.length} vendas registradas</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-5">
            {(['nova', 'historico'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: tab === t ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  color: tab === t ? '#E8839E' : 'rgba(255,255,255,0.85)',
                }}
              >
                {t === 'nova' ? '🛍️ Nova Venda' : '📋 Histórico'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-4">
          {tab === 'nova' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selecionar produto */}
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: '#3D1C1C' }}>
                  Produto <span style={{ color: '#D95F5F' }}>*</span>
                </label>
                <div className="relative">
                  <select
                    value={productId}
                    onChange={(e) => { setProductId(e.target.value); setSubmitted(false); }}
                    className={inputClass}
                    style={{
                      ...inputStyle,
                      color: productId ? '#3D1C1C' : '#A07080',
                      appearance: 'none',
                      paddingRight: '3rem',
                    }}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.emoji} {p.name} — Estoque: {p.quantity}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#A07080' }} />
                </div>
                {submitted && !productId && (
                  <p className="text-xs mt-1 ml-2" style={{ color: '#D95F5F' }}>Selecione um produto</p>
                )}
              </div>

              {/* Preço unitário (auto) */}
              {selectedProduct && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{ background: '#F9E4EC', border: '1.5px solid rgba(244,160,192,0.3)' }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#7A4A55' }}>Preço unitário</span>
                  <span className="text-sm font-bold" style={{ color: '#3D1C1C' }}>
                    {formatBRL(selectedProduct.price)}
                  </span>
                </div>
              )}

              {/* Quantidade */}
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: '#3D1C1C' }}>
                  Quantidade <span style={{ color: '#D95F5F' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 2"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
                {selectedProduct && qty > selectedProduct.quantity && (
                  <p className="text-xs mt-1 ml-2" style={{ color: '#D95F5F' }}>
                    Estoque disponível: {selectedProduct.quantity} unidades
                  </p>
                )}
              </div>

              {/* Desconto */}
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: '#3D1C1C' }}>
                  Desconto (R$) <span className="font-normal" style={{ color: '#A07080' }}>opcional</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 2,00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Forma de pagamento */}
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: '#3D1C1C' }}>
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.key}
                      type="button"
                      onClick={() => setPaymentMethod(pm.key)}
                      className="py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: paymentMethod === pm.key ? 'linear-gradient(135deg, #F4A0C0, #E8839E)' : '#FFFFFF',
                        color: paymentMethod === pm.key ? '#FFFFFF' : '#7A4A55',
                        border: `1.5px solid ${paymentMethod === pm.key ? 'transparent' : 'rgba(244,160,192,0.4)'}`,
                        boxShadow: paymentMethod === pm.key ? '0 4px 12px rgba(244,160,192,0.35)' : 'none',
                      }}
                    >
                      <span>{pm.icon}</span>
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              {selectedProduct && qty > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'linear-gradient(135deg, #F9E4EC, #FCEEF5)', border: '1.5px solid rgba(244,160,192,0.3)' }}
                >
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#A07080' }}>
                    <span>Subtotal ({qty} × {formatBRL(selectedProduct.price)})</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                  {disc > 0 && (
                    <div className="flex justify-between text-xs mb-1" style={{ color: '#D95F5F' }}>
                      <span>Desconto</span>
                      <span>- {formatBRL(disc)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'rgba(244,160,192,0.3)' }}>
                    <span className="font-bold" style={{ color: '#3D1C1C' }}>Total</span>
                    <span className="text-xl font-bold" style={{ color: '#3D1C1C' }}>
                      {formatBRL(total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão finalizar */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-bold text-white mt-2 min-h-[56px] flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #E8839E 0%, #C86080 100%)',
                  boxShadow: '0 4px 16px rgba(232,131,158,0.4)',
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                Finalizar Venda
              </button>
            </form>
          ) : (
            /* Histórico de vendas */
            <div className="space-y-3">
              {sales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🛍️</div>
                  <p className="font-medium" style={{ color: '#A07080' }}>Nenhuma venda registrada</p>
                </div>
              ) : (
                sales.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl p-4 shadow-sm"
                    style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: '#F9E4EC' }}
                        >
                          <span className="text-lg">{s.productEmoji || '🍬'}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#3D1C1C' }}>{s.productName}</p>
                          <p className="text-xs" style={{ color: '#A07080' }}>
                            {s.quantity} un. · {formatBRL(s.unitPrice)}/un
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs px-2 py-0.5 rounded-lg font-medium"
                              style={{ background: '#F9E4EC', color: '#7A4A55' }}
                            >
                              {paymentLabel[s.paymentMethod]}
                            </span>
                            {s.discount > 0 && (
                              <span className="text-xs" style={{ color: '#D95F5F' }}>
                                -{formatBRL(s.discount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold" style={{ color: '#3D1C1C' }}>{formatBRL(s.total)}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#A07080' }}>
                          {new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
