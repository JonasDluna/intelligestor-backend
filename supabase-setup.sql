-- Crie esta tabela no Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query

-- Tabela de exemplo: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns dados de exemplo
INSERT INTO public.messages (content, user_name) VALUES
    ('Olá, esta é uma mensagem de teste!', 'Jonas'),
    ('Bem-vindo ao Intelligestor Backend', 'Sistema'),
    ('Integração Supabase funcionando!', 'Admin');

-- Permitir acesso público (opcional, configure conforme sua necessidade)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.messages
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.messages
    FOR INSERT WITH CHECK (true);
