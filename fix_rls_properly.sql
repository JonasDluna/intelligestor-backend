-- CONFIGURAR RLS CORRETAMENTE PARA A TABELA USERS
-- Mantém segurança ativa mas permite operações necessárias

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Permitir registro público" ON users;
DROP POLICY IF EXISTS "Service role tem acesso total" ON users;
DROP POLICY IF EXISTS "Usuários veem apenas seus dados" ON users;
DROP POLICY IF EXISTS "Permitir todos os acessos via service role" ON users;

-- 2. Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Política para permitir INSERT público (registro sem autenticação)
CREATE POLICY "allow_public_insert" ON users
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 4. Política para permitir SELECT/UPDATE apenas do próprio registro
CREATE POLICY "allow_own_select" ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

CREATE POLICY "allow_own_update" ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- 5. Política para service_role ter acesso total (bypass RLS)
CREATE POLICY "allow_service_role_all" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Garantir que service_role pode fazer tudo
GRANT ALL ON users TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
