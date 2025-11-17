"""
Script para criar usuário padrão no banco de dados
"""
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def create_default_user():
    """Cria usuário padrão 'default' no banco"""
    try:
        # Conectar
        supabase_url = os.getenv("SUPABASE_URL", "")
        project_id = supabase_url.replace("https://", "").replace(".supabase.co", "")
        db_password = os.getenv("SUPABASE_DB_PASSWORD", "")
        
        conn = psycopg2.connect(
            host=f"db.{project_id}.supabase.co",
            port=5432,
            database="postgres",
            user="postgres",
            password=db_password
        )
        
        cursor = conn.cursor()
        
        # Verificar se já existe
        cursor.execute("SELECT id FROM usuarios WHERE email = 'default@intelligestor.com'")
        existing = cursor.fetchone()
        
        if existing:
            print(f"✅ Usuário padrão já existe: {existing[0]}")
            cursor.close()
            conn.close()
            return existing[0]
        
        # Criar usuário padrão
        cursor.execute("""
            INSERT INTO usuarios (email, nome_completo, empresa, plano, status)
            VALUES ('default@intelligestor.com', 'Usuário Padrão', 'IntelliGestor', 'premium', 'active')
            RETURNING id
        """)
        
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        print(f"✅ Usuário padrão criado com sucesso!")
        print(f"📧 Email: default@intelligestor.com")
        print(f"🆔 ID: {user_id}")
        
        cursor.close()
        conn.close()
        
        return user_id
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        raise

if __name__ == "__main__":
    print("=" * 60)
    print("👤 CRIANDO USUÁRIO PADRÃO")
    print("=" * 60)
    print()
    create_default_user()
    print("\n🎉 Pronto! Agora o endpoint /produtos/ deve funcionar")
