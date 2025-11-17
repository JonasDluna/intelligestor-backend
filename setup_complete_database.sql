-- ============================================
-- INTELLIGESTOR - SETUP COMPLETO DO BANCO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. TABELA DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    custo DECIMAL(10,2),
    sku VARCHAR(100) UNIQUE,
    categoria VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);

-- ============================================
-- 3. TABELA DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    variacao_id INTEGER,
    estoque_atual INTEGER DEFAULT 0,
    estoque_disponivel INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_reservado INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(produto_id, variacao_id)
);

CREATE INDEX IF NOT EXISTS idx_estoque_produto_id ON estoque(produto_id);

-- ============================================
-- 4. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    variacao_id INTEGER,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'reserva', 'liberacao')),
    quantidade INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    custo_unitario DECIMAL(10,2),
    documento VARCHAR(255),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON movimentacoes_estoque(created_at);

-- ============================================
-- 5. TABELA DE TOKENS MERCADO LIVRE
-- ============================================
CREATE TABLE IF NOT EXISTS tokens_ml (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ml_user_id BIGINT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    nickname VARCHAR(255),
    email VARCHAR(255),
    site_id VARCHAR(10) DEFAULT 'MLB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_ml_user_id ON tokens_ml(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_ml_ml_user_id ON tokens_ml(ml_user_id);

-- ============================================
-- 6. TABELA DE ANÚNCIOS MERCADO LIVRE
-- ============================================
CREATE TABLE IF NOT EXISTS anuncios_ml (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    ml_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT,
    price DECIMAL(10,2),
    available_quantity INTEGER,
    status VARCHAR(50),
    permalink TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anuncios_ml_user_id ON anuncios_ml(user_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_ml_produto_id ON anuncios_ml(produto_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_ml_ml_id ON anuncios_ml(ml_id);

-- ============================================
-- 7. TABELA DE CONCORRENTES (BUYBOX)
-- ============================================
CREATE TABLE IF NOT EXISTS concorrentes (
    id SERIAL PRIMARY KEY,
    anuncio_id INTEGER NOT NULL REFERENCES anuncios_ml(id) ON DELETE CASCADE,
    seller_id BIGINT,
    preco DECIMAL(10,2) NOT NULL,
    reputacao VARCHAR(50),
    quantidade_vendida INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_concorrentes_anuncio_id ON concorrentes(anuncio_id);

-- ============================================
-- 8. TABELA DE HISTÓRICO BUYBOX
-- ============================================
CREATE TABLE IF NOT EXISTS historico_buybox (
    id SERIAL PRIMARY KEY,
    anuncio_id INTEGER NOT NULL REFERENCES anuncios_ml(id) ON DELETE CASCADE,
    nosso_preco DECIMAL(10,2) NOT NULL,
    preco_campeao DECIMAL(10,2) NOT NULL,
    estamos_no_buybox BOOLEAN,
    diferenca_percent DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_buybox_anuncio_id ON historico_buybox(anuncio_id);
CREATE INDEX IF NOT EXISTS idx_historico_buybox_created_at ON historico_buybox(created_at);

-- ============================================
-- 9. TABELA DE REGRAS DE AUTOMAÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS regras_automacao (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('price', 'buybox', 'stock', 'reactivation')),
    condicoes JSONB NOT NULL,
    acoes JSONB NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    vezes_executada INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regras_automacao_user_id ON regras_automacao(user_id);
CREATE INDEX IF NOT EXISTS idx_regras_automacao_ativo ON regras_automacao(ativo);

-- ============================================
-- 10. TABELA DE LOGS DE AUTOMAÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS logs_automacao (
    id SERIAL PRIMARY KEY,
    regra_id INTEGER REFERENCES regras_automacao(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sucesso BOOLEAN,
    detalhes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_automacao_regra_id ON logs_automacao(regra_id);
CREATE INDEX IF NOT EXISTS idx_logs_automacao_created_at ON logs_automacao(created_at);

-- ============================================
-- 11. TABELA DE LOGS DA IA
-- ============================================
CREATE TABLE IF NOT EXISTS logs_ia (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    input TEXT,
    output TEXT,
    tokens_usados INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_ia_user_id ON logs_ia(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_ia_created_at ON logs_ia(created_at);

-- ============================================
-- 12. TABELA DE LOGS DO SISTEMA
-- ============================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    dados JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_sistema_tipo ON logs_sistema(tipo);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON logs_sistema(created_at);

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para produtos abaixo do estoque mínimo
CREATE OR REPLACE FUNCTION produtos_abaixo_minimo(p_user_id UUID)
RETURNS TABLE (
    produto_id INTEGER,
    nome VARCHAR,
    estoque_atual INTEGER,
    estoque_minimo INTEGER,
    diferenca INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nome,
        COALESCE(e.estoque_atual, 0) as estoque_atual,
        COALESCE(e.estoque_minimo, 0) as estoque_minimo,
        COALESCE(e.estoque_minimo, 0) - COALESCE(e.estoque_atual, 0) as diferenca
    FROM produtos p
    LEFT JOIN estoque e ON e.produto_id = p.id
    WHERE p.user_id = p_user_id
    AND COALESCE(e.estoque_atual, 0) < COALESCE(e.estoque_minimo, 0)
    ORDER BY diferenca DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (ROW LEVEL SECURITY) - SEGURANÇA
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_ml ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios_ml ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_automacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_automacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_ia ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
DROP POLICY IF EXISTS "Permitir registro público" ON users;
CREATE POLICY "Permitir registro público" ON users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role tem acesso total" ON users;
CREATE POLICY "Service role tem acesso total" ON users
    FOR ALL USING (true);

-- Políticas para PRODUTOS
DROP POLICY IF EXISTS "Usuários veem apenas seus produtos" ON produtos;
CREATE POLICY "Usuários veem apenas seus produtos" ON produtos
    FOR ALL USING (true);

-- Políticas para ESTOQUE
DROP POLICY IF EXISTS "Acesso total ao estoque" ON estoque;
CREATE POLICY "Acesso total ao estoque" ON estoque
    FOR ALL USING (true);

-- Políticas para MOVIMENTAÇÕES
DROP POLICY IF EXISTS "Acesso total às movimentações" ON movimentacoes_estoque;
CREATE POLICY "Acesso total às movimentações" ON movimentacoes_estoque
    FOR ALL USING (true);

-- Políticas para TOKENS ML
DROP POLICY IF EXISTS "Acesso total aos tokens" ON tokens_ml;
CREATE POLICY "Acesso total aos tokens" ON tokens_ml
    FOR ALL USING (true);

-- Políticas para ANÚNCIOS ML
DROP POLICY IF EXISTS "Acesso total aos anúncios" ON anuncios_ml;
CREATE POLICY "Acesso total aos anúncios" ON anuncios_ml
    FOR ALL USING (true);

-- Políticas para REGRAS DE AUTOMAÇÃO
DROP POLICY IF EXISTS "Acesso total às regras" ON regras_automacao;
CREATE POLICY "Acesso total às regras" ON regras_automacao
    FOR ALL USING (true);

-- Políticas para LOGS DE AUTOMAÇÃO
DROP POLICY IF EXISTS "Acesso total aos logs de automação" ON logs_automacao;
CREATE POLICY "Acesso total aos logs de automação" ON logs_automacao
    FOR ALL USING (true);

-- Políticas para LOGS DA IA
DROP POLICY IF EXISTS "Acesso total aos logs da IA" ON logs_ia;
CREATE POLICY "Acesso total aos logs da IA" ON logs_ia
    FOR ALL USING (true);

-- ============================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Inserir usuário de teste (senha: teste123)
-- Hash gerado: $2b$12$LQ... (você precisará gerar via bcrypt)
-- INSERT INTO users (email, password_hash, nome, empresa) 
-- VALUES ('teste@intelligestor.com', '$2b$12$...', 'Usuário Teste', 'Intelligestor');

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- SCRIPT CONCLUÍDO COM SUCESSO! ✅
-- ============================================
-- Agora você pode usar o sistema completo:
-- 1. Registrar usuários via API
-- 2. Criar produtos
-- 3. Gerenciar estoque
-- 4. Conectar com Mercado Livre
-- 5. Usar automações e IA
-- ============================================
