import React from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Info, Bell, Package, ChevronRight, User } from 'lucide-react';
import { useAuth, useProducts } from '../context/ProductContext';
import { BottomNav } from '../components/BottomNav';
import mochiLogo from '@/imports/Screenshot_2026-06-23_at_20.46.07.png';

export function More() {
  const navigate = useNavigate();
  const { logout, userEmail } = useAuth();
  const { products, replenishments } = useProducts();

  const lowStockCount = products.filter((p) => p.minStock !== undefined && p.quantity < p.minStock).length;
  const pendingReplenishments = replenishments.filter((r) => !r.confirmed).length;

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  const menuSection = (title: string, items: React.ReactNode[]) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase px-1" style={{ color: '#A07080', letterSpacing: '0.08em' }}>{title}</p>
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.2)' }}
      >
        {items}
      </div>
    </div>
  );

  const menuItem = (icon: React.ReactNode, label: string, sub: string, onClick: () => void, badge?: number) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 border-b last:border-0 transition-colors hover:bg-pink-50 text-left"
      style={{ borderColor: 'rgba(244,160,192,0.15)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F9E4EC' }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: '#3D1C1C' }}>{label}</p>
        <p className="text-xs" style={{ color: '#A07080' }}>{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: '#D95F5F' }}>
            {badge}
          </span>
        )}
        <ChevronRight className="w-4 h-4" style={{ color: '#C0A0B0' }} />
      </div>
    </button>
  );

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
          <div className="flex items-center gap-4">
            <img src={mochiLogo} alt="Mochi" className="w-16 h-16 object-contain drop-shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold text-white">Mais</h1>
              <p className="text-white/80 text-sm font-medium">MochiStock</p>
              <p className="text-white/60 text-xs">Sistema Integrado de Gestão</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-5 space-y-4">
          {/* Conta */}
          {menuSection('Conta', [
            menuItem(
              <User className="w-4 h-4" style={{ color: '#F4A0C0' }} />,
              'Perfil',
              `${userEmail ?? 'Usuário'} — MochiMochi Candy Store`,
              () => {},
            ),
          ])}

          {/* Estoque */}
          {menuSection('Estoque', [
            menuItem(
              <Package className="w-4 h-4" style={{ color: '#F4A0C0' }} />,
              'Controle de Estoque',
              `${products.length} produtos cadastrados`,
              () => navigate('/inventory'),
            ),
            menuItem(
              <Bell className="w-4 h-4" style={{ color: lowStockCount > 0 ? '#D95F5F' : '#F4A0C0' }} />,
              'Alertas de Reposição',
              `${lowStockCount} produto(s) abaixo do mínimo`,
              () => navigate('/inventory'),
              lowStockCount,
            ),
            menuItem(
              <Bell className="w-4 h-4" style={{ color: '#F4A0C0' }} />,
              'Solicitações Enviadas',
              `${replenishments.length} solicitação(ões) · ${pendingReplenishments} pendente(s)`,
              () => navigate('/inventory'),
              pendingReplenishments,
            ),
          ])}

          {/* Sobre */}
          {menuSection('Sobre o App', [
            menuItem(
              <Info className="w-4 h-4" style={{ color: '#F4A0C0' }} />,
              'Sobre o MochiStock',
              'Versão 2.0 · Projeto Integrador III',
              () => {},
            ),
          ])}

          {/* Solicitações de reposição recentes */}
          {replenishments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase px-1" style={{ color: '#A07080', letterSpacing: '0.08em' }}>
                Solicitações de Reposição
              </p>
              <div className="space-y-2">
                {replenishments.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl p-4 shadow-sm"
                    style={{
                      background: '#FFFFFF',
                      border: `1.5px solid ${r.confirmed ? 'rgba(34,197,94,0.3)' : 'rgba(244,160,192,0.25)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.productEmoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#3D1C1C' }}>{r.productName}</p>
                          <p className="text-xs" style={{ color: '#A07080' }}>
                            Sugerido: {r.suggestedQty} un. · Atual: {r.currentQty}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{
                          background: r.confirmed ? '#E0FFF0' : '#F9E4EC',
                          color: r.confirmed ? '#16A34A' : '#7A4A55',
                        }}
                      >
                        {r.confirmed ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sair */}
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              background: '#FFF5F5',
              border: '1.5px solid rgba(217,95,95,0.3)',
              color: '#D95F5F',
            }}
          >
            <LogOut className="w-5 h-5" />
            Sair do Aplicativo
          </button>

          <p className="text-center text-xs pb-4" style={{ color: '#C0A0B0' }}>
            feito com 🍡 e muito carinho · Projeto Integrador III
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
