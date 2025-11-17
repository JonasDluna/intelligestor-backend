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

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT público (registro)
DROP POLICY IF EXISTS "Permitir registro público" ON users;
CREATE POLICY "Permitir registro público" ON users FOR INSERT WITH CHECK (true);

-- Política para service role
DROP POLICY IF EXISTS "Service role tem acesso total" ON users;
CREATE POLICY "Service role tem acesso total" ON users FOR ALL USING (true);
