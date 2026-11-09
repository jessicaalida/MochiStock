-- =====================================================================
-- MochiStock: perfis de acesso (administrador x operador)
-- Executar depois de schema.sql. Pode ser executado mais de uma vez.
--
-- Matriz de permissões
--   Ação                                   Administrador   Operador
--   Ver produtos, vendas, reposições            sim           sim
--   Registrar venda (register_sale)             sim           sim
--   Solicitar reposição                         sim           sim
--   Cadastrar / editar / excluir produto        sim           não
--   Confirmar / excluir reposição               sim           não
--   Alterar ou apagar venda                     não           não   (histórico imutável)
-- =====================================================================

-- ---------- Perfis ----------
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'operador' check (role in ('admin', 'operador')),
  created_at timestamptz not null default now()
);

-- Usuários já existentes: todos administradores, exceto o caixa.
-- (Só preenche quem ainda não tem perfil; não sobrescreve ajustes manuais.)
insert into profiles (user_id, role)
select id, case when lower(email) = 'caixa@mochimochi.com' then 'operador' else 'admin' end
from auth.users
on conflict (user_id) do nothing;

-- Todo usuário novo entra como operador (o perfil mais restrito).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Verdadeiro se o usuário logado for administrador.
-- Fica no esquema "private", que não é exposto pela API: só as políticas do banco a usam.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin');
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
revoke execute on function handle_new_user() from public, anon, authenticated;

-- ---------- Políticas (RLS) ----------
alter table profiles enable row level security;
drop policy if exists "ver perfis" on profiles;
create policy "ver perfis" on profiles
  for select to authenticated using (user_id = auth.uid() or private.is_admin());
-- Sem políticas de escrita: perfis só mudam pelo SQL Editor (administrador do projeto).

drop policy if exists "logados" on products;
drop policy if exists "ver" on products;
drop policy if exists "admin cadastra" on products;
drop policy if exists "admin edita" on products;
drop policy if exists "admin exclui" on products;
create policy "ver"            on products for select to authenticated using (true);
create policy "admin cadastra" on products for insert to authenticated with check (private.is_admin());
create policy "admin edita"    on products for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin exclui"   on products for delete to authenticated using (private.is_admin());

drop policy if exists "logados" on sales;
drop policy if exists "ver" on sales;
create policy "ver" on sales for select to authenticated using (true);
-- Sem insert/update/delete: a venda só entra pela função register_sale e não pode ser alterada.

drop policy if exists "logados" on replenishments;
drop policy if exists "ver" on replenishments;
drop policy if exists "todos pedem" on replenishments;
drop policy if exists "admin confirma" on replenishments;
drop policy if exists "admin exclui" on replenishments;
create policy "ver"            on replenishments for select to authenticated using (true);
create policy "todos pedem"    on replenishments for insert to authenticated with check (confirmed = false);
create policy "admin confirma" on replenishments for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin exclui"   on replenishments for delete to authenticated using (private.is_admin());

-- ---------- Venda ----------
-- Observação: o Security Advisor do Supabase alerta que esta função tem permissão elevada e
-- é chamável por usuários logados. É intencional: é a única porta de entrada das vendas.
-- O operador não pode alterar produtos diretamente, mas toda venda dá baixa no estoque.
-- Por isso a função roda com permissão própria (security definer) e faz só isso,
-- exigindo usuário autenticado e conferindo validade e estoque na mesma transação.
create or replace function register_sale(
  p_product_id uuid,
  p_qty int,
  p_discount numeric,
  p_method text
) returns sales
language plpgsql
security definer
set search_path = public
as $$
declare
  prod products;
  s sales;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

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
  if coalesce(p_discount, 0) > prod.price * p_qty then
    raise exception 'O desconto não pode ser maior que o valor da venda';
  end if;
  if p_method not in ('pix', 'debito', 'credito', 'dinheiro') then
    raise exception 'Forma de pagamento inválida';
  end if;

  update products set quantity = quantity - p_qty where id = p_product_id;

  insert into sales (product_id, product_name, product_emoji, quantity, unit_price, discount, total, payment_method, user_id)
  values (prod.id, prod.name, prod.emoji, p_qty, prod.price, coalesce(p_discount, 0),
          prod.price * p_qty - coalesce(p_discount, 0), p_method, auth.uid())
  returning * into s;

  return s;
end;
$$;

revoke execute on function register_sale(uuid, int, numeric, text) from public, anon;
grant execute on function register_sale(uuid, int, numeric, text) to authenticated;

-- ---------- Para mudar o perfil de alguém ----------
-- update profiles set role = 'admin'
--   where user_id = (select id from auth.users where email = 'fulano@mochimochi.com');

-- Remove a versão antiga (pública) da função, se existir.
drop function if exists public.is_admin();
