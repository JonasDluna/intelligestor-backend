-- =====================================================
-- Adicionar campo password_hash e configurar usuário
-- =====================================================

-- 1. Adicionar campo password_hash na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Verificar se o usuário existe e configurar senha
-- NOTA: A senha será hash de "senha123" gerado com bcrypt
-- Hash gerado: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.sO8o3i
-- Senha: senha123

DO $$
BEGIN
    -- Atualizar usuário existente com senha hash
    UPDATE usuarios 
    SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.sO8o3i'
    WHERE email = 'jonastortorette@hotmail.com'
    AND password_hash IS NULL;
    
    -- Mostrar resultado
    IF FOUND THEN
        RAISE NOTICE 'Senha configurada para jonastortorette@hotmail.com';
        RAISE NOTICE 'Email: jonastortorette@hotmail.com';
        RAISE NOTICE 'Senha: senha123';
        RAISE NOTICE 'IMPORTANTE: Altere a senha após o primeiro login!';
    ELSE
        RAISE NOTICE 'Usuário não encontrado ou já tem senha configurada';
    END IF;
END $$;

-- 3. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
