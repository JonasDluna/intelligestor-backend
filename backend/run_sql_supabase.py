"""
Script para executar SQL no Supabase via Python
Busca credenciais automaticamente das variáveis de ambiente
"""
import os
import sys
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2-binary não está instalado!")
    print("📦 Instalando agora...")
    os.system("pip install psycopg2-binary")
    import psycopg2

# Extrair credenciais do SUPABASE_URL
SUPABASE_URL = os.getenv("SUPABASE_URL", "")

if not SUPABASE_URL:
    print("❌ SUPABASE_URL não encontrada!")
    print("💡 Configure no arquivo .env ou informe manualmente")
    sys.exit(1)

# Parse da URL do Supabase para obter o host
# Formato: https://xxxxx.supabase.co
SUPABASE_DB_HOST = SUPABASE_URL.replace("https://", "").replace("http://", "")
if not SUPABASE_DB_HOST.startswith("db."):
    # Converte xxxxx.supabase.co para db.xxxxx.supabase.co
    SUPABASE_DB_HOST = "db." + SUPABASE_DB_HOST

SUPABASE_DB_PORT = "5432"
SUPABASE_DB_NAME = "postgres"
SUPABASE_DB_USER = "postgres"

# Buscar senha
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD") or os.getenv("SUPABASE_PASSWORD")

if not SUPABASE_DB_PASSWORD:
    print("⚠️  Senha do banco não encontrada nas variáveis de ambiente")
    print("🔑 Por favor, informe a senha do PostgreSQL do Supabase:")
    SUPABASE_DB_PASSWORD = input("Password: ").strip()

SQL_SCRIPT = """
-- Desabilitar RLS
ALTER TABLE public.integrations_ml DISABLE ROW LEVEL SECURITY;

-- Conceder permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.integrations_ml TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verificar
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'integrations_ml';
"""

def main():
    print(f"🔌 Conectando ao Supabase PostgreSQL...")
    print(f"   Host: {SUPABASE_DB_HOST}")
    print(f"   Database: {SUPABASE_DB_NAME}")
    print(f"   User: {SUPABASE_DB_USER}")
    
    try:
        conn = psycopg2.connect(
            host=SUPABASE_DB_HOST,
            port=SUPABASE_DB_PORT,
            dbname=SUPABASE_DB_NAME,
            user=SUPABASE_DB_USER,
            password=SUPABASE_DB_PASSWORD
        )
        
        cursor = conn.cursor()
        
        print("✅ Conectado! Executando SQL...")
        
        # Executar comandos um por um
        commands = [
            "ALTER TABLE public.integrations_ml DISABLE ROW LEVEL SECURITY",
            "GRANT USAGE ON SCHEMA public TO anon, authenticated",
            "GRANT ALL ON public.integrations_ml TO anon, authenticated",
            "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated"
        ]
        
        for cmd in commands:
            try:
                cursor.execute(cmd)
                conn.commit()
                print(f"   ✓ {cmd[:50]}...")
            except Exception as e:
                print(f"   ⚠️  {cmd[:50]}... - {str(e)[:100]}")
        
        # Buscar resultado da verificação
        cursor.execute("SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'integrations_ml'")
        result = cursor.fetchone()
        
        print(f"\n📊 Resultado:")
        print(f"   Tabela: {result[0]}")
        print(f"   RLS Ativo: {result[1]}")
        
        if not result[1]:
            print("\n🎉 SUCESSO! RLS desabilitado e permissões concedidas!")
            print("🚀 Teste o frontend agora - o erro de permissão deve ter sumido!")
        else:
            print("\n⚠️ RLS ainda está ativo. Pode precisar de permissões adicionais.")
        
        cursor.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ Erro de conexão: {e}")
        print("\n💡 Possíveis soluções:")
        print("   1. Verifique se a senha está correta")
        print("   2. No Supabase Dashboard → Settings → Database")
        print("   3. Adicione seu IP na whitelist (se necessário)")
        print("   4. Verifique se o host está correto")
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        print("\n💡 Tente executar o SQL manualmente no Supabase SQL Editor")

if __name__ == "__main__":
    main()
