-- ============================================================================
-- CONCEDER PERMISSÕES À ROLE DE SERVIÇO (service_role)
-- Execute no SQL Editor do projeto Supabase em uso (ver SUPABASE_URL)
-- ============================================================================

-- Desabilitar RLS para evitar 42501 em ambiente de produção inicial
ALTER TABLE public.integrations_ml DISABLE ROW LEVEL SECURITY;

-- Garantir uso do schema e permissões ao service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.integrations_ml TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- (Opcional) Também garantir para anon/authenticated, se necessário para outros fluxos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.integrations_ml TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verificação: Checar estado do RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'integrations_ml';
