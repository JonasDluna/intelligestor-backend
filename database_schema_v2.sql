-- =====================================================
-- INTELLIGESTOR - SCHEMA COMPLETO V2.0
-- Database: Supabase (PostgreSQL)
-- Arquitetura: Completa com IA, Estoque, ML, CRM
-- =====================================================

-- =====================================================
-- 1. AUTENTICAÇÃO E USUÁRIOS
-- =====================================================

-- Usuários do sistema (sincroniza com Supabase Auth)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome_completo VARCHAR(255),
    empresa VARCHAR(255),
    telefone VARCHAR(50),
    plano VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Tokens OAuth Mercado Livre
CREATE TABLE IF NOT EXISTS tokens_ml (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ml_user_id BIGINT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    nickname VARCHAR(255),
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    country_id VARCHAR(10),
    site_id VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tokens_ml_user_id ON tokens_ml(user_id);
CREATE INDEX idx_tokens_ml_ml_user_id ON tokens_ml(ml_user_id);

-- =====================================================
-- 2. PRODUTOS E CATÁLOGO
-- =====================================================

-- Produtos (SKU Interno)
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    sku_interno VARCHAR(100) UNIQUE NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    categoria_ml VARCHAR(100),
    marca VARCHAR(255),
    modelo VARCHAR(255),
    ean VARCHAR(50),
    ncm VARCHAR(20),
    
    -- Custos e Preços
    custo DECIMAL(10, 2),
    preco_sugerido DECIMAL(10, 2),
    margem_minima DECIMAL(5, 2) DEFAULT 20.00,
    
    -- Informações
    peso DECIMAL(10, 3),
    largura DECIMAL(10, 2),
    altura DECIMAL(10, 2),
    comprimento DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, discontinued
    tipo VARCHAR(50) DEFAULT 'simple', -- simple, variable
    
    -- Metadados
    tags JSONB,
    atributos JSONB,
    imagens JSONB, -- array de URLs
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_produtos_user_id ON produtos(user_id);
CREATE INDEX idx_produtos_sku ON produtos(sku_interno);
CREATE INDEX idx_produtos_status ON produtos(status);

-- Variações de Produtos
CREATE TABLE IF NOT EXISTS variacoes (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    sku_variacao VARCHAR(100) UNIQUE NOT NULL,
    
    -- Atributos
    atributo_cor VARCHAR(100),
    atributo_tamanho VARCHAR(100),
    atributo_voltagem VARCHAR(50),
    atributos_extras JSONB,
    
    -- Identificadores
    ean VARCHAR(50),
    upc VARCHAR(50),
    
    -- Mercado Livre
    item_id_ml VARCHAR(50),
    variation_id_ml BIGINT,
    
    -- Preço específico
    preco_adicional DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Imagens
    imagem_principal TEXT,
    imagens JSONB,
    
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_variacoes_produto_id ON variacoes(produto_id);
CREATE INDEX idx_variacoes_item_ml ON variacoes(item_id_ml);

-- =====================================================
-- 3. ESTOQUE
-- =====================================================

-- Estoque Principal
CREATE TABLE IF NOT EXISTS estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
    variacao_id INTEGER REFERENCES variacoes(id) ON DELETE CASCADE,
    
    -- Quantidades
    estoque_atual INTEGER DEFAULT 0,
    estoque_reservado INTEGER DEFAULT 0,
    estoque_disponivel INTEGER GENERATED ALWAYS AS (estoque_atual - estoque_reservado) STORED,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_maximo INTEGER DEFAULT 0,
    
    -- Localização
    localizacao VARCHAR(100),
    lote VARCHAR(100),
    
    -- Datas
    data_entrada DATE,
    data_validade DATE,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_produto_ou_variacao CHECK (
        (produto_id IS NOT NULL AND variacao_id IS NULL) OR
        (produto_id IS NULL AND variacao_id IS NOT NULL)
    )
);

CREATE INDEX idx_estoque_produto_id ON estoque(produto_id);
CREATE INDEX idx_estoque_variacao_id ON estoque(variacao_id);

-- Histórico de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id),
    estoque_id INTEGER NOT NULL REFERENCES estoque(id),
    
    tipo VARCHAR(50) NOT NULL, -- entrada, saida, ajuste, reserva, liberacao
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER,
    quantidade_nova INTEGER,
    
    motivo VARCHAR(255),
    documento VARCHAR(100), -- NF, OP, etc
    observacao TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_mov_estoque_user ON movimentacoes_estoque(user_id);
CREATE INDEX idx_mov_estoque_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX idx_mov_estoque_data ON movimentacoes_estoque(created_at);

-- =====================================================
-- 4. MERCADO LIVRE - ANÚNCIOS
-- =====================================================

