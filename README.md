# MochiStock 🍡

Sistema de gestão de estoque e vendas da **MochiMochi Candy Store**, desenvolvido no Projeto Integrador III (CEUB, 2º semestre de 2026).

**Grupo:** Flávia, Frederico, Guilherme, Jéssica e Sheyla

## Funcionalidades

- **Login** com contas criadas pelo administrador (sem cadastro aberto)
- **Estoque:** cadastro, busca, edição e exclusão de produtos, com estoque mínimo e validação de validade
- **Vendas:** registro com forma de pagamento e desconto, com baixa automática e atômica no estoque
- **Reposição:** alerta de estoque baixo e solicitação de reposição com quantidade sugerida
- **Dashboard:** vendas do dia, faturamento do mês e alertas
- **Relatórios:** produtos mais vendidos e faturamento por período, com exportação em PDF

## Arquitetura

| Camada | Tecnologia |
|---|---|
| Front-end | React 18 + TypeScript + Vite + Tailwind CSS (prototipado no Figma Make) |
| Banco de dados | PostgreSQL no Supabase, com Row Level Security |
| Autenticação | Supabase Auth (e-mail e senha) |
| Hospedagem | Vercel, com deploy automático a cada push na branch `main` |

As regras críticas ficam no banco: a função `register_sale` confere o estoque, registra a venda e dá a baixa numa única transação, de modo que duas vendas simultâneas não deixam o estoque negativo.

## Configuração

### 1. Supabase
1. Crie o projeto (região South America – São Paulo).
2. **SQL Editor:** execute `supabase/schema.sql` e depois `supabase/reset_demo.sql`.
3. **Authentication → Sign In / Providers:** desative *Allow new users to sign up* e, em Email, *Confirm email*.
4. **Authentication → Users → Add user:** crie as contas (administrador, operador, avaliador).
5. **Project Settings → API Keys:** copie a *Project URL* e a *Publishable key*.

### 2. Vercel
1. *Add New → Project* → importe este repositório (o framework Vite é detectado sozinho).
2. Em *Environment Variables*, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. *Deploy*.

### 3. Rodar localmente
```bash
cp .env.example .env   # preencha as duas variáveis
npm install
npm run dev
```

## Manutenção

- **Limpar dados de teste** (por exemplo, antes da apresentação): execute `supabase/reset_demo.sql` no SQL Editor. Os usuários não são apagados.
- **Plano gratuito do Supabase:** o projeto é pausado após 7 dias sem uso. Para reativar, abra o projeto no painel do Supabase.
