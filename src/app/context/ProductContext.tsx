import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { brToISO, isoToBR } from '../../lib/format';
import { Product, Sale, ReplenishmentRequest, PaymentMethod } from '../types';

interface SaleInput {
  productId: string;
  quantity: number;
  discount: number;
  paymentMethod: PaymentMethod;
}

export type Role = 'admin' | 'operador';

export interface Result {
  success: boolean;
  message: string;
}

interface AppContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Result>;
  updateProduct: (product: Product) => Promise<Result>;
  deleteProduct: (id: string) => Promise<Result>;
  sales: Sale[];
  addSale: (data: SaleInput) => Promise<Result>;
  replenishments: ReplenishmentRequest[];
  requestReplenishment: (productId: string) => Promise<Result>;
  confirmReplenishment: (id: string) => Promise<Result>;
  loadingData: boolean;
  refresh: () => Promise<void>;
  session: Session | null;
  authReady: boolean;
  role: Role | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ---------- Conversão entre as linhas do banco (snake_case) e os tipos do app ----------

/* eslint-disable @typescript-eslint/no-explicit-any */
const rowToProduct = (r: any): Product => ({
  id: r.id,
  name: r.name,
  category: r.category,
  quantity: r.quantity,
  expiry: isoToBR(r.expiry),
  price: Number(r.price),
  minStock: r.min_stock ?? undefined,
  emoji: r.emoji ?? undefined,
});

const productToRow = (p: Omit<Product, 'id'>) => ({
  name: p.name.trim(),
  category: p.category,
  quantity: p.quantity,
  expiry: brToISO(p.expiry),
  price: p.price,
  min_stock: p.minStock ?? null,
  emoji: p.emoji ?? null,
});

const rowToSale = (r: any): Sale => ({
  id: r.id,
  productId: r.product_id,
  productName: r.product_name,
  productEmoji: r.product_emoji ?? undefined,
  quantity: r.quantity,
  unitPrice: Number(r.unit_price),
  discount: Number(r.discount),
  total: Number(r.total),
  paymentMethod: r.payment_method,
  date: new Date(r.created_at),
});