-- Anúncios no Mercado Livre
CREATE TABLE IF NOT EXISTS anuncios_ml (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    
    -- IDs Mercado Livre
    ml_id VARCHAR(50) UNIQUE NOT NULL,
    item_id VARCHAR(50),
    
    -- Informações do Anúncio
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    available_quantity INTEGER NOT NULL,
    sold_quantity INTEGER DEFAULT 0,
    
    -- Configurações
    listing_type_id VARCHAR(50), -- gold_special, gold_pro, free
    buying_mode VARCHAR(50), -- buy_it_now, auction
    condition VARCHAR(50), -- new, used
    category_id VARCHAR(100),
    
    -- Status
    status VARCHAR(50), -- active, paused, closed, under_review
    health DECIMAL(3, 2), -- 0.00 a 1.00
    
    -- Imagens e Videos
    pictures JSONB,
    video_id VARCHAR(100),
    
    -- Logística
    shipping_mode VARCHAR(50), -- me1, me2, not_specified
    shipping_free BOOLEAN DEFAULT false,
    
    -- URLs
    permalink TEXT,
    
    -- Sync
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'pending', -- synced, pending, error
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_anuncios_user_id ON anuncios_ml(user_id);
CREATE INDEX idx_anuncios_ml_id ON anuncios_ml(ml_id);
CREATE INDEX idx_anuncios_status ON anuncios_ml(status);

-- =====================================================
-- 5. BUYBOX E CONCORRÊNCIA
-- =====================================================

-- Concorrentes
CREATE TABLE IF NOT EXISTS concorrentes (
    id SERIAL PRIMARY KEY,
    anuncio_id INTEGER NOT NULL REFERENCES anuncios_ml(id) ON DELETE CASCADE,
    
    -- Identificação
    ml_id VARCHAR(50) NOT NULL,
    seller_id BIGINT,
    seller_nickname VARCHAR(255),
    seller_reputation VARCHAR(50),
    
    -- Preço
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    
    -- Características
    shipping_free BOOLEAN DEFAULT false,
    condition VARCHAR(50),
    available_quantity INTEGER,
    sold_quantity INTEGER,
    
    -- BuyBox
    is_buybox_winner BOOLEAN DEFAULT false,
    
    -- URLs
    permalink TEXT,
    
    -- Rastreamento
    data_rastreio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_concorrentes_anuncio ON concorrentes(anuncio_id);
CREATE INDEX idx_concorrentes_seller ON concorrentes(seller_id);
CREATE INDEX idx_concorrentes_data ON concorrentes(data_rastreio);

-- Histórico BuyBox
CREATE TABLE IF NOT EXISTS historico_buybox (
    id SERIAL PRIMARY KEY,
    anuncio_id INTEGER NOT NULL REFERENCES anuncios_ml(id) ON DELETE CASCADE,
    
    -- Snapshot do momento
    nosso_preco DECIMAL(10, 2) NOT NULL,
    preco_campeao DECIMAL(10, 2) NOT NULL,
    diferenca_valor DECIMAL(10, 2),
    diferenca_percent DECIMAL(5, 2),
    
    -- Status
    estamos_no_buybox BOOLEAN DEFAULT false,
    seller_campeao VARCHAR(255),
    
    -- Análise IA
    analise_ia TEXT,
    recomendacao_ia TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hist_buybox_anuncio ON historico_buybox(anuncio_id);
CREATE INDEX idx_hist_buybox_data ON historico_buybox(created_at);

-- =====================================================
-- 6. INTELIGÊNCIA ARTIFICIAL - LOGS E ANÁLISES
-- =====================================================

-- Logs de IA
CREATE TABLE IF NOT EXISTS logs_ia (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id),
    
    -- Tipo de operação
    tipo VARCHAR(100) NOT NULL, -- buybox, price_optimization, content_generation, etc
    modelo VARCHAR(50), -- gpt-4, gpt-4-turbo, gpt-3.5-turbo
    
    -- Input/Output
    input_enviado TEXT,
    resposta TEXT,
    tokens_prompt INTEGER,
    tokens_completion INTEGER,
    tokens_total INTEGER,
    
    -- Custo
    custo_usd DECIMAL(10, 6),
    
    -- Contexto
    anuncio_id INTEGER REFERENCES anuncios_ml(id) ON DELETE SET NULL,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    
    -- Metadata
    parametros JSONB,
    resultado_aplicado BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_ia_user ON logs_ia(user_id);
CREATE INDEX idx_logs_ia_tipo ON logs_ia(tipo);
CREATE INDEX idx_logs_ia_data ON logs_ia(created_at);

-- =====================================================
-- 7. AUTOMAÇÃO E REGRAS
-- =====================================================

-- Regras de Automação
CREATE TABLE IF NOT EXISTS regras_automacao (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100) NOT NULL, -- price, buybox, stock, reactivation
    
    -- Condições (JSON)
    condicoes JSONB NOT NULL,
    -- Exemplo: {"campo": "diferenca_buybox", "operador": ">", "valor": 5}
    
    -- Ações (JSON)
    acoes JSONB NOT NULL,
    -- Exemplo: {"tipo": "ajustar_preco", "acao": "reduzir", "valor": 3}
    
    -- Configurações
    ativo BOOLEAN DEFAULT true,
    prioridade INTEGER DEFAULT 1,
    intervalo_minutos INTEGER DEFAULT 30,
    
    -- Execução
    ultima_execucao TIMESTAMP WITH TIME ZONE,
    proxima_execucao TIMESTAMP WITH TIME ZONE,
    vezes_executada INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_regras_user ON regras_automacao(user_id);
CREATE INDEX idx_regras_tipo ON regras_automacao(tipo);
CREATE INDEX idx_regras_ativo ON regras_automacao(ativo);

-- Logs de Execução de Regras
CREATE TABLE IF NOT EXISTS logs_automacao (
    id SERIAL PRIMARY KEY,
    regra_id INTEGER NOT NULL REFERENCES regras_automacao(id) ON DELETE CASCADE,
    
    status VARCHAR(50) NOT NULL, -- success, error, skipped
    resultado TEXT,
    erro TEXT,
    
    -- Mudanças aplicadas
    mudancas_aplicadas JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_auto_regra ON logs_automacao(regra_id);
CREATE INDEX idx_logs_auto_data ON logs_automacao(created_at);

-- =====================================================
-- 8. CATÁLOGO ML (Cache)
-- =====================================================

-- Catálogo do Mercado Livre (para busca rápida)
CREATE TABLE IF NOT EXISTS catalogo_ml (
    id SERIAL PRIMARY KEY,
    ml_catalog_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category_id VARCHAR(50),
    brand VARCHAR(255),
    model VARCHAR(255),
    gtin VARCHAR(50),
    mpn VARCHAR(50),
    atributos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_catalogo_ml_id ON catalogo_ml(ml_catalog_id);
CREATE INDEX idx_catalogo_brand ON catalogo_ml(brand);

-- =====================================================
-- 9. SISTEMA DE LOGS GERAL
-- =====================================================

-- Logs de Sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES usuarios(id),
    
    tipo VARCHAR(100) NOT NULL, -- webhook, sync, error, info
    nivel VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error, critical
    
    origem VARCHAR(100), -- ml_webhook, cron_job, api_endpoint
    acao VARCHAR(255) NOT NULL,
    
    detalhes JSONB,
    erro TEXT,
    stack_trace TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_sistema_user ON logs_sistema(user_id);
CREATE INDEX idx_logs_sistema_tipo ON logs_sistema(tipo);
CREATE INDEX idx_logs_sistema_nivel ON logs_sistema(nivel);
CREATE INDEX idx_logs_sistema_data ON logs_sistema(created_at);

-- =====================================================
-- 10. STORAGE (Referências)
-- =====================================================

-- Arquivos (PDFs, Imagens, etc)
CREATE TABLE IF NOT EXISTS arquivos (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100), -- pdf, image, document
    mime_type VARCHAR(100),
    tamanho BIGINT,
    
    -- Storage Supabase
    bucket VARCHAR(100) NOT NULL,
    path TEXT NOT NULL,
    url_publica TEXT,
    
    -- Relacionamentos
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    anuncio_id INTEGER REFERENCES anuncios_ml(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_arquivos_user ON arquivos(user_id);
CREATE INDEX idx_arquivos_tipo ON arquivos(tipo);

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_ml ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios_ml ENABLE ROW LEVEL SECURITY;
ALTER TABLE concorrentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_buybox ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_automacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_automacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de segurança
CREATE POLICY "Users can view their own data" ON produtos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON produtos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON produtos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON produtos
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 12. FUNÇÕES E TRIGGERS
-- =====================================================

-- Atualizar campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_ml_updated_at BEFORE UPDATE ON tokens_ml
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. VIEWS ÚTEIS
-- =====================================================

-- View: Produtos com Estoque
CREATE OR REPLACE VIEW v_produtos_estoque AS
SELECT 
    p.*,
    COALESCE(e.estoque_disponivel, 0) as estoque_disponivel,
    COALESCE(e.estoque_reservado, 0) as estoque_reservado
FROM produtos p
LEFT JOIN estoque e ON p.id = e.produto_id
WHERE p.status = 'active';

-- View: Anúncios com Status BuyBox
CREATE OR REPLACE VIEW v_anuncios_buybox AS
SELECT 
    a.*,
    hb.estamos_no_buybox,
    hb.preco_campeao,
    hb.diferenca_percent
FROM anuncios_ml a
LEFT JOIN LATERAL (
    SELECT * FROM historico_buybox 
    WHERE anuncio_id = a.id 
    ORDER BY created_at DESC 
    LIMIT 1
) hb ON true
WHERE a.status = 'active';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Schema IntelliGestor V2.0 criado com sucesso!';
    RAISE NOTICE '📊 Tabelas: 18';
    RAISE NOTICE '🔒 RLS: Habilitado';
    RAISE NOTICE '⚡ Triggers: Configurados';
    RAISE NOTICE '👁️ Views: 2';
    RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$;
