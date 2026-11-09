import React from 'react';
import { createBrowserRouter, Link } from 'react-router';
import { useAuth } from './context/ProductContext';
import { Home } from './screens/Home';
import { NewProduct } from './screens/NewProduct';
import { InventoryList } from './screens/InventoryList';
import { EditProduct } from './screens/EditProduct';
import { Sales } from './screens/Sales';
import { Reports } from './screens/Reports';
import { More } from './screens/More';

function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Telas de cadastro e edição: só administradores. O banco também recusa (RLS). */
function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <>{children}</>;
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)' }}
    >
      <p className="text-4xl mb-3">🔒</p>
      <p className="text-lg font-bold mb-2" style={{ color: '#3D1C1C' }}>Acesso restrito</p>
      <p className="text-sm mb-6" style={{ color: '#7A4A55' }}>
        Cadastrar e editar produtos é permitido apenas para administradores.
      </p>
      <Link
        to="/inventory"
        className="px-6 py-3 rounded-2xl font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #F4A0C0, #E8839E)' }}
      >
        Voltar ao estoque
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Layout><Home /></Layout> },
  { path: '/sales', element: <Layout><Sales /></Layout> },
  { path: '/inventory', element: <Layout><InventoryList /></Layout> },
  { path: '/reports', element: <Layout><Reports /></Layout> },
  { path: '/more', element: <Layout><More /></Layout> },
  { path: '/new', element: <Layout><AdminOnly><NewProduct /></AdminOnly></Layout> },
  { path: '/edit/:id', element: <Layout><AdminOnly><EditProduct /></AdminOnly></Layout> },
]);