const rowToReplenishment = (r: any): ReplenishmentRequest => ({
  id: r.id,
  productId: r.product_id,
  productName: r.product_name,
  productEmoji: r.product_emoji ?? undefined,
  currentQty: r.current_qty,
  minStock: r.min_stock,
  suggestedQty: r.suggested_qty,
  date: new Date(r.created_at),
  confirmed: r.confirmed,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Traduz erros comuns do Supabase/Postgres para mensagens em português. */
function friendlyError(message: string): string {
  if (/Invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(message)) return 'E-mail ainda não confirmado.';
  if (/Failed to fetch|NetworkError/i.test(message)) return 'Sem conexão com o servidor. Verifique a internet.';
  if (/quantity_check|violates check constraint/i.test(message)) return 'Valores inválidos. Confira quantidade e preço.';
  return message;
}

const NO_PERMISSION = 'Ação permitida apenas para administradores.';
const ok = (message: string): Result => ({ success: true, message });
const fail = (message: string): Result => ({ success: false, message: friendlyError(message) });

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [replenishments, setReplenishments] = useState<ReplenishmentRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  // ---------- Autenticação ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---------- Leitura dos dados ----------
  const refresh = useCallback(async () => {
    const [p, s, r] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('replenishments').select('*').order('created_at', { ascending: false }),
    ]);
    if (!p.error) setProducts((p.data ?? []).map(rowToProduct));
    if (!s.error) setSales((s.data ?? []).map(rowToSale));
    if (!r.error) setReplenishments((r.data ?? []).map(rowToReplenishment));
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setProducts([]);
      setSales([]);
      setReplenishments([]);
      setRole(null);
      return;
    }
    setLoadingData(true);
    // O perfil define o que a interface mostra; quem decide de fato é o banco (RLS).
    const loadRole = supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => setRole((data?.role as Role) ?? 'operador'));
    Promise.all([refresh(), loadRole]).finally(() => setLoadingData(false));
  }, [userId, refresh]);

  // Atualiza ao voltar para a aba, para refletir vendas feitas em outro aparelho.
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => { refresh(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [userId, refresh]);

  // ---------- Produtos ----------
  const addProduct = async (product: Omit<Product, 'id'>): Promise<Result> => {
    if (role !== 'admin') return fail(NO_PERMISSION);
    const { error } = await supabase.from('products').insert(productToRow(product));
    if (error) return fail(/row-level security/i.test(error.message) ? NO_PERMISSION : error.message);
    await refresh();
    return ok('Produto cadastrado com sucesso! 🎉');
  };

  const updateProduct = async (product: Product): Promise<Result> => {
    const { id, ...rest } = product;
    if (role !== 'admin') return fail(NO_PERMISSION);
    const { data, error } = await supabase.from('products').update(productToRow(rest)).eq('id', id).select('id');
    if (error) return fail(error.message);
    if (!data?.length) return fail(NO_PERMISSION);
    await refresh();
    return ok('Produto atualizado com sucesso! ✨');
  };

  const deleteProduct = async (id: string): Promise<Result> => {
    if (role !== 'admin') return fail(NO_PERMISSION);
    const { data, error } = await supabase.from('products').delete().eq('id', id).select('id');
    if (error) return fail(error.message);
    if (!data?.length) return fail(NO_PERMISSION);
    await refresh();
    return ok('Produto excluído');
  };

  // ---------- Vendas (baixa de estoque atômica no banco) ----------
  const addSale = async (data: SaleInput): Promise<Result> => {
    if (data.quantity <= 0) return fail('Quantidade deve ser maior que zero.');
    if (data.discount < 0) return fail('O desconto não pode ser negativo.');
    const { error } = await supabase.rpc('register_sale', {
      p_product_id: data.productId,
      p_qty: data.quantity,
      p_discount: data.discount,
      p_method: data.paymentMethod,
    });
    if (error) return fail(error.message);
    await refresh();
    return ok('Venda realizada com sucesso!');
  };

  // ---------- Reposição ----------
  const requestReplenishment = async (productId: string): Promise<Result> => {
    const product = products.find((p) => p.id === productId);
    if (!product) return fail('Produto não encontrado.');
    const min = product.minStock ?? 0;
    const { error } = await supabase.from('replenishments').insert({
      product_id: product.id,
      product_name: product.name,
      product_emoji: product.emoji ?? null,
      current_qty: product.quantity,
      min_stock: min,
      suggested_qty: Math.max(min - product.quantity + 10, 10),
    });
    if (error) return fail(error.message);
    await refresh();
    return ok(`Solicitação de reposição enviada para ${product.name}! 📦`);
  };

  const confirmReplenishment = async (id: string): Promise<Result> => {
    if (role !== 'admin') return fail(NO_PERMISSION);
    const { data, error } = await supabase.from('replenishments').update({ confirmed: true }).eq('id', id).select('id');
    if (error) return fail(error.message);
    if (!data?.length) return fail(NO_PERMISSION);
    await refresh();
    return ok('Reposição confirmada');
  };

  // ---------- Login / logout ----------
  const login = async (email: string, password: string): Promise<Result> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return fail(error.message);
    return ok('Bem-vindo(a)!');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider
      value={{
        products, addProduct, updateProduct, deleteProduct,
        sales, addSale,
        replenishments, requestReplenishment, confirmReplenishment,
        loadingData, refresh,
        session, authReady, role, isAdmin: role === 'admin',
        isLoggedIn: Boolean(session),
        userEmail: session?.user.email ?? null,
        login, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function useAppContext(name: string) {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error(`${name} must be used within ProductProvider`);
  return ctx;
}

export const useProducts = () => useAppContext('useProducts');
export const useSales = () => useAppContext('useSales');
export const useAuth = () => useAppContext('useAuth');
