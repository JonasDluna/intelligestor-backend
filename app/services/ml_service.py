"""
Service - Mercado Livre
Integração com API do ML: anúncios, preços, tokens
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import httpx
from supabase import Client
from app.models.schemas import (
    AnuncioMLCreate,
    AnuncioMLResponse,
    StatusAnuncio
)


class MercadoLivreService:
    ML_API_BASE = "https://api.mercadolibre.com"
    
    def __init__(self, supabase_client: Client, user_id: str):
        self.db = supabase_client
        self.user_id = user_id
        self.access_token = None
    
    async def _carregar_token(self) -> Optional[str]:
        """Carrega access token válido do banco"""
        result = self.db.table("tokens_ml")\
            .select("access_token, expires_at")\
            .eq("user_id", self.user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not result.data:
            return None
        
        token_data = result.data[0]
        expires_at = datetime.fromisoformat(token_data["expires_at"])
        
        # Token expirado?
        if expires_at <= datetime.utcnow():
            return None
        
        self.access_token = token_data["access_token"]
        return self.access_token
    
    async def sincronizar_anuncios(self) -> List[AnuncioMLResponse]:
        """
        Sincroniza anúncios do ML com banco local
        Busca todos os anúncios ativos do usuário
        """
        print(f"[DEBUG] sincronizar_anuncios iniciado para user_id={self.user_id}")
        
        try:
            token = await self._carregar_token()
            if not token:
                print(f"[ERROR] Token não encontrado para user_id={self.user_id}")
                raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
            
            print(f"[DEBUG] Token carregado com sucesso")
            
            # Busca ml_user_id
            ml_user = self.db.table("tokens_ml")\
                .select("ml_user_id")\
                .eq("user_id", self.user_id)\
                .limit(1)\
                .execute()
        except Exception as e:
            print(f"[ERROR] Exceção em sincronizar_anuncios: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
        
        if not ml_user.data:
            raise ValueError("ML User ID não encontrado. Conecte-se ao Mercado Livre primeiro.")
        
        ml_user_id = ml_user.data[0]["ml_user_id"]
        
        # Busca anúncios do ML
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.ML_API_BASE}/users/{ml_user_id}/items/search",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"status": "active"}
                )
                
                if response.status_code == 401:
                    raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                
                if response.status_code != 200:
                    raise ValueError(f"Erro ao buscar anúncios do ML: Status {response.status_code}")
                
                items_ids = response.json()["results"]
        except httpx.TimeoutException:
            raise ValueError("Timeout ao buscar anúncios do Mercado Livre. Tente novamente.")
        
        # Busca detalhes de cada anúncio
        anuncios_atualizados = []
        for ml_id in items_ids:
            try:
                anuncio = await self._buscar_detalhes_anuncio(ml_id)
                if anuncio:
                    anuncios_atualizados.append(anuncio)
            except Exception as e:
                print(f"Erro ao buscar anúncio {ml_id}: {str(e)}")
                continue
        
        return anuncios_atualizados
    
    async def _buscar_detalhes_anuncio(self, ml_id: str) -> Optional[AnuncioMLResponse]:
        """Busca detalhes de um anúncio e salva no banco"""
        token = await self._carregar_token()
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.ML_API_BASE}/items/{ml_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 401:
                    raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                
                if response.status_code != 200:
                    print(f"Erro ao buscar item {ml_id}: Status {response.status_code}")
                    return None
                
                data = response.json()
        except httpx.TimeoutException:
            print(f"Timeout ao buscar item {ml_id}")
            return None
        except Exception as e:
            print(f"Erro ao buscar item {ml_id}: {str(e)}")
            return None
        
        # Salva/atualiza no banco
        anuncio_data = {
            "ml_id": ml_id,
            "user_id": self.user_id,
            "title": data["title"],
            "price": str(data["price"]),
            "available_quantity": data["available_quantity"],
            "sold_quantity": data["sold_quantity"],
            "status": self._mapear_status(data["status"]),
            "permalink": data["permalink"],
            "thumbnail": data.get("thumbnail"),
            "category_id": data["category_id"],
            "listing_type_id": data["listing_type_id"],
            "attributes": data.get("attributes", []),
            "pictures": [p["url"] for p in data.get("pictures", [])]
        }
        
        # Upsert (insert ou update)
        result = self.db.table("anuncios_ml")\
            .upsert(anuncio_data, on_conflict="ml_id")\
            .execute()
        
        return AnuncioMLResponse(**result.data[0])
    
    def _mapear_status(self, ml_status: str) -> str:
        """Mapeia status do ML para nosso enum"""
        mapping = {
            "active": StatusAnuncio.ACTIVE.value,
            "paused": StatusAnuncio.PAUSED.value,
            "closed": StatusAnuncio.CLOSED.value,
            "under_review": StatusAnuncio.UNDER_REVIEW.value
        }
        return mapping.get(ml_status, StatusAnuncio.CLOSED.value)
    
    async def atualizar_preco(self, ml_id: str, novo_preco: Decimal) -> bool:
        """Atualiza preço de um anúncio no ML"""
        token = await self._carregar_token()
        if not token:
            return False
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{self.ML_API_BASE}/items/{ml_id}",
                headers={"Authorization": f"Bearer {token}"},
                json={"price": float(novo_preco)}
            )
            
            if response.status_code == 200:
                # Atualiza no banco também
                self.db.table("anuncios_ml")\
                    .update({"price": str(novo_preco)})\
                    .eq("ml_id", ml_id)\
                    .eq("user_id", self.user_id)\
                    .execute()
                return True
        
        return False
    
    async def pausar_anuncio(self, ml_id: str) -> bool:
        """Pausa anúncio no ML"""
        token = await self._carregar_token()
        if not token:
            return False
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{self.ML_API_BASE}/items/{ml_id}",
                headers={"Authorization": f"Bearer {token}"},
                json={"status": "paused"}
            )
            
            if response.status_code == 200:
                self.db.table("anuncios_ml")\
                    .update({"status": StatusAnuncio.PAUSED.value})\
                    .eq("ml_id", ml_id)\
                    .eq("user_id", self.user_id)\
                    .execute()
                return True
        
        return False
    
    async def reativar_anuncio(self, ml_id: str) -> bool:
        """Reativa anúncio pausado"""
        token = await self._carregar_token()
        if not token:
            return False
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{self.ML_API_BASE}/items/{ml_id}",
                headers={"Authorization": f"Bearer {token}"},
                json={"status": "active"}
            )
            
            if response.status_code == 200:
                self.db.table("anuncios_ml")\
                    .update({"status": StatusAnuncio.ACTIVE.value})\
                    .eq("ml_id", ml_id)\
                    .eq("user_id", self.user_id)\
                    .execute()
                return True
        
        return False
    
    async def buscar_anuncio_local(self, ml_id: str) -> Optional[AnuncioMLResponse]:
        """Busca anúncio no banco local"""
        result = self.db.table("anuncios_ml")\
            .select("*")\
            .eq("ml_id", ml_id)\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if result.data:
            return AnuncioMLResponse(**result.data)
        return None
    
    async def listar_anuncios_locais(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Lista anúncios salvos no banco local"""
        result = self.db.table("anuncios_ml")\
            .select("*")\
            .eq("user_id", self.user_id)\
            .order("updated_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data if result.data else []
    
    async def buscar_catalog_items(self) -> List[Dict[str, Any]]:
        """
        Busca itens do catálogo do ML que o usuário tem anúncios
        Retorna lista de itens para monitorar BuyBox
        """
        print(f"[DEBUG] buscar_catalog_items iniciado para user_id={self.user_id}")
        
        try:
            token = await self._carregar_token()
            if not token:
                print(f"[ERROR] Token não encontrado para user_id={self.user_id}")
                raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
            
            print(f"[DEBUG] Token carregado, buscando anúncios locais")
            
            # Busca anúncios locais que têm catalog_product_id
            anuncios = await self.listar_anuncios_locais()
            
            if not anuncios:
                return []  # Sem anúncios, retorna lista vazia
            
            items_catalog = []
            async with httpx.AsyncClient(timeout=30.0) as client:
                for anuncio in anuncios:
                    ml_id = anuncio.get("ml_id")
                    if not ml_id:
                        continue
                    
                    try:
                        # Busca detalhes do item
                        response = await client.get(
                            f"{self.ML_API_BASE}/items/{ml_id}",
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            catalog_product_id = data.get("catalog_product_id")
                            
                            if catalog_product_id:
                                items_catalog.append({
                                    "ml_id": ml_id,
                                    "title": data["title"],
                                    "price": data["price"],
                                    "catalog_product_id": catalog_product_id,
                                    "thumbnail": data.get("thumbnail"),
                                    "permalink": data["permalink"],
                                    "attributes": data.get("attributes", [])
                                })
                        elif response.status_code == 401:
                            raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                    except httpx.TimeoutException:
                        print(f"Timeout ao buscar item {ml_id}")
                        continue
                    except Exception as e:
                        print(f"Erro ao buscar item {ml_id}: {str(e)}")
                        continue
            
            return items_catalog
        except Exception as e:
            print(f"[ERROR] Exceção em buscar_catalog_items: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
    
    async def buscar_buybox_data(self, item_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca dados de BuyBox/concorrência de um item do catálogo
        API: https://api.mercadolibre.com/products/{catalog_product_id}/competition
        """
        token = await self._carregar_token()
        if not token:
            raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
        
        # Primeiro busca o catalog_product_id do item
        async with httpx.AsyncClient(timeout=30.0) as client:
            item_response = await client.get(
                f"{self.ML_API_BASE}/items/{item_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if item_response.status_code != 200:
                return None
            
            item_data = item_response.json()
            catalog_product_id = item_data.get("catalog_product_id")
            
            if not catalog_product_id:
                return {
                    "item_id": item_id,
                    "has_catalog": False,
                    "message": "Item não participa do catálogo"
                }
            
            # Busca dados de concorrência
            competition_response = await client.get(
                f"{self.ML_API_BASE}/products/{catalog_product_id}/competition",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if competition_response.status_code != 200:
                return {
                    "item_id": item_id,
                    "has_catalog": True,
                    "catalog_product_id": catalog_product_id,
                    "competition_data": None
                }
            
            competition = competition_response.json()
            
            # Busca qual é o campeão (menor preço)
            offers = competition.get("offers", [])
            if not offers:
                return {
                    "item_id": item_id,
                    "has_catalog": True,
                    "catalog_product_id": catalog_product_id,
                    "my_price": item_data["price"],
                    "champion_price": None,
                    "is_winner": False,
                    "offers_count": 0
                }
            
            # Ordena por preço
            sorted_offers = sorted(offers, key=lambda x: x.get("price", float('inf')))
            champion = sorted_offers[0]
            champion_price = champion.get("price")
            my_price = item_data["price"]
            
            # Verifica se este item é o campeão
            is_winner = item_id == champion.get("item_id")
            
            # Calcula diferença percentual
            if champion_price and champion_price > 0:
                diff_percent = ((my_price - champion_price) / champion_price) * 100
            else:
                diff_percent = 0
            
            return {
                "item_id": item_id,
                "ml_id": item_id,
                "title": item_data["title"],
                "has_catalog": True,
                "catalog_product_id": catalog_product_id,
                "my_price": my_price,
                "champion_price": champion_price,
                "difference_percent": round(diff_percent, 2),
                "is_winner": is_winner,
                "offers_count": len(offers),
                "champion_seller_id": champion.get("seller_id"),
                "updated_at": datetime.utcnow().isoformat()
            }
    
    async def buscar_perguntas(self, status: str = "unanswered") -> List[Dict[str, Any]]:
        """
        Busca perguntas dos anúncios do usuário
        status: 'unanswered', 'answered', 'all'
        """
        print(f"[DEBUG] buscar_perguntas iniciado para user_id={self.user_id}, status={status}")
        
        try:
            token = await self._carregar_token()
            if not token:
                print(f"[ERROR] Token não encontrado para user_id={self.user_id}")
                raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
            
            print(f"[DEBUG] Token carregado, buscando ml_user_id")
            
            # Busca ml_user_id
            ml_user = self.db.table("tokens_ml")\
                .select("ml_user_id")\
                .eq("user_id", self.user_id)\
                .limit(1)\
                .execute()
            
            if not ml_user.data:
                raise ValueError("ML User ID não encontrado. Conecte-se ao Mercado Livre primeiro.")
            
            ml_user_id = ml_user.data[0]["ml_user_id"]
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Busca perguntas
                params = {"status": status} if status != "all" else {}
                
                response = await client.get(
                    f"{self.ML_API_BASE}/questions/search",
                    headers={"Authorization": f"Bearer {token}"},
                    params={**params, "seller_id": ml_user_id}
                )
                
                if response.status_code == 401:
                    raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                
                if response.status_code != 200:
                    return []
                
                data = response.json()
                questions = data.get("questions", [])
                
                # Formata dados
                perguntas_formatadas = []
                for q in questions:
                    perguntas_formatadas.append({
                        "id": q["id"],
                        "text": q["text"],
                        "status": q["status"],
                        "date_created": q["date_created"],
                        "item_id": q["item_id"],
                        "answer": q.get("answer"),
                        "from_user_id": q.get("from", {}).get("id")
                    })
                
                return perguntas_formatadas
        except Exception as e:
            print(f"[ERROR] Exceção em buscar_perguntas: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
    
    async def responder_pergunta(self, question_id: int, resposta: str) -> bool:
        """Responde uma pergunta no ML"""
        token = await self._carregar_token()
        if not token:
            return False
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.ML_API_BASE}/answers",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "question_id": question_id,
                    "text": resposta
                }
            )
            
            return response.status_code == 200
    
    async def buscar_vendas(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Busca vendas/pedidos do usuário
        """
        print(f"[DEBUG] buscar_vendas iniciado para user_id={self.user_id}, limit={limit}")
        
        try:
            token = await self._carregar_token()
            if not token:
                print(f"[ERROR] Token não encontrado para user_id={self.user_id}")
                raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
            
            print(f"[DEBUG] Token carregado, buscando ml_user_id")
            
            # Busca ml_user_id
            ml_user = self.db.table("tokens_ml")\
                .select("ml_user_id")\
                .eq("user_id", self.user_id)\
                .limit(1)\
                .execute()
            
            if not ml_user.data:
                raise ValueError("ML User ID não encontrado. Conecte-se ao Mercado Livre primeiro.")
            
            ml_user_id = ml_user.data[0]["ml_user_id"]
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.ML_API_BASE}/orders/search",
                    headers={"Authorization": f"Bearer {token}"},
                    params={
                        "seller": ml_user_id,
                        "limit": limit,
                        "sort": "date_desc"
                    }
                )
                
                if response.status_code == 401:
                    raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                
                if response.status_code != 200:
                    return []
                
                data = response.json()
                orders = data.get("results", [])
                
                # Formata vendas
                vendas_formatadas = []
                for order in orders:
                    vendas_formatadas.append({
                        "id": order["id"],
                        "date_created": order["date_created"],
                        "status": order["status"],
                        "total_amount": order["total_amount"],
                        "paid_amount": order.get("paid_amount", 0),
                        "currency_id": order["currency_id"],
                        "buyer_id": order.get("buyer", {}).get("id"),
                        "items": order.get("order_items", [])
                    })
                
                return vendas_formatadas
        except Exception as e:
            print(f"[ERROR] Exceção em buscar_vendas: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
