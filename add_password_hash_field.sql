-- Adicionar campo password_hash na tabela usuarios
-- Isso permite autenticação manual com bcrypt

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
