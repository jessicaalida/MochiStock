-- =====================================================================
-- MochiStock: estrutura do banco (Supabase / PostgreSQL)
-- Como usar: Supabase → SQL Editor → New query → colar tudo → Run.
-- Pode ser executado mais de uma vez sem apagar dados.
-- Depois rode supabase/reset_demo.sql para carregar os dados de exemplo.
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

-- ---------- Segurança (RLS): só usuários autenticados acessam ----------
alter table products enable row level security;
alter table sales enable row level security;
alter table replenishments enable row level security;

drop policy if exists "logados" on products;
drop policy if exists "logados" on sales;
drop policy if exists "logados" on replenishments;
create policy "logados" on products       for all to authenticated using (true) with check (true);
create policy "logados" on sales          for all to authenticated using (true) with check (true);
create policy "logados" on replenishments for all to authenticated using (true) with check (true);

-- ---------- Venda atômica ----------
-- Confere o estoque, registra a venda e dá baixa numa única transação.
-- O "for update" trava a linha do produto: duas vendas simultâneas não deixam o estoque negativo.
create or replace function register_sale(
  p_product_id uuid,
  p_qty int,
  p_discount numeric,
  p_method text
) returns sales
language plpgsql
set search_path = public
as $$
declare
  prod products;
  s sales;
begin
  select * into prod from products where id = p_product_id for update;
  if not found then
    raise exception 'Produto não encontrado';
  end if;
  if p_qty is null or p_qty <= 0 then
    raise exception 'Quantidade deve ser maior que zero';
  end if;
  if prod.expiry < current_date then
    raise exception 'Produto vencido (validade %) não pode ser vendido', to_char(prod.expiry, 'DD/MM/YYYY');
  end if;
  if prod.quantity < p_qty then
    raise exception 'Estoque insuficiente. Disponível: % unidades', prod.quantity;
  end if;
  if coalesce(p_discount, 0) < 0 then
    raise exception 'O desconto não pode ser negativo';
  end if;

  update products set quantity = quantity - p_qty where id = p_product_id;

  insert into sales (product_id, product_name, product_emoji, quantity, unit_price, discount, total, payment_method)
  values (prod.id, prod.name, prod.emoji, p_qty, prod.price, coalesce(p_discount, 0),
          greatest(prod.price * p_qty - coalesce(p_discount, 0), 0), p_method)
  returning * into s;

  return s;
end;
$$;

revoke execute on function register_sale(uuid, int, numeric, text) from public, anon;
grant execute on function register_sale(uuid, int, numeric, text) to authenticated;
