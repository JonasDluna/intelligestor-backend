-- =====================================================
-- SCRIPT PARA DELETAR TODOS OS DADOS DAS TABELAS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- URL: https://app.supabase.com/project/wsluajpeibcfeerbxqiz/sql/new
-- =====================================================

-- ATENÇÃO: Este script deleta TODOS os dados, mas mantém as tabelas!
-- As tabelas continuam existindo, apenas vazias.

-- Ordem de deleção (respeitando foreign keys):
-- 1. Tabelas dependentes primeiro
-- 2. Tabela principal (tokens_ml) por último

BEGIN;

-- 1. Deletar logs de monitoramento
DELETE FROM logs_monitoramento;
RAISE NOTICE '✅ Tabela logs_monitoramento limpa';

-- 2. Deletar anúncios
DELETE FROM anuncios;
RAISE NOTICE '✅ Tabela anuncios limpa';

-- 3. Deletar produtos
DELETE FROM produtos;
RAISE NOTICE '✅ Tabela produtos limpa';

-- 4. Deletar preços de concorrentes
DELETE FROM precos_concorrentes;
RAISE NOTICE '✅ Tabela precos_concorrentes limpa';

-- 5. Deletar catálogo
DELETE FROM catalogo;
RAISE NOTICE '✅ Tabela catalogo limpa';

-- 6. Deletar usuários
DELETE FROM usuarios;
RAISE NOTICE '✅ Tabela usuarios limpa';

-- 7. Deletar tokens do Mercado Livre (último por causa das FKs)
DELETE FROM tokens_ml;
RAISE NOTICE '✅ Tabela tokens_ml limpa';

COMMIT;

-- Verificar se as tabelas estão vazias
SELECT 'tokens_ml' as tabela, COUNT(*) as registros FROM tokens_ml
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos
UNION ALL
SELECT 'anuncios', COUNT(*) FROM anuncios
UNION ALL
SELECT 'catalogo', COUNT(*) FROM catalogo
UNION ALL
SELECT 'precos_concorrentes', COUNT(*) FROM precos_concorrentes
UNION ALL
SELECT 'logs_monitoramento', COUNT(*) FROM logs_monitoramento
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios;

-- Resultado esperado: todas as tabelas com 0 registros
-- ✅ Script concluído! Todas as tabelas foram limpas.
