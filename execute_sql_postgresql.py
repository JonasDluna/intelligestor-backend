"""
Script para executar SQL diretamente no PostgreSQL via Supabase
Adiciona password_hash e configura senha do usuário
"""
import os
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

# Carregar variáveis de ambiente
load_dotenv()

# Supabase fornece DATABASE_URL no formato PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")

if not DATABASE_URL and not SUPABASE_URL:
    print("❌ ERRO: Configure DATABASE_URL ou SUPABASE_URL no .env")
    exit(1)

# Se só tem SUPABASE_URL, construir DATABASE_URL
if not DATABASE_URL and SUPABASE_URL:
    # Extrair project_id da URL do Supabase
    project_id = SUPABASE_URL.replace("https://", "").split(".")[0]
    print(f"⚠️  DATABASE_URL não encontrado. Você precisa obter a connection string do Supabase:")
    print(f"   1. Vá para: https://supabase.com/dashboard/project/{project_id}/settings/database")
    print(f"   2. Copie a 'Connection string' (URI format)")
    print(f"   3. Adicione ao .env como DATABASE_URL=...")
    exit(1)

print("\n" + "="*60)
print("🔧 EXECUTANDO SQL NO POSTGRESQL")
print("="*60 + "\n")

try:
    # Conectar ao PostgreSQL
    print("1️⃣ Conectando ao PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    print("   ✅ Conectado com sucesso!\n")
    
    # SQL 1: Adicionar coluna password_hash
    print("2️⃣ Adicionando coluna password_hash...")
    sql_add_column = """
    ALTER TABLE usuarios 
    ADD COLUMN IF NOT EXISTS password_hash TEXT;
    """
    cursor.execute(sql_add_column)
    conn.commit()
    print("   ✅ Coluna adicionada!\n")
    
    # SQL 2: Configurar senha do usuário
    print("3️⃣ Configurando senha para jonastortorette@hotmail.com...")
    password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.sO8o3i"
    sql_update_password = """
    UPDATE usuarios 
    SET password_hash = %s
    WHERE email = %s
    RETURNING id, email, nome_completo;
    """
    cursor.execute(sql_update_password, (password_hash, "jonastortorette@hotmail.com"))
    result = cursor.fetchone()
    conn.commit()
    
    if result:
        print("   ✅ Senha configurada com sucesso!")
        print(f"   ID: {result[0]}")
        print(f"   Email: {result[1]}")
        print(f"   Nome: {result[2]}\n")
    else:
        print("   ⚠️  Usuário não encontrado\n")
    
    # SQL 3: Verificar estrutura
    print("4️⃣ Verificando estrutura da tabela...")
    sql_verify = """
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'usuarios'
    ORDER BY ordinal_position;
    """
    cursor.execute(sql_verify)
    columns = cursor.fetchall()
    
    print("   Colunas da tabela usuarios:")
    for col in columns:
        nullable = "NULL" if col[2] == "YES" else "NOT NULL"
        print(f"   - {col[0]}: {col[1]} ({nullable})")
    
    # Fechar conexão
    cursor.close()
    conn.close()
    
    print("\n" + "="*60)
    print("✅ SQL EXECUTADO COM SUCESSO!")
    print("="*60)
    print("\n🔑 CREDENCIAIS DE LOGIN:")
    print("   Email: jonastortorette@hotmail.com")
    print("   Senha: senha123")
    print("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
    print("\n🚀 PRÓXIMOS PASSOS:")
    print("   1. Aguarde Render redeploy (2-3 min)")
    print("   2. Acesse: https://intelligestor-frontend.vercel.app/login")
    print("   3. Faça login com as credenciais acima")
    print("   4. Conecte com Mercado Livre!\n")
    
except psycopg2.Error as e:
    print(f"\n❌ ERRO PostgreSQL: {e}")
    print("\n💡 SOLUÇÃO ALTERNATIVA:")
    print("   Execute no SQL Editor do Supabase:\n")
    print("   ALTER TABLE usuarios")
    print("   ADD COLUMN IF NOT EXISTS password_hash TEXT;")
    print("")
    print("   UPDATE usuarios")
    print("   SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.sO8o3i'")
    print("   WHERE email = 'jonastortorette@hotmail.com';")
    print("")
except Exception as e:
    print(f"\n❌ ERRO: {e}")

print("\n" + "="*60 + "\n")
