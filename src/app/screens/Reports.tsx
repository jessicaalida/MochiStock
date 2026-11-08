import React, { useState, useMemo } from 'react';
import { FileText, Download, TrendingUp, ShoppingBag, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProducts, useSales } from '../context/ProductContext';
import { BottomNav } from '../components/BottomNav';
import { Sale } from '../types';
import { formatBRL } from '../../lib/format';

type Period = '7d' | '30d' | 'custom';

const lojas = ['Todas as Lojas', 'Unidade Centro', 'Unidade Norte', 'Unidade Sul'];

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function filterByPeriod(sales: Sale[], period: Period, startDate: string, endDate: string): Sale[] {
  const now = new Date();
  return sales.filter((s) => {
    const d = new Date(s.date);
    if (period === '7d') {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
      return d >= cutoff;
    }
    if (period === '30d') {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      return d >= cutoff;
    }
    if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      return d >= start && d <= end;
    }
    return true;
  });
}

function getDailyData(sales: Sale[], days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (days - 1 - i));
    const label = day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const total = sales
      .filter((s) => isSameDay(new Date(s.date), day))
      .reduce((acc, s) => acc + s.total, 0);
    return { label, total };
  });
}

function getTopProducts(sales: Sale[]) {
  const map: Record<string, { name: string; emoji?: string; qty: number; revenue: number }> = {};
  for (const s of sales) {
    if (!map[s.productId]) {
      map[s.productId] = { name: s.productName, emoji: s.productEmoji, qty: 0, revenue: 0 };
    }
    map[s.productId].qty += s.quantity;
    map[s.productId].revenue += s.total;
  }
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
}

