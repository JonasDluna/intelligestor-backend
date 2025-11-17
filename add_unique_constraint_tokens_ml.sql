-- =====================================================
-- Adicionar UNIQUE constraint no user_id da tabela tokens_ml
-- Isso permite usar upsert com on_conflict="user_id"
-- =====================================================

-- Remover constraint UNIQUE de ml_user_id (se quisermos manter apenas user_id único)
-- Comentado por segurança - mantenha ambos únicos se preferir
-- ALTER TABLE tokens_ml DROP CONSTRAINT IF EXISTS tokens_ml_ml_user_id_key;

-- Adicionar constraint UNIQUE no user_id
-- Isso garante que cada usuário interno só possa ter 1 token ML ativo
ALTER TABLE tokens_ml ADD CONSTRAINT tokens_ml_user_id_unique UNIQUE (user_id);

-- Verificar constraints criadas
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tokens_ml'::regclass
ORDER BY conname;
