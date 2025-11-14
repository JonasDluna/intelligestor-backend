# SQL para criar tabelas no Supabase

-- Tabela: tokens_ml
-- Armazena tokens OAuth2 do Mercado Livre
CREATE TABLE IF NOT EXISTS tokens_ml (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    nickname VARCHAR(255),
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: produtos
-- Armazena produtos do usuário
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ml_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    price DECIMAL(10, 2),
    available_quantity INTEGER,
    condition VARCHAR(50),
    category_id VARCHAR(50),
    thumbnail TEXT,
    permalink TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tokens_ml(user_id)
);

-- Tabela: anuncios
-- Armazena anúncios criados
CREATE TABLE IF NOT EXISTS anuncios (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ml_id VARCHAR(50) UNIQUE NOT NULL,
    product_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    listing_type_id VARCHAR(50),
    buying_mode VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tokens_ml(user_id),
    FOREIGN KEY (product_id) REFERENCES produtos(id)
);

-- Tabela: catalogo
-- Armazena itens do catálogo do ML
CREATE TABLE IF NOT EXISTS catalogo (
    id SERIAL PRIMARY KEY,
    ml_catalog_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category_id VARCHAR(50),
    brand VARCHAR(255),
    model VARCHAR(255),
    gtin VARCHAR(50),
    mpn VARCHAR(50),
    attributes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: precos_concorrentes
-- Armazena preços de concorrentes para comparação
CREATE TABLE IF NOT EXISTS precos_concorrentes (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    seller_id BIGINT,
    seller_nickname VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    shipping_free BOOLEAN DEFAULT FALSE,
    condition VARCHAR(50),
    reputation VARCHAR(50),
    permalink TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: logs_monitoramento
-- Armazena logs de monitoramento e automações
CREATE TABLE IF NOT EXISTS logs_monitoramento (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tokens_ml(user_id)
);

-- Tabela: usuarios
-- Armazena informações adicionais dos usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    email VARCHAR(255),
    nome_completo VARCHAR(255),
    plano VARCHAR(50) DEFAULT 'free',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tokens_ml(user_id)
);

-- Índices para melhor performance
CREATE INDEX idx_produtos_user_id ON produtos(user_id);
CREATE INDEX idx_produtos_ml_id ON produtos(ml_id);
CREATE INDEX idx_anuncios_user_id ON anuncios(user_id);
CREATE INDEX idx_precos_product_id ON precos_concorrentes(product_id);
CREATE INDEX idx_precos_created_at ON precos_concorrentes(created_at);
CREATE INDEX idx_logs_user_id ON logs_monitoramento(user_id);
CREATE INDEX idx_logs_created_at ON logs_monitoramento(created_at);

-- RLS (Row Level Security) - Recomendado para Supabase
ALTER TABLE tokens_ml ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_monitoramento ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de segurança (ajustar conforme necessário)
CREATE POLICY "Users can view their own data" ON produtos
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can insert their own data" ON produtos
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

CREATE POLICY "Users can update their own data" ON produtos
    FOR UPDATE USING (auth.uid()::bigint = user_id);
