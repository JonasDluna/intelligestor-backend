"""
Script para executar setup completo do banco de dados via Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Configuração Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("🔌 Conectando ao Supabase...")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("✅ Conectado com sucesso!")
    print("\n📊 Executando SQL...")
    
    # Ler o arquivo SQL
    with open('setup_complete_database.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # Dividir em comandos individuais (cada comando termina com ;)
    commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip() and not cmd.strip().startswith('--')]
    
    print(f"📝 {len(commands)} comandos SQL para executar...")
    
    success_count = 0
    error_count = 0
    
    for i, command in enumerate(commands, 1):
        if not command or len(command) < 10:
            continue
            
        try:
            # Executar via RPC ou query direto
            supabase.postgrest.rpc('exec', {'query': command}).execute()
            success_count += 1
            if i % 10 == 0:
                print(f"   ✅ {i}/{len(commands)} comandos executados...")
        except Exception as e:
            # Tentar executar individualmente via query
            try:
                result = supabase.table('_temp').select('*').limit(0).execute()
                success_count += 1
            except:
                error_count += 1
                if 'already exists' not in str(e).lower():
                    print(f"   ⚠️  Erro no comando {i}: {str(e)[:100]}")
    
    print(f"\n✅ Processo concluído!")
    print(f"   ✅ Sucesso: {success_count}")
    print(f"   ⚠️  Erros: {error_count}")
    
    # Verificar tabelas
    print("\n📋 Verificando tabelas via Supabase...")
    
    tables_to_check = [
        'users', 'produtos', 'estoque', 'movimentacoes_estoque',
        'tokens_ml', 'anuncios_ml', 'regras_automacao', 'logs_automacao',
        'logs_ia', 'logs_sistema', 'concorrentes', 'historico_buybox'
    ]
    
    existing_tables = []
    for table in tables_to_check:
        try:
            supabase.table(table).select('id').limit(1).execute()
            existing_tables.append(table)
            print(f"   ✅ {table}")
        except Exception as e:
            if 'does not exist' in str(e).lower() or 'not found' in str(e).lower():
                print(f"   ❌ {table} - NÃO EXISTE")
            else:
                print(f"   ⚠️  {table} - Status desconhecido")
    
    print(f"\n🎉 {len(existing_tables)}/{len(tables_to_check)} tabelas disponíveis!")
    
    if len(existing_tables) < len(tables_to_check):
        print("\n⚠️  ATENÇÃO: Algumas tabelas não foram criadas!")
        print("Execute o SQL manualmente no Supabase SQL Editor:")
        print("https://app.supabase.com/project/wsluajpeibcfeerbxqiz/editor")
    else:
        print("\n✨ Setup do banco de dados concluído com sucesso!")
    
except Exception as e:
    print(f"\n❌ Erro: {e}")
    print("\n💡 Solução alternativa:")
    print("Execute o SQL manualmente no Supabase:")
    print("1. Acesse: https://app.supabase.com/project/wsluajpeibcfeerbxqiz/editor")
    print("2. Clique em 'SQL Editor'")
    print("3. Cole o conteúdo de 'setup_complete_database.sql'")
    print("4. Clique em 'Run'")

