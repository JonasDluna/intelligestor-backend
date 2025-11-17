import os
from supabase import create_client

# Conectar ao Supabase
supabase_url = "https://wsluajpeibcfeerbxqiz.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbHVhanBlaWJjZmVlcmJ4cWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1MDYzNCwiZXhwIjoyMDc4MzI2NjM0fQ.H2y4BbGz5ercnMZ4oLQpYwhFIZx3MDbsK8d5v1VXsxo"

supabase = create_client(supabase_url, supabase_key)

user_id = "99a8207e-48ea-4caa-9bd0-a62dac3f4bf3"

print("\n" + "="*70)
print("🔍 VERIFICANDO TOKEN DO MERCADO LIVRE")
print("="*70)

# Buscar token do usuário
response = supabase.table("tokens_ml").select("*").eq("user_id", user_id).execute()

if response.data and len(response.data) > 0:
    token = response.data[0]
    print("\n✅ TOKEN ENCONTRADO!")
    print("="*70)
    print(f"🆔 User ID: {token['user_id']}")
    print(f"👤 ML User ID: {token.get('ml_user_id', 'N/A')}")
    print(f"🔑 Access Token: {token['access_token'][:50]}...")
    print(f"🔄 Refresh Token: {token.get('refresh_token', 'N/A')[:50] if token.get('refresh_token') else 'N/A'}...")
    print(f"⏰ Expira em: {token.get('expires_at', 'N/A')}")
    print(f"📅 Criado em: {token.get('created_at', 'N/A')}")
    print("="*70)
    print("\n🎉 MERCADO LIVRE CONECTADO COM SUCESSO!")
    print("✨ Agora você pode sincronizar produtos e estoque!")
    print("="*70 + "\n")
else:
    print("\n❌ NENHUM TOKEN ENCONTRADO")
    print("="*70)
    print("⚠️  A autorização pode não ter sido completada.")
    print("💡 Tente novamente o processo de autorização.")
    print("="*70 + "\n")
