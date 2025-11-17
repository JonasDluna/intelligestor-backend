-- CORRIGIR PERMISSÕES DA TABELA USERS
-- Execute este SQL no Supabase para permitir registros

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Permitir registro público" ON users;
DROP POLICY IF EXISTS "Service role tem acesso total" ON users;
DROP POLICY IF EXISTS "Usuários veem apenas seus dados" ON users;

-- Desabilitar RLS temporariamente ou criar política permissiva
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OU, se quiser manter RLS ativo, use estas políticas:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Permitir todos os acessos via service role" ON users
--     FOR ALL 
--     TO authenticated, anon
--     USING (true)
--     WITH CHECK (true);
