-- ============================================
-- RLS SEGURO - VERSÃO SIMPLIFICADA
-- Ativa RLS mas dá acesso total ao service_role
-- O backend usa service_role e controla acesso via código
-- ============================================

-- Lista de todas as tabelas
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'usuarios',
        'produtos',
        'tokens_ml',
        'anuncios_ml',
        'estoque',
        'variacoes',
        'concorrentes',
        'historico_buybox',
        'regras_automacao',
        'logs_automacao',
        'logs_ia',
        'logs_sistema',
        'arquivos',
        'catalogo_ml',
        'movimentacoes_estoque'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Ativar RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        
        -- Dropar política antiga se existir
        EXECUTE format('DROP POLICY IF EXISTS "service_role_all_%I" ON %I', t, t);
        
        -- Criar política para service_role (acesso total)
        EXECUTE format('
            CREATE POLICY "service_role_all_%I" 
            ON %I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)
        ', t, t);
        
        RAISE NOTICE 'RLS configurado em: %', t;
    END LOOP;
END $$;

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE 'service_role%'
ORDER BY tablename;