export function Reports() {
  const { products } = useProducts();
  const { sales } = useSales();

  const [period, setPeriod] = useState<Period>('7d');
  const [loja, setLoja] = useState('Todas as Lojas');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => filterByPeriod(sales, period, startDate, endDate), [sales, period, startDate, endDate]);

  const faturamento = filtered.reduce((acc, s) => acc + s.total, 0);
  const qtdVendas = filtered.length;
  const lowStockCount = products.filter((p) => p.minStock !== undefined && p.quantity < p.minStock).length;

  const days = period === '30d' ? 14 : 7;
  const chartData = getDailyData(filtered, days);
  const topProducts = getTopProducts(filtered);

  const handleExportPDF = () => {
    const topList = topProducts.slice(0, 5).map((p, i) =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #f0d0e0;">${i + 1}. ${p.emoji || ''} ${p.name}</td>
        <td style="padding:8px;border-bottom:1px solid #f0d0e0;text-align:center;">${p.qty} un.</td>
        <td style="padding:8px;border-bottom:1px solid #f0d0e0;text-align:right;font-weight:bold;">${formatBRL(p.revenue)}</td>
      </tr>`
    ).join('');

    const lowList = products
      .filter((p) => p.minStock !== undefined && p.quantity < p.minStock)
      .map((p) => `<li>${p.emoji || ''} ${p.name}: ${p.quantity} un. (mín: ${p.minStock})</li>`)
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Relatório MochiMochi Candy Store</title>
  <style>
    body{font-family:Arial,sans-serif;padding:32px;color:#3D1C1C;background:#fff;}
    h1{color:#F4A0C0;margin-bottom:4px;font-size:24px;}
    h2{color:#E8839E;font-size:16px;margin-top:24px;margin-bottom:8px;}
    .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;}
    .kpi{border:1.5px solid #F4A0C0;border-radius:12px;padding:16px;text-align:center;}
    .kpi-value{font-size:20px;font-weight:bold;color:#3D1C1C;}
    .kpi-label{font-size:11px;color:#A07080;margin-top:4px;}
    table{width:100%;border-collapse:collapse;margin-top:8px;}
    th{background:#F9E4EC;padding:8px;text-align:left;font-size:12px;}
    ul{margin:0;padding-left:20px;color:#7A4A55;}
    .footer{margin-top:32px;font-size:11px;color:#C0A0B0;text-align:center;}
    @media print{body{padding:16px;}}
  </style>
</head>
<body>
  <h1>🍡 MochiMochi Candy Store</h1>
  <p style="color:#A07080;font-size:13px;">
    Relatório — ${period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : `${startDate} a ${endDate}`}<br/>
    Loja: ${loja} · Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
  </p>
  <h2>📊 Indicadores</h2>
  <div class="kpis">
    <div class="kpi"><div class="kpi-value">${formatBRL(faturamento)}</div><div class="kpi-label">Faturamento Total</div></div>
    <div class="kpi"><div class="kpi-value">${qtdVendas}</div><div class="kpi-label">Vendas Realizadas</div></div>
    <div class="kpi"><div class="kpi-value" style="color:${lowStockCount > 0 ? '#D95F5F' : '#3D1C1C'}">${lowStockCount}</div><div class="kpi-label">Est. Baixo</div></div>
  </div>
  <h2>🏆 Produtos Mais Vendidos</h2>
  <table>
    <thead><tr><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Receita</th></tr></thead>
    <tbody>${topList || '<tr><td colspan="3" style="padding:8px;color:#A07080">Sem dados</td></tr>'}</tbody>
  </table>
  ${lowStockCount > 0 ? `<h2>⚠️ Produtos com Estoque Baixo</h2><ul>${lowList}</ul>` : ''}
  <div class="footer">MochiStock · Sistema Integrado de Gestão · feito com 🍡 e muito carinho</div>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const periodTabs: { key: Period; label: string }[] = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'custom', label: 'Personalizado' },
  ];

  const inputStyle = { background: '#FDF0F5', border: '1.5px solid rgba(244,160,192,0.4)', color: '#3D1C1C' };

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)' }}
    >
      <div className="max-w-[390px] mx-auto">
        {/* Header */}
        <div
          className="px-6 pt-12 pb-6 rounded-b-3xl shadow-md"
          style={{ background: 'linear-gradient(135deg, #3D1C1C 0%, #5C2A2A 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Relatórios</h1>
                <p className="text-white/60 text-xs">MochiMochi Candy Store</p>
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(244,160,192,0.25)', color: '#F9C8D8' }}
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>

          {/* Period tabs */}
          <div className="flex gap-2 mt-4">
            {periodTabs.map((pt) => (
              <button
                key={pt.key}
                onClick={() => setPeriod(pt.key)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: period === pt.key ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                  color: period === pt.key ? '#3D1C1C' : 'rgba(255,255,255,0.8)',
                }}
              >
                {pt.label}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          {period === 'custom' && (
            <div className="flex gap-2 mt-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none"
                style={inputStyle}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none"
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div className="px-4 mt-4 space-y-4">
          {/* Loja filter */}
          <div className="relative">
            <select
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none appearance-none"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.3)', color: '#3D1C1C' }}
            >
              {lojas.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-2xl p-3 text-center shadow-sm col-span-1"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.25)' }}
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-1" style={{ color: '#F4A0C0' }} />
              <p className="text-base font-bold" style={{ color: '#3D1C1C' }}>{formatBRL(faturamento, 0)}</p>
              <p className="text-xs" style={{ color: '#A07080' }}>Faturamento</p>
            </div>
            <div
              className="rounded-2xl p-3 text-center shadow-sm"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.25)' }}
            >
              <ShoppingBag className="w-5 h-5 mx-auto mb-1" style={{ color: '#E8839E' }} />
              <p className="text-base font-bold" style={{ color: '#3D1C1C' }}>{qtdVendas}</p>
              <p className="text-xs" style={{ color: '#A07080' }}>Vendas</p>
            </div>
            <div
              className="rounded-2xl p-3 text-center shadow-sm"
              style={{ background: '#FFFFFF', border: `1.5px solid ${lowStockCount > 0 ? 'rgba(217,95,95,0.3)' : 'rgba(244,160,192,0.25)'}` }}
            >
              <AlertTriangle className="w-5 h-5 mx-auto mb-1" style={{ color: lowStockCount > 0 ? '#D95F5F' : '#A07080' }} />
              <p className="text-base font-bold" style={{ color: lowStockCount > 0 ? '#D95F5F' : '#3D1C1C' }}>{lowStockCount}</p>
              <p className="text-xs" style={{ color: '#A07080' }}>Est. Baixo</p>
            </div>
          </div>

          {/* Chart: Vendas por dia */}
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: '#3D1C1C' }}>
              📊 Faturamento por Dia
            </p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={chartData} barSize={16}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#A07080' }}
                  interval={period === '30d' ? 1 : 0}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [formatBRL(v), 'Total']}
                  contentStyle={{
                    background: '#FFF',
                    border: '1px solid rgba(244,160,192,0.4)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={`report-bar-${i}`} fill={entry.total > 0 ? '#F4A0C0' : '#F9E4EC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Produtos mais vendidos */}
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: '#3D1C1C' }}>🏆 Produtos Mais Vendidos</p>
            {topProducts.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: '#A07080' }}>Sem dados para o período</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const maxRevenue = topProducts[0].revenue;
                  const pct = maxRevenue > 0 ? (p.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.emoji}</span>
                          <span className="text-sm font-semibold" style={{ color: '#3D1C1C' }}>{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#3D1C1C' }}>{formatBRL(p.revenue)}</p>
                          <p className="text-xs" style={{ color: '#A07080' }}>{p.qty} un.</p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F9E4EC' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: i === 0 ? '#E8839E' : '#F4A0C0' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Estoque baixo */}
          {products.filter((p) => p.minStock !== undefined && p.quantity < p.minStock).length > 0 && (
            <div
              className="rounded-2xl p-4 shadow-sm mb-4"
              style={{ background: '#FFF5F5', border: '1.5px solid rgba(217,95,95,0.25)' }}
            >
              <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#D95F5F' }}>
                <AlertTriangle className="w-4 h-4" />
                Produtos com Estoque Baixo
              </p>
              <div className="space-y-2">
                {products
                  .filter((p) => p.minStock !== undefined && p.quantity < p.minStock)
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: '#3D1C1C' }}>{p.name}</span>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ background: '#FFE0E0', color: '#D95F5F' }}
                      >
                        {p.quantity}/{p.minStock} un.
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Nota de dados simulados */}
          <div
            className="rounded-2xl p-3 mb-4"
            style={{ background: '#F9E4EC', border: '1.5px dashed rgba(244,160,192,0.6)' }}
          >
            <p className="text-xs text-center" style={{ color: '#7A4A55' }}>
              📌 Os dados históricos incluem registros simulados para demonstração. Novos registros são dados reais do sistema.
            </p>
          </div>

          {/* Botão exportar PDF */}
          <button
            onClick={handleExportPDF}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mb-4"
            style={{
              background: 'linear-gradient(135deg, #3D1C1C 0%, #5C2A2A 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(61,28,28,0.25)',
            }}
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
