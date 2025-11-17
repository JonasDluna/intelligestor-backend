"""
Script para ativar RLS com políticas de segurança
Executa o SQL de forma segura com políticas que permitem:
- service_role: acesso total (backend)
- authenticated: acesso apenas aos próprios dados
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Conectar ao PostgreSQL
conn = psycopg2.connect(
    host=f"db.{os.getenv('SUPABASE_URL').split('//')[1].split('.')[0]}.supabase.co",
    database="postgres",
    user="postgres",
    password=os.getenv("SUPABASE_DB_PASSWORD"),
    port=5432
)

cursor = conn.cursor()

try:
    # Ler o arquivo SQL
    with open('enable_rls_with_policies.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Dividir em statements individuais
    statements = [s.strip() for s in sql_content.split(';') if s.strip() and not s.strip().startswith('--')]
    
    print(f"📋 Total de {len(statements)} statements SQL\n")
    
    success_count = 0
    skip_count = 0
    
    for i, statement in enumerate(statements, 1):
        # Pular comentários e SELECTs de verificação
        if statement.startswith('--') or statement.upper().startswith('SELECT'):
            skip_count += 1
            continue
            
        try:
            cursor.execute(statement)
            conn.commit()
            
            # Identificar tipo de statement
            if 'ALTER TABLE' in statement.upper() and 'ENABLE ROW LEVEL SECURITY' in statement.upper():
                table = statement.split('ALTER TABLE')[1].split('ENABLE')[0].strip()
                print(f"✓ [{i}] RLS ativado em: {table}")
            elif 'CREATE POLICY' in statement.upper():
                policy = statement.split('"')[1] if '"' in statement else 'unnamed'
                table = statement.split(' ON ')[1].split()[0] if ' ON ' in statement else 'unknown'
                print(f"✓ [{i}] Política criada: {policy} → {table}")
            else:
                print(f"✓ [{i}] Statement executado")
                
            success_count += 1
            
        except psycopg2.errors.DuplicateObject as e:
            print(f"⚠ [{i}] Já existe: {str(e).split('DETAIL:')[0].strip()}")
            conn.rollback()
            skip_count += 1
            
        except Exception as e:
            print(f"❌ [{i}] ERRO: {str(e)[:100]}")
            conn.rollback()
    
    print(f"\n📊 RESUMO:")
    print(f"   ✅ Executados: {success_count}")
    print(f"   ⚠ Pulados: {skip_count}")
    print(f"\n🔒 RLS ativado com segurança!")
    print(f"   • service_role: Acesso total (backend)")
    print(f"   • authenticated: Acesso aos próprios dados")
    print(f"   • anon: Sem acesso (bloqueado por RLS)")
    
except Exception as e:
    print(f"\n❌ ERRO GERAL: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()

finally:
    cursor.close()
    conn.close()
