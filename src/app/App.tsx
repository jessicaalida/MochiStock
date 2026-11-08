import type { ReactNode } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ProductProvider, useAuth } from './context/ProductContext';
import { Login } from './screens/Login';
import { Toaster } from 'sonner';
import { supabaseConfigured } from '../lib/supabase';

function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)', color: '#7A4A55' }}
    >
      {children}
    </div>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <FullScreenMessage>
      <div className="w-10 h-10 border-4 rounded-full animate-spin mb-4" style={{ borderColor: '#F4A0C0', borderTopColor: 'transparent' }} />
      <p className="text-sm font-medium">{text}</p>
    </FullScreenMessage>
  );
}

function AppShell() {
  const { authReady, isLoggedIn, loadingData } = useAuth();

  if (!supabaseConfigured) {
    return (
      <FullScreenMessage>
        <p className="text-lg font-bold mb-2" style={{ color: '#3D1C1C' }}>Configuração pendente</p>
        <p className="text-sm max-w-xs">
          Defina as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> (arquivo
          <code> .env</code> local ou variáveis de ambiente da Vercel) e publique novamente.
        </p>
      </FullScreenMessage>
    );
  }

  if (!authReady) return <Loading text="Carregando..." />;
  if (!isLoggedIn) return <Login />;
  if (loadingData) return <Loading text="Carregando dados da loja..." />;

  return (
    <div className="max-w-[390px] mx-auto bg-white min-h-screen shadow-xl">
      <RouterProvider router={router} />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <Toaster position="top-center" richColors />
      <AppShell />
    </ProductProvider>
  );
}
