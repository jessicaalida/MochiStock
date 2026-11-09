-- =====================================================================
-- MochiStock: estrutura do banco (Supabase / PostgreSQL)
-- Como usar: Supabase → SQL Editor → New query → colar tudo → Run.
-- Pode ser executado mais de uma vez sem apagar dados e sem alterar permissões.
-- Ordem: schema.sql → roles.sql (perfis, políticas e função de venda) → reset_demo.sql.
-- =====================================================================

-- ---------- Tabelas ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  category text not null,
  quantity int not null default 0 check (quantity >= 0),
  expiry date not null,
  price numeric(10,2) not null check (price >= 0),
  min_stock int check (min_stock is null or min_stock >= 0),  -- opcional
  emoji text,
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,           -- cópia: o histórico sobrevive à exclusão do produto
  product_emoji text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  discount numeric(10,2) not null default 0 check (discount >= 0),
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('pix','debito','credito','dinheiro')),
  user_id uuid default auth.uid(),      -- quem registrou a venda
  created_at timestamptz not null default now()
);

create table if not exists replenishments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  product_name text not null,
  product_emoji text,
  current_qty int not null,
  min_stock int not null,
  suggested_qty int not null,
  confirmed boolean not null default false,
  user_id uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists sales_created_at_idx on sales (created_at desc);

-- ---------- Segurança (RLS) ----------
-- RLS ativo sem nenhuma política: até rodar supabase/roles.sql, nenhum usuário acessa os dados
-- (falha segura). As políticas por perfil e a função de venda ficam todas em roles.sql.
alter table products enable row level security;
alter table sales enable row level security;
alter table replenishments enable row level security;
