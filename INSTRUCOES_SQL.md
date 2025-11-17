# 🔧 ADICIONAR UNIQUE CONSTRAINT NO BANCO

## Problema
A tabela `tokens_ml` precisa ter UNIQUE constraint no campo `user_id` para usar `upsert()` corretamente.

## Solução via SQL Editor do Supabase

### Passo 1: Acesse o Supabase
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **intelligestor**
3. Clique em **SQL Editor** no menu lateral

### Passo 2: Execute o SQL

Cole e execute este SQL:

```sql
-- Adicionar constraint UNIQUE no user_id da tabela tokens_ml
ALTER TABLE tokens_ml 
ADD CONSTRAINT tokens_ml_user_id_unique UNIQUE (user_id);

-- Verificar se foi criado
SELECT
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'tokens_ml'::regclass
ORDER BY conname;
```

### Passo 3: Verificar Resultado

Você deve ver algo como:
```
constraint_name              | constraint_type
tokens_ml_user_id_unique     | u
tokens_ml_ml_user_id_key     | u
tokens_ml_pkey               | p
```

## ✅ Pronto!

Agora o código vai funcionar com:
```python
supabase.table("tokens_ml").upsert({...}, on_conflict="user_id")
```

## 🚨 Se der erro "constraint already exists"

Significa que já foi criado antes - tudo OK!

## 🚨 Se der erro "duplicate key value"

Significa que já existem registros duplicados. Execute antes:

```sql
-- Ver se tem duplicatas
SELECT user_id, COUNT(*) 
FROM tokens_ml 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Se tiver, manter apenas o mais recente de cada user_id
DELETE FROM tokens_ml a
USING tokens_ml b
WHERE a.id < b.id 
AND a.user_id = b.user_id;

-- Agora pode adicionar a constraint
ALTER TABLE tokens_ml 
ADD CONSTRAINT tokens_ml_user_id_unique UNIQUE (user_id);
```
