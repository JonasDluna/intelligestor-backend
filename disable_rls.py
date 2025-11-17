"""
Script para desabilitar RLS nas tabelas
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
    # Desabilitar RLS nas principais tabelas
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
        print(f"Desabilitando RLS em {table}...")
        cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")
        conn.commit()
        print(f"✓ RLS desabilitado em {table}")
    
    print("\n✅ RLS desabilitado em todas as tabelas!")
    
except Exception as e:
    print(f"\n❌ ERRO: {e}")
    conn.rollback()

finally:
    cursor.close()
    conn.close()
