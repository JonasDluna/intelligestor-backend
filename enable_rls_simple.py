"""
Script simplificado para ativar RLS com segurança
Ativa RLS e dá acesso total ao service_role (usado pelo backend)
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg2.connect(
    host=f"db.{os.getenv('SUPABASE_URL').split('//')[1].split('.')[0]}.supabase.co",
    database="postgres",
    user="postgres",
    password=os.getenv("SUPABASE_DB_PASSWORD"),
    port=5432
)

cursor = conn.cursor()

try:
    with open('enable_rls_simple.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    print("🔒 Ativando RLS com políticas service_role...\n")
    
    cursor.execute(sql)
    conn.commit()
    
    print("\n✅ RLS ativado com sucesso!")
    print("\n📋 Configuração de segurança:")
    print("   • RLS: ATIVADO em todas as tabelas")
    print("   • service_role: Acesso total (backend)")
    print("   • authenticated/anon: BLOQUEADO (sem políticas)")
    print("\n⚠ IMPORTANTE:")
    print("   O backend usa SERVICE_ROLE_KEY que bypassa RLS")
    print("   Controle de acesso é feito no código do backend")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()

finally:
    cursor.close()
    conn.close()
