-- ============================================================================
-- SCRIPT SIMPLIFICADO - APENAS PERMISSÕES
-- Execute este no SQL Editor do Supabase
-- ============================================================================

-- Habilitar Row Level Security
ALTER TABLE public.integrations_ml ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Permitir leitura de integrações" ON public.integrations_ml;
DROP POLICY IF EXISTS "Permitir criar integrações" ON public.integrations_ml;
DROP POLICY IF EXISTS "Permitir atualizar integrações" ON public.integrations_ml;
DROP POLICY IF EXISTS "Permitir deletar integrações" ON public.integrations_ml;

-- Criar políticas permissivas
CREATE POLICY "Permitir leitura de integrações"
ON public.integrations_ml FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Permitir criar integrações"
ON public.integrations_ml FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Permitir atualizar integrações"
ON public.integrations_ml FOR UPDATE
TO authenticated, anon
USING (true) WITH CHECK (true);

CREATE POLICY "Permitir deletar integrações"
ON public.integrations_ml FOR DELETE
TO authenticated, anon
USING (true);

-- Conceder permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.integrations_ml TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verificar políticas criadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'integrations_ml';
