import React from 'react';
import { Home, Package, ShoppingBag, FileText, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: ShoppingBag, label: 'Vendas', path: '/sales' },
  { icon: Package, label: 'Estoque', path: '/inventory' },
  { icon: FileText, label: 'Relatórios', path: '/reports' },
  { icon: MoreHorizontal, label: 'Mais', path: '/more' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 shadow-lg z-40"
      style={{ background: '#FFFFFF', borderTop: '1.5px solid rgba(244,160,192,0.3)' }}
    >
      <div className="max-w-[390px] mx-auto flex justify-around items-center py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 min-h-[52px] justify-center rounded-2xl transition-all"
              style={{
                color: isActive ? '#F4A0C0' : '#A07080',
                background: isActive ? 'rgba(244,160,192,0.12)' : 'transparent',
              }}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
