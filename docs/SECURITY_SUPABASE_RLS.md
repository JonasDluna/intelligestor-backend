# Políticas de Segurança (RLS) no Supabase

Este guia descreve como habilitar e configurar Row Level Security (RLS) para proteger as tabelas sensíveis usadas pela integração do Mercado Livre.

## Tabelas sensíveis

- `tokens_ml`: guarda `access_token`, `refresh_token`, `ml_user_id`, `expires_at` por usuário.
- `integrations_ml`: guarda credenciais da aplicação ML por cliente SaaS (`client_id`, `client_secret`, `redirect_uri`).

## Princípios

- Toda leitura/escrita deve ser restrita ao `user_id` autenticado.
- Somente o service-role (no backend) pode executar operações administrativas quando necessário.
- Nunca retornar `client_secret` nem `access_token` para o frontend.

## Passos

1. Habilitar RLS nas tabelas:

```sql
alter table public.tokens_ml enable row level security;
alter table public.integrations_ml enable row level security;
```

2. Criar políticas de SELECT/INSERT/UPDATE/DELETE por usuário:

```sql
-- tokens_ml: apenas o dono pode ver/alterar seus registros
create policy tokens_ml_select_owner on public.tokens_ml
  for select using (auth.uid() = user_id);

create policy tokens_ml_modify_owner on public.tokens_ml
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- integrations_ml: apenas o dono pode ver/alterar
create policy integrations_ml_select_owner on public.integrations_ml
  for select using (auth.uid() = user_id);

create policy integrations_ml_modify_owner on public.integrations_ml
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

3. Opcional: políticas para contas de serviço (service-role):

```sql
-- Permitir que o service role bypass RLS quando necessário
-- Em Supabase, o service role já ignora RLS por padrão.
-- Evite usar service-role no frontend; use apenas no backend.
```

## Boas práticas adicionais

- Mascarar dados sensíveis nos logs (não logar tokens/secrets).
- Em endpoints de status, retornar apenas bandeiras (`connected`) e metadados não sensíveis (ex. nickname quando estritamente necessário).
- Validar `user_id` sempre derivado da autenticação (JWT), não do corpo da requisição.

## Verificação

- Testar com usuário A e usuário B: ambos devem ver apenas os próprios registros.
- Validar que chamadas sem autenticação retornam 401/403 conforme esperado.

---

Com estas políticas, sua API mantém isolamento por usuário e reduz o risco de vazamento de dados sensíveis.
