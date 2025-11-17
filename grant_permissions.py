"""
Script para dar permissões nas tabelas
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Conectar diretamente ao PostgreSQL
conn = psycopg2.connect(
    host=f"db.{os.getenv('SUPABASE_URL').split('//')[1].split('.')[0]}.supabase.co",
    database="postgres",
    user="postgres",
    password=os.getenv("SUPABASE_DB_PASSWORD"),
    port=5432
)

cursor = conn.cursor()

try:
    # Tabelas principais
    tables = [
        "usuarios",
        "produtos", 
        "tokens_ml",
        "anuncios_ml",
        "estoque",
        "variacoes",
        "concorrentes",
        "historico_buybox",
        "regras_automacao",
        "logs_automacao",
        "logs_ia",
        "logs_sistema",
        "arquivos",
        "catalogo_ml",
        "movimentacoes_estoque"
    ]
    
    for table in tables:
        print(f"Dando permissões em {table}...")
        
        # Grant ao service_role (já tem tudo)
        cursor.execute(f"GRANT ALL ON {table} TO service_role;")
        
        # Grant ao anon e authenticated
        cursor.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON {table} TO anon;")
        cursor.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON {table} TO authenticated;")
        
        # Grant SELECT para postgres
        cursor.execute(f"GRANT ALL ON {table} TO postgres;")
        
        conn.commit()
        print(f"✓ Permissões configuradas em {table}")
    
    print("\n✅ Permissões configuradas em todas as tabelas!")
    
except Exception as e:
    print(f"\n❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()

finally:
    cursor.close()
    conn.close()
