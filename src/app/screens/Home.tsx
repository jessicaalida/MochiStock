import React from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Package, TrendingUp, AlertTriangle, Bell, Plus, CalendarClock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProducts, useSales } from '../context/ProductContext';
import { BottomNav } from '../components/BottomNav';
import mochiLogo from '@/imports/Screenshot_2026-06-23_at_20.46.07.png';
import { formatBRL, expiryStatus, expiryLabel } from '../../lib/format';
import { STORE_NAME, STORE_UNIT } from '../../lib/store';

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function isSameMonth(a: Date, b: Date) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function Home() {
  const navigate = useNavigate();
  const { products, isAdmin } = useProducts();
  const { sales } = useSales();

  const today = new Date();

  const vendasHoje = sales
    .filter((s) => isSameDay(new Date(s.date), today))
    .reduce((acc, s) => acc + s.total, 0);

  const faturamentoMes = sales
    .filter((s) => isSameMonth(new Date(s.date), today))
    .reduce((acc, s) => acc + s.total, 0);

  const lowStockProducts = products.filter(
    (p) => p.minStock !== undefined && p.quantity < p.minStock
  );

  const expiryAlerts = products
    .map((p) => ({ product: p, ...expiryStatus(p.expiry) }))
    .filter((e) => e.status !== 'ok')
    .sort((a, b) => a.days - b.days);
  const expiredCount = expiryAlerts.filter((e) => e.status === 'expired').length;
  const totalAlerts = lowStockProducts.length + expiryAlerts.length;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - i));
    const label = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const total = sales
      .filter((s) => isSameDay(new Date(s.date), day))
      .reduce((acc, s) => acc + s.total, 0);
    return { label, total };
  });

  const recentSales = sales.slice(0, 4);

  const paymentLabel: Record<string, string> = {
    pix: 'Pix',
    debito: 'Débito',
    credito: 'Crédito',
    dinheiro: 'Dinheiro',
  };

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
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">{STORE_NAME} · {STORE_UNIT}</p>
              <h1 className="text-2xl font-bold text-white">Dashboard 🏠</h1>
            </div>
            <img src={mochiLogo} alt="Mochi" className="w-14 h-14 object-contain drop-shadow-lg" />
          </div>
          <p className="text-white/70 text-xs">
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="px-4 mt-4 space-y-4">
          {/* KPI cards — row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FDF0F5' }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: '#F4A0C0' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#A07080' }}>Vendas Hoje</span>
              </div>
              <p className="text-xl font-bold" style={{ color: '#3D1C1C' }}>
                {formatBRL(vendasHoje)}
              </p>
            </div>

            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FDF0F5' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#E8839E' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#A07080' }}>Fat. Mês</span>
              </div>
              <p className="text-xl font-bold" style={{ color: '#3D1C1C' }}>
                {formatBRL(faturamentoMes)}
              </p>
            </div>
          </div>

          {/* KPI cards — row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(217,95,95,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FFF0F0' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#D95F5F' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#A07080' }}>Est. Baixo</span>
              </div>
              <p className="text-xl font-bold" style={{ color: lowStockProducts.length > 0 ? '#D95F5F' : '#3D1C1C' }}>
                {lowStockProducts.length}
              </p>
              <p className="text-xs" style={{ color: '#A07080' }}>produtos</p>
            </div>

            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FDF0F5' }}>
                  <Bell className="w-4 h-4" style={{ color: '#F4A0C0' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#A07080' }}>Alertas</span>
              </div>
              <p className="text-xl font-bold" style={{ color: totalAlerts > 0 ? '#D95F5F' : '#3D1C1C' }}>
                {totalAlerts}
              </p>
              <p className="text-xs" style={{ color: '#A07080' }}>estoque e validade</p>
            </div>
          </div>

          {/* Gráfico: Últimos 7 dias */}
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: '#3D1C1C' }}>
              📊 Vendas — últimos 7 dias
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={22}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#A07080' }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [formatBRL(v), 'Total']}
                  contentStyle={{
                    background: '#FFF',
                    border: '1px solid rgba(244,160,192,0.4)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`home-bar-${index}`}
                      fill={index === chartData.length - 1 ? '#E8839E' : '#F4A0C0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas de validade */}
          {expiryAlerts.length > 0 && (
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{
                background: expiredCount > 0 ? '#FFF5F5' : '#FFF8EC',
                border: `1.5px solid ${expiredCount > 0 ? 'rgba(194,65,65,0.25)' : 'rgba(180,83,9,0.25)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold flex items-center gap-2" style={{ color: expiredCount > 0 ? '#C24141' : '#B45309' }}>
                  <CalendarClock className="w-4 h-4" />
                  Alertas de Validade
                </p>
                <button
                  onClick={() => navigate(`/inventory?filtro=${expiredCount > 0 ? 'vencidos' : 'vencendo'}&ordem=validade`)}
                  className="text-xs font-semibold underline"
                  style={{ color: '#7A4A55' }}
                >
                  Ver no estoque
                </button>
              </div>
              <div className="space-y-2">
                {expiryAlerts.slice(0, 4).map(({ product: p, status }) => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{p.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#3D1C1C' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: '#A07080' }}>
                          Val: {p.expiry} · {p.quantity} un.
                        </p>
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs px-2 py-1 rounded-lg font-semibold"
                      style={
                        status === 'expired'
                          ? { background: '#FFE0E0', color: '#C24141' }
                          : { background: '#FFF1DC', color: '#B45309' }
                      }
                    >
                      {expiryLabel(p.expiry)}
                    </span>
                  </div>
                ))}
                {expiryAlerts.length > 4 && (
                  <p className="text-xs" style={{ color: '#A07080' }}>
                    + {expiryAlerts.length - 4} produto(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Alertas de estoque baixo */}
          {lowStockProducts.length > 0 && (
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: '#FFF5F5', border: '1.5px solid rgba(217,95,95,0.25)' }}
            >
              <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#D95F5F' }}>
                <AlertTriangle className="w-4 h-4" />
                Alertas de Reposição
              </p>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#3D1C1C' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: '#A07080' }}>
                          {p.quantity} / {p.minStock} un.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/inventory?filtro=baixo')}
                      className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                      style={{ background: '#D95F5F', color: '#FFF' }}
                    >
                      Repor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas vendas */}
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: '#3D1C1C' }}>🛍️ Últimas Vendas</p>
              <button
                onClick={() => navigate('/sales')}
                className="text-xs font-semibold"
                style={{ color: '#F4A0C0' }}
              >
                Ver todas
              </button>
            </div>
            {recentSales.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: '#A07080' }}>
                Nenhuma venda registrada
              </p>
            ) : (
              <div className="space-y-2">
                {recentSales.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: 'rgba(244,160,192,0.2)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.productEmoji}</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#3D1C1C' }}>{s.productName}</p>
                        <p className="text-xs" style={{ color: '#A07080' }}>
                          {s.quantity} un. · {paymentLabel[s.paymentMethod]}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#3D1C1C' }}>
                      {formatBRL(s.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <button
              onClick={() => navigate('/sales')}
              className="py-4 rounded-2xl font-bold text-white flex flex-col items-center gap-1 transition-all"
              style={{ background: 'linear-gradient(135deg, #F4A0C0 0%, #E8839E 100%)', boxShadow: '0 4px 12px rgba(244,160,192,0.4)' }}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs">Nova Venda</span>
            </button>
            <button
              onClick={() => navigate(isAdmin ? '/new' : '/inventory')}
              className="py-4 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.4)', color: '#3D1C1C' }}
            >
              {isAdmin ? (
                <Plus className="w-5 h-5" style={{ color: '#F4A0C0' }} />
              ) : (
                <Package className="w-5 h-5" style={{ color: '#F4A0C0' }} />
              )}
              <span className="text-xs">{isAdmin ? 'Novo Produto' : 'Ver Estoque'}</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
