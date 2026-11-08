import React from 'react';
import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
  { path: '/', element: <Layout><Home /></Layout> },
  { path: '/sales', element: <Layout><Sales /></Layout> },
  { path: '/inventory', element: <Layout><InventoryList /></Layout> },
  { path: '/reports', element: <Layout><Reports /></Layout> },
  { path: '/more', element: <Layout><More /></Layout> },
  { path: '/new', element: <Layout><NewProduct /></Layout> },
  { path: '/edit/:id', element: <Layout><EditProduct /></Layout> },
]);
