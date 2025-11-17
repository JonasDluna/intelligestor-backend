"""
Script para adicionar constraint UNIQUE no campo user_id da tabela tokens_ml
Isso permite usar upsert() com on_conflict="user_id" conforme padrão OAuth2
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Carregar variáveis de ambiente
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERRO: Defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*60)
print("🔧 ADICIONANDO UNIQUE CONSTRAINT NO tokens_ml.user_id")
print("="*60 + "\n")

try:
    # SQL para adicionar constraint UNIQUE
    sql = """
    -- Adicionar constraint UNIQUE no user_id
    ALTER TABLE tokens_ml 
    ADD CONSTRAINT tokens_ml_user_id_unique UNIQUE (user_id);
    """
    
    print("Executando SQL...")
    print(sql)
    
    # Executar SQL via RPC (se disponível) ou diretamente
    result = supabase.rpc("exec_sql", {"sql": sql}).execute()
    
    print("\n✅ Constraint UNIQUE adicionada com sucesso!")
    print("\nAgora você pode usar:")
    print("  supabase.table('tokens_ml').upsert({...}, on_conflict='user_id')")
    
except Exception as e:
    error_msg = str(e)
    
    if "already exists" in error_msg or "duplicate key" in error_msg:
        print("\n⚠️  Constraint já existe - nada a fazer!")
    else:
        print(f"\n❌ Erro ao adicionar constraint: {error_msg}")
        print("\n💡 Execute manualmente no SQL Editor do Supabase:")
        print("\n" + sql)

print("\n" + "="*60 + "\n")
