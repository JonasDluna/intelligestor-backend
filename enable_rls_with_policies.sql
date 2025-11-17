-- ============================================
-- CONFIGURAÇÃO SEGURA DE RLS
-- Ativa RLS e cria políticas para cada tabela
-- ============================================

-- 1. TABELA USUARIOS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Service role tem acesso total
CREATE POLICY "service_role_all_usuarios" ON usuarios
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Usuários autenticados podem ver apenas seus próprios dados
CREATE POLICY "users_select_own_usuarios" ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "users_update_own_usuarios" ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- 2. TABELA PRODUTOS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_produtos" ON produtos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_select_own_produtos" ON produtos
  FOR SELECT
  TO authenticated
  USING (user_id::uuid = auth.uid());

CREATE POLICY "users_insert_own_produtos" ON produtos
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::uuid = auth.uid());

CREATE POLICY "users_update_own_produtos" ON produtos
  FOR UPDATE
  TO authenticated
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());

CREATE POLICY "users_delete_own_produtos" ON produtos
  FOR DELETE
  TO authenticated
  USING (user_id::uuid = auth.uid());


-- 3. TABELA TOKENS_ML
ALTER TABLE tokens_ml ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_tokens_ml" ON tokens_ml
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_tokens_ml" ON tokens_ml
  FOR ALL
  TO authenticated
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());


-- 4. TABELA ANUNCIOS_ML
ALTER TABLE anuncios_ml ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_anuncios_ml" ON anuncios_ml
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_anuncios_ml" ON anuncios_ml
  FOR ALL
  TO authenticated
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());


-- 5. TABELA ESTOQUE
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_estoque" ON estoque
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_estoque" ON estoque
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM produtos 
      WHERE produtos.id = estoque.produto_id 
      AND produtos.user_id::uuid = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM variacoes v
      JOIN produtos p ON p.id = v.produto_id
      WHERE v.id = estoque.variacao_id
      AND p.user_id::uuid = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM produtos 
      WHERE produtos.id = estoque.produto_id 
      AND produtos.user_id::uuid = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM variacoes v
      JOIN produtos p ON p.id = v.produto_id
      WHERE v.id = estoque.variacao_id
      AND p.user_id::uuid = auth.uid()
    )
  );


-- 6. TABELA VARIACOES
ALTER TABLE variacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_variacoes" ON variacoes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_variacoes" ON variacoes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);


-- 7. TABELA CONCORRENTES
ALTER TABLE concorrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_concorrentes" ON concorrentes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_concorrentes" ON concorrentes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);


-- 8. TABELA HISTORICO_BUYBOX
ALTER TABLE historico_buybox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_historico_buybox" ON historico_buybox
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_historico_buybox" ON historico_buybox
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);


-- 9. TABELA REGRAS_AUTOMACAO
ALTER TABLE regras_automacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_regras_automacao" ON regras_automacao
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_regras_automacao" ON regras_automacao
  FOR ALL
  TO authenticated
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());


-- 10. TABELA LOGS_AUTOMACAO
ALTER TABLE logs_automacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_logs_automacao" ON logs_automacao
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_select_own_logs_automacao" ON logs_automacao
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);


-- 11. TABELA LOGS_IA
ALTER TABLE logs_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_logs_ia" ON logs_ia
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_select_own_logs_ia" ON logs_ia
  FOR SELECT
  TO authenticated
  USING (user_id::uuid = auth.uid());


-- 12. TABELA LOGS_SISTEMA
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_logs_sistema" ON logs_sistema
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_select_own_logs_sistema" ON logs_sistema
  FOR SELECT
  TO authenticated
  USING (user_id::uuid = auth.uid());


-- 13. TABELA ARQUIVOS
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_arquivos" ON arquivos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_arquivos" ON arquivos
  FOR ALL
  TO authenticated
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());


-- 14. TABELA CATALOGO_ML
ALTER TABLE catalogo_ml ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_catalogo_ml" ON catalogo_ml
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Catálogo do ML é público para leitura
CREATE POLICY "public_read_catalogo_ml" ON catalogo_ml
  FOR SELECT
  TO authenticated
  USING (true);


-- 15. TABELA MOVIMENTACOES_ESTOQUE
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_movimentacoes_estoque" ON movimentacoes_estoque
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_all_own_movimentacoes_estoque" ON movimentacoes_estoque
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);


-- ============================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- ============================================

-- Ver todas as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
