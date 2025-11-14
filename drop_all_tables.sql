-- =====================================================
-- SCRIPT PARA DROPAR (DELETAR) TODAS AS TABELAS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- URL: https://app.supabase.com/project/wsluajpeibcfeerbxqiz/sql/new
-- =====================================================

-- ⚠️ ATENÇÃO: Este script DELETA AS TABELAS COMPLETAMENTE!
-- Use este script se quiser recriar tudo do zero.
-- Depois de executar, você precisa rodar o database_schema.sql novamente.

BEGIN;

-- Remover políticas RLS primeiro (se existirem)
DROP POLICY IF EXISTS "Users can view their own data" ON produtos;
DROP POLICY IF EXISTS "Users can insert their own data" ON produtos;
DROP POLICY IF EXISTS "Users can update their own data" ON produtos;
RAISE NOTICE '✅ Políticas RLS removidas';

-- Dropar tabelas na ordem inversa (dependentes primeiro)
DROP TABLE IF EXISTS logs_monitoramento CASCADE;
RAISE NOTICE '✅ Tabela logs_monitoramento deletada';

DROP TABLE IF EXISTS anuncios CASCADE;
RAISE NOTICE '✅ Tabela anuncios deletada';

DROP TABLE IF EXISTS produtos CASCADE;
RAISE NOTICE '✅ Tabela produtos deletada';

DROP TABLE IF EXISTS precos_concorrentes CASCADE;
RAISE NOTICE '✅ Tabela precos_concorrentes deletada';

DROP TABLE IF EXISTS catalogo CASCADE;
RAISE NOTICE '✅ Tabela catalogo deletada';

DROP TABLE IF EXISTS usuarios CASCADE;
RAISE NOTICE '✅ Tabela usuarios deletada';

DROP TABLE IF EXISTS tokens_ml CASCADE;
RAISE NOTICE '✅ Tabela tokens_ml deletada';

COMMIT;

-- Verificar se as tabelas foram removidas
SELECT 
    tablename 
FROM 
    pg_tables 
WHERE 
    schemaname = 'public' 
    AND tablename IN (
        'tokens_ml', 
        'produtos', 
        'anuncios', 
        'catalogo', 
        'precos_concorrentes', 
        'logs_monitoramento', 
        'usuarios'
    );

-- Resultado esperado: nenhuma tabela encontrada (query vazia)
-- ✅ Script concluído! Todas as tabelas foram deletadas.
-- 
-- PRÓXIMO PASSO: Execute o arquivo database_schema.sql para recriar as tabelas
