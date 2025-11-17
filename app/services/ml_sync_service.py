"""
Service - Sincronização com Mercado Livre
Sincroniza estoque entre sistema local e ML
"""
import httpx
from typing import Dict, List, Any
from supabase import Client
from app.config.settings import settings, get_supabase_client


class MLSyncService:
    def __init__(self, supabase_client: Client, user_id: str):
        self.db = supabase_client
        self.user_id = user_id
    
    async def get_ml_token(self) -> str:
        """Busca token do ML do usuário"""
        result = self.db.table("tokens_ml")\
            .select("access_token")\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if not result.data:
            raise ValueError("Token ML não encontrado. Faça login no Mercado Livre.")
        
        return result.data["access_token"]
    
    async def sincronizar_estoque_produto(
        self, 
        produto_id: int, 
        nova_quantidade: int
    ) -> Dict[str, Any]:
        """
        Sincroniza estoque de produto específico com ML
        Atualiza todos os anúncios vinculados a este produto
        """
        # Busca anúncios vinculados ao produto
        anuncios = self.db.table("anuncios_ml")\
            .select("ml_id, available_quantity")\
            .eq("produto_id", produto_id)\
            .eq("user_id", self.user_id)\
            .eq("status", "active")\
            .execute()
        
        if not anuncios.data:
            return {"message": "Nenhum anúncio ativo encontrado para este produto"}
        
        token = await self.get_ml_token()
        resultados = []
        
        for anuncio in anuncios.data:
            ml_id = anuncio["ml_id"]
            
            try:
                # Atualiza quantidade no ML
                async with httpx.AsyncClient() as client:
                    response = await client.put(
                        f"{settings.ML_API_URL}/items/{ml_id}",
                        headers={"Authorization": f"Bearer {token}"},
                        json={"available_quantity": nova_quantidade}
                    )
                    response.raise_for_status()
                
                # Atualiza no banco local
                self.db.table("anuncios_ml")\
                    .update({"available_quantity": nova_quantidade})\
                    .eq("ml_id", ml_id)\
                    .execute()
                
                resultados.append({
                    "ml_id": ml_id,
                    "sucesso": True,
                    "quantidade_anterior": anuncio["available_quantity"],
                    "quantidade_nova": nova_quantidade
                })
                
            except Exception as e:
                resultados.append({
                    "ml_id": ml_id,
                    "sucesso": False,
                    "erro": str(e)
                })
        
        return {
            "produto_id": produto_id,
            "total_anuncios": len(anuncios.data),
            "sincronizados": sum(1 for r in resultados if r["sucesso"]),
            "falhas": sum(1 for r in resultados if not r["sucesso"]),
            "detalhes": resultados
        }
    
    async def sincronizar_todos_estoques(self) -> Dict[str, Any]:
        """
        Sincroniza estoque de todos os produtos com anúncios ativos
        """
        # Busca todos os produtos com anúncios
        produtos = self.db.table("produtos")\
            .select("id, estoque(estoque_disponivel)")\
            .eq("user_id", self.user_id)\
            .execute()
        
        if not produtos.data:
            return {"message": "Nenhum produto encontrado"}
        
        resultados = []
        
        for produto in produtos.data:
            produto_id = produto["id"]
            estoque_data = produto.get("estoque", [])
            
            if estoque_data and len(estoque_data) > 0:
                estoque_disponivel = estoque_data[0].get("estoque_disponivel", 0)
                
                resultado = await self.sincronizar_estoque_produto(
                    produto_id, 
                    estoque_disponivel
                )
                resultados.append(resultado)
        
        return {
            "total_produtos_processados": len(resultados),
            "produtos": resultados
        }
    
    async def buscar_estoque_ml(self, ml_id: str) -> int:
        """
        Busca quantidade disponível de um anúncio diretamente do ML
        """
        token = await self.get_ml_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.ML_API_URL}/items/{ml_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            data = response.json()
        
        return data.get("available_quantity", 0)
    
    async def importar_estoque_ml(self) -> Dict[str, Any]:
        """
        Importa quantidades do ML para o sistema local
        Útil para sincronizar após vendas externas
        """
        anuncios = self.db.table("anuncios_ml")\
            .select("ml_id, produto_id, available_quantity")\
            .eq("user_id", self.user_id)\
            .eq("status", "active")\
            .execute()
        
        if not anuncios.data:
            return {"message": "Nenhum anúncio ativo encontrado"}
        
        resultados = []
        
        for anuncio in anuncios.data:
            try:
                quantidade_ml = await self.buscar_estoque_ml(anuncio["ml_id"])
                
                # Atualiza estoque local
                self.db.table("estoque")\
                    .update({"estoque_disponivel": quantidade_ml})\
                    .eq("produto_id", anuncio["produto_id"])\
                    .execute()
                
                resultados.append({
                    "ml_id": anuncio["ml_id"],
                    "sucesso": True,
                    "quantidade_importada": quantidade_ml
                })
                
            except Exception as e:
                resultados.append({
                    "ml_id": anuncio["ml_id"],
                    "sucesso": False,
                    "erro": str(e)
                })
        
        return {
            "total_anuncios": len(anuncios.data),
            "importados": sum(1 for r in resultados if r["sucesso"]),
            "falhas": sum(1 for r in resultados if not r["sucesso"]),
            "detalhes": resultados
        }
