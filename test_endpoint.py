"""
Script de teste para endpoint /produtos/
"""
from dotenv import load_dotenv
load_dotenv()

from app.routers.produtos import listar_produtos
from app.services.produto_service import ProdutoService
from app.config.settings import get_supabase_client

try:
    print("1. Obtendo cliente Supabase...")
    supabase = get_supabase_client()
    print("✓ Cliente obtido")
    
    print("\n2. Criando service...")
    service = ProdutoService(supabase, "c98c6de3-2c35-4840-880f-70d7215fc3e5")
    print("✓ Service criado")
    
    print("\n3. Chamando listar_produtos()...")
    result = service.listar_produtos(skip=0, limit=100, status=None)
    print(f"✓ Resultado: {result}")
    print(f"✓ Tipo: {type(result)}")
    print(f"✓ Total de produtos: {len(result)}")
    
except Exception as e:
    print(f"\n❌ ERRO: {type(e).__name__}")
    print(f"Mensagem: {str(e)}")
    import traceback
    traceback.print_exc()
