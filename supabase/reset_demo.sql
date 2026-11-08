-- =====================================================================
-- MochiStock: dados de demonstração
-- ATENÇÃO: apaga TODOS os produtos, vendas e reposições e recarrega o exemplo.
-- Use na primeira configuração e antes da apresentação, para limpar os testes.
-- Não apaga os usuários (Authentication → Users).
-- =====================================================================

begin;

truncate table sales, replenishments, products restart identity cascade;

-- Validades relativas à data de execução, para a demonstração sempre mostrar os alertas:
-- Ramune vence em 12 dias ("vencendo") e Mochi Matcha venceu há 2 dias ("vencido").
insert into products (name, category, quantity, expiry, price, min_stock, emoji) values
  ('Pocky Morango',   'Biscoitos',  45, '2027-03-25', 12.90, 20, '🍓'),
  ('Ramune Original', 'Bebidas',    30, current_date + 12, 8.50, 15, '🥤'),
  ('Mochi Matcha',    'Doces',       8, current_date - 2, 15.00, 20, '🍡'),
  ('Hello Panda',     'Biscoitos',   5, '2027-04-01',  9.90, 15, '🐼'),
  ('Matcha Kit Kat',  'Chocolates', 22, '2027-06-30', 19.90, 10, '🍫');

-- Histórico de vendas dos últimos 7 dias, para o Dashboard e os Relatórios não abrirem vazios.
insert into sales (product_id, product_name, product_emoji, quantity, unit_price, discount, total, payment_method, user_id, created_at)
select p.id, p.name, p.emoji, v.qty, p.price, v.disc, greatest(p.price * v.qty - v.disc, 0), v.method, null,
       date_trunc('day', now()) - make_interval(days => v.days_ago) + make_interval(hours => v.hour)
from (values
  ('Pocky Morango',   3, 0.00, 'pix',      6, 11),
  ('Mochi Matcha',    2, 0.00, 'dinheiro', 5, 14),
  ('Matcha Kit Kat',  1, 2.00, 'credito',  5, 16),
  ('Pocky Morango',   5, 5.00, 'debito',   4, 12),
  ('Ramune Original', 4, 0.00, 'pix',      3, 15),
  ('Hello Panda',     3, 0.00, 'dinheiro', 2, 10),
  ('Matcha Kit Kat',  2, 0.00, 'credito',  1, 17),
  ('Pocky Morango',   2, 0.00, 'pix',      0, 10),
  ('Ramune Original', 1, 0.00, 'pix',      0, 11)
) as v(name, qty, disc, method, days_ago, hour)
join products p on p.name = v.name;

commit;
