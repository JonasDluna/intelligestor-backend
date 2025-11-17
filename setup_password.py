"""
Script para adicionar campo password_hash na tabela usuarios
E atualizar o usuário existente com senha hash
"""
import os
from dotenv import load_dotenv
from supabase import create_client
import bcrypt

# Carregar variáveis de ambiente
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERRO: Defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*60)
print("🔧 ADICIONANDO password_hash E ATUALIZANDO USUÁRIO")
print("="*60 + "\n")

# Passo 1: Adicionar coluna password_hash
print("1️⃣ Adicionando coluna password_hash...")
try:
    # Não podemos executar ALTER TABLE diretamente via Python client
    # Mas podemos verificar se o campo existe tentando selecionar
    result = supabase.table("usuarios").select("password_hash").limit(1).execute()
    print("   ✅ Coluna password_hash já existe!")
except Exception as e:
    print(f"   ⚠️  Coluna password_hash não existe. Execute no SQL Editor:")
    print(f"   ALTER TABLE usuarios ADD COLUMN password_hash TEXT;")
    print(f"\n   Erro: {e}\n")

# Passo 2: Buscar usuário existente
print("\n2️⃣ Buscando usuário jonastortorette@hotmail.com...")
try:
    result = supabase.table("usuarios").select("*").eq("email", "jonastortorette@hotmail.com").execute()
    
    if result.data and len(result.data) > 0:
        user = result.data[0]
        print(f"   ✅ Usuário encontrado: {user['email']}")
        print(f"   ID: {user['id']}")
        
        # Passo 3: Verificar se já tem senha
        if user.get("password_hash"):
            print(f"   ⚠️  Usuário já tem password_hash configurado")
        else:
            # Passo 4: Adicionar senha padrão
            print("\n3️⃣ Adicionando senha padrão...")
            senha_padrao = "senha123"  # ALTERE ISSO!
            senha_hash = bcrypt.hashpw(senha_padrao.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            update_result = supabase.table("usuarios").update({
                "password_hash": senha_hash
            }).eq("id", user["id"]).execute()
            
            if update_result.data:
                print(f"   ✅ Senha configurada com sucesso!")
                print(f"\n   📋 CREDENCIAIS DE LOGIN:")
                print(f"   Email: {user['email']}")
                print(f"   Senha: {senha_padrao}")
                print(f"\n   ⚠️  IMPORTANTE: Altere a senha após primeiro login!")
            else:
                print(f"   ❌ Erro ao atualizar senha")
    else:
        print("   ❌ Usuário não encontrado")
        print("   💡 Registre-se primeiro no sistema")
        
except Exception as e:
    print(f"   ❌ Erro: {e}")

print("\n" + "="*60 + "\n")
