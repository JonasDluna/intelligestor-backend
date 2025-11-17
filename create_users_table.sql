-- Script SQL para criar tabela de usuários no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela users
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

-- Criar índice no email para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT público (registro)
CREATE POLICY "Permitir registro público" ON users
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir SELECT apenas do próprio usuário
CREATE POLICY "Usuários podem ver apenas seus dados" ON users
    FOR SELECT
    USING (id = auth.uid() OR auth.role() = 'service_role');

-- Política para permitir UPDATE apenas do próprio usuário
CREATE POLICY "Usuários podem atualizar apenas seus dados" ON users
    FOR UPDATE
    USING (id = auth.uid() OR auth.role() = 'service_role')
    WITH CHECK (id = auth.uid() OR auth.role() = 'service_role');

-- Comentários nas colunas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema Intelligestor';
COMMENT ON COLUMN users.id IS 'ID único do usuário (UUID)';
COMMENT ON COLUMN users.email IS 'Email do usuário (único)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha';
COMMENT ON COLUMN users.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN users.empresa IS 'Nome da empresa (opcional)';
COMMENT ON COLUMN users.ativo IS 'Se o usuário está ativo no sistema';
