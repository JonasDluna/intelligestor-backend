import asyncio
import httpx
from app.services.ml_service import MercadoLivreService
from app.config.settings import get_supabase_client
import os

os.environ['SUPABASE_URL'] = 'https://jmdcgtpwzstkcggfuavv.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptzWNndHB3enN0a2NnZ2Z1YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NTc3MTYsImV4cCI6MjA0NzAzMzcxNn0.YwHGQyMIQjgPmMhN1nFfePcUCkQq0YqTdp4d0Y84xn8'

async def test_real_ml_api():
    supabase = get_supabase_client()
    user_id = '54be00a8-c548-431e-849b-00c48d34b69e'
    
    # Buscar token ML do usuário
    result = supabase.table('tokens_ml').select('access_token').eq('user_id', user_id).maybe_single().execute()
    
    if not result.data:
        print('❌ Token ML não encontrado')
        return
        
    token = result.data['access_token']
    
    # Testar API diretamente
    async with httpx.AsyncClient() as client:
        # Buscar usuário ML
        print('🔍 Testando API do ML...')
        url = f'https://api.mercadolibre.com/users/me?access_token={token}'
        
        try:
            response = await client.get(url)
            if response.status_code == 200:
                user_data = response.json()
                nickname = user_data.get('nickname', 'N/A')
                user_id_ml = user_data.get('id', 'N/A')
                print(f'✅ Usuário ML: {nickname} (ID: {user_id_ml})')
            else:
                print(f'❌ Erro ao buscar usuário: {response.status_code} - {response.text}')
                return
                
        except Exception as e:
            print(f'❌ Erro na requisição: {e}')
            return
            
        # Buscar anúncios reais do ML
        print('\n🔍 Buscando anúncios reais do ML...')
        user_id_ml = user_data['id']
        url = f'https://api.mercadolibre.com/users/{user_id_ml}/items/search?access_token={token}'
        
        try:
            response = await client.get(url)
            if response.status_code == 200:
                items_data = response.json()
                items = items_data.get('results', [])
                print(f'✅ Anúncios encontrados no ML: {len(items)}')
                
                if items:
                    print('\n📋 Primeiros anúncios:')
                    for item_id in items[:5]:
                        # Buscar detalhes do item
                        detail_url = f'https://api.mercadolibre.com/items/{item_id}?access_token={token}'
                        detail_response = await client.get(detail_url)
                        if detail_response.status_code == 200:
                            item = detail_response.json()
                            title = item.get('title', 'N/A')[:50] + '...' if len(item.get('title', '')) > 50 else item.get('title', 'N/A')
                            status = item.get('status', 'N/A')
                            print(f'- {item_id}: {title} Status: {status}')
                        else:
                            print(f'- {item_id}: Erro ao buscar detalhes ({detail_response.status_code})')
                else:
                    print('📭 Nenhum anúncio encontrado')
                
            else:
                print(f'❌ Erro ao buscar anúncios: {response.status_code} - {response.text}')
                
        except Exception as e:
            print(f'❌ Erro na requisição de anúncios: {e}')

if __name__ == "__main__":
    asyncio.run(test_real_ml_api())