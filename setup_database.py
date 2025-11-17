"""
Script para criar todas as tabelas no banco de dados Supabase
Executa o schema SQL automaticamente
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import quote_plus

load_dotenv()

def get_database_connection():
    """Conecta ao PostgreSQL usando parâmetros individuais"""
    supabase_url = os.getenv("SUPABASE_URL", "")
    
    if not supabase_url:
        raise ValueError("SUPABASE_URL não configurada no .env")
    
    # Extrair project_id da URL do Supabase
    # Formato: https://xxxxx.supabase.co
    project_id = supabase_url.replace("https://", "").replace(".supabase.co", "")
    
    # Password do banco
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "")
    
    if not db_password:
        print("\n⚠️  SUPABASE_DB_PASSWORD não encontrado no .env")
        print("📋 Para encontrar a senha do banco:")
        print("   1. Acesse: https://supabase.com/dashboard")
        print("   2. Vá em: Settings -> Database")
        print("   3. Copie a senha em 'Database password'")
        print("   4. Adicione no .env: SUPABASE_DB_PASSWORD=sua_senha\n")
        db_password = input("Digite a senha do banco aqui (ou pressione Enter para cancelar): ")
        
        if not db_password:
            raise ValueError("Senha do banco necessária")
    
    # Conectar usando parâmetros individuais (mais seguro que URL)
    return psycopg2.connect(
        host=f"db.{project_id}.supabase.co",
        port=5432,
        database="postgres",
        user="postgres",
        password=db_password
    )


def execute_sql_file(filepath: str):
    """Executa um arquivo SQL no banco de dados"""
    try:
        # Conectar ao banco
        print(f"🔌 Conectando ao Supabase PostgreSQL...")
        conn = get_database_connection()
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Ler arquivo SQL
        print(f"📄 Lendo arquivo: {filepath}")
        with open(filepath, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Executar SQL - dividir por statements para melhor controle de erros
        print(f"⚙️  Executando script SQL...")
        
        # Dividir por ; e executar cada statement
        statements = [s.strip() for s in sql_script.split(';') if s.strip()]
        
        success_count = 0
        skip_count = 0
        
        for i, statement in enumerate(statements, 1):
            try:
                cursor.execute(statement)
                success_count += 1
            except psycopg2.Error as e:
                # Ignorar erros de objetos que já existem
                if e.pgcode in ['42P07', '42710']:  # relation exists, duplicate object
                    skip_count += 1
                else:
                    print(f"⚠️  Aviso no statement {i}: {e}")
        
        print(f"✅ Executados: {success_count} statements")
        if skip_count > 0:
            print(f"⏭️  Ignorados (já existem): {skip_count} objetos")
        
        print("✅ Schema criado com sucesso!")
        print("\n📊 Tabelas criadas:")
        
        # Listar tabelas criadas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        for table in tables:
            print(f"   ✓ {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Banco de dados configurado com sucesso!")
        print("🚀 Agora você pode testar o backend em:")
        print("   https://intelligestor-backend.onrender.com/produtos/")
        
    except psycopg2.Error as e:
        print(f"\n❌ Erro ao executar SQL: {e}")
        print(f"Código do erro: {e.pgcode}")
        raise
    except FileNotFoundError:
        print(f"\n❌ Arquivo não encontrado: {filepath}")
        print("Certifique-se de que o arquivo database_schema_v2.sql existe")
        raise
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        raise


if __name__ == "__main__":
    print("=" * 60)
    print("🗄️  SETUP DO BANCO DE DADOS SUPABASE")
    print("=" * 60)
    print()
    
    schema_file = "database_schema_v2.sql"
    
    try:
        execute_sql_file(schema_file)
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada pelo usuário")
    except Exception as e:
        print(f"\n❌ Falha ao configurar banco de dados")
        print("Verifique as credenciais no arquivo .env")
