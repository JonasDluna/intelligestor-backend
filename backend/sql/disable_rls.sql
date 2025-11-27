-- ============================================================================
-- DESABILITAR RLS - SOLUÇÃO MAIS SIMPLES
-- Execute este no SQL Editor do Supabase
-- ============================================================================

-- Opção 1: Desabilitar RLS completamente (RECOMENDADO para desenvolvimento)
ALTER TABLE public.integrations_ml DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'integrations_ml';

-- Se rowsecurity = false, está desabilitado e deve funcionar!
