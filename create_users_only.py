"""
Criar apenas a tabela users que está faltando
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

sql_users = """
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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir registro público" ON users;
CREATE POLICY "Permitir registro público" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role tem acesso total" ON users;
CREATE POLICY "Service role tem acesso total" ON users FOR ALL USING (true);
"""

print("📊 Criando tabela users...")
print("\n⚠️  Execute este SQL manualmente no Supabase SQL Editor:")
print("=" * 60)
print(sql_users)
print("=" * 60)
print("\nAcesse: https://app.supabase.com/project/wsluajpeibcfeerbxqiz/editor")
print("\n✅ Depois teste novamente o registro de usuário!")
