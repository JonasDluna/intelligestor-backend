"""
Service - Mercado Livre
Integração com API do ML: anúncios, preços, tokens
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
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
        
        # Token expirado? Comparar com datetime timezone-aware
        now_utc = datetime.now(timezone.utc)
        if expires_at <= now_utc:
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
        
        # Busca anúncios do ML (TODOS os status, não apenas active)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.ML_API_BASE}/users/{ml_user_id}/items/search",
                    headers={"Authorization": f"Bearer {token}"}
                    # Removido filtro status=active para buscar TODOS os anúncios
                )
                
                if response.status_code == 401:
                    raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                
                if response.status_code != 200:
                    raise ValueError(f"Erro ao buscar anúncios do ML: Status {response.status_code}")
                
                items_ids = response.json()["results"]
                print(f"[DEBUG] Encontrados {len(items_ids)} anúncios no ML para sincronizar")
                
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
                
        # NOVO: Remove anúncios do banco que não existem mais no ML
        if items_ids:
            print(f"[DEBUG] Removendo anúncios obsoletos do banco...")
            # Deleta anúncios que não estão na lista atual do ML
            self.db.table("anuncios_ml")\
                .delete()\
                .eq("user_id", self.user_id)\
                .not_.in_("ml_id", items_ids)\
                .execute()
            print(f"[DEBUG] Limpeza de anúncios obsoletos concluída")
        
        print(f"[DEBUG] Sincronização concluída: {len(anuncios_atualizados)} anúncios atualizados")
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
            "category_id": data["category_id"],
            "listing_type_id": data["listing_type_id"],
            "condition": data.get("condition"),
            "buying_mode": data.get("buying_mode"),
            "pictures": [p["url"].replace("http://", "https://") for p in data.get("pictures", [])] if data.get("pictures") else [],
            "sync_status": "synced",
            "last_sync_at": "now()"
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
        print(f"[DEBUG] listar_anuncios_locais para user_id={self.user_id}, limit={limit}")
        
        result = self.db.table("anuncios_ml")\
            .select("*")\
            .eq("user_id", self.user_id)\
            .order("updated_at", desc=True)\
            .limit(limit)\
            .execute()
        
        print(f"[DEBUG] Encontrados {len(result.data) if result.data else 0} anúncios")
        if result.data and len(result.data) > 0:
            print(f"[DEBUG] Primeiro anúncio: ML_ID={result.data[0].get('ml_id')}, user_id={result.data[0].get('user_id')}")
        
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
        NOVA IMPLEMENTAÇÃO usando API oficial price_to_win
        """
        print(f"[DEBUG] buscar_buybox_data iniciado para item_id={item_id}")
        
        try:
            # Usa o novo método baseado na API oficial
            return await self.buscar_price_to_win(item_id)
            
        except Exception as e:
            print(f"[ERROR] Exceção em buscar_buybox_data: {type(e).__name__}: {str(e)}")
            
            # Fallback para método antigo em caso de erro
            return {
                "item_id": item_id,
                "error": f"Erro ao buscar dados de competição: {str(e)}",
                "has_catalog": False,
                "fallback_used": True
            }
    
    async def buscar_competidores_produto(self, catalog_product_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca todos os competidores de uma página de produto específica
        Endpoint: GET /products/{product_id}/items
        
        Retorna lista de todas as publicações que competem na mesma página de produto
        """
        print(f"[DEBUG] buscar_competidores_produto iniciado para catalog_product_id={catalog_product_id}")
        
        try:
            token = await self._carregar_token()
            if not token:
                raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Busca informações do produto
                product_response = await client.get(
                    f"{self.ML_API_BASE}/products/{catalog_product_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if product_response.status_code != 200:
                    return {
                        "catalog_product_id": catalog_product_id,
                        "error": "Produto não encontrado",
                        "competitors": []
                    }
                
                product_data = product_response.json()
                
                # Busca todos os items que competem neste produto
                items_response = await client.get(
                    f"{self.ML_API_BASE}/products/{catalog_product_id}/items",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if items_response.status_code != 200:
                    return {
                        "catalog_product_id": catalog_product_id,
                        "product_name": product_data.get("name"),
                        "error": "Não foi possível buscar competidores",
                        "competitors": []
                    }
                
                items_data = items_response.json()
                competitors = []
                
                # Processa cada competidor
                for item in items_data.get("results", []):
                    competitor = {
                        "item_id": item.get("item_id"),
                        "seller_id": item.get("seller_id"),
                        "price": item.get("price"),
                        "currency_id": item.get("currency_id"),
                        "available_quantity": item.get("available_quantity"),
                        "condition": item.get("condition"),
                        "listing_type_id": item.get("listing_type_id"),
                        "warranty": item.get("warranty"),
                        "official_store_id": item.get("official_store_id"),
                        "original_price": item.get("original_price"),
                        
                        # Informações de envio
                        "shipping": item.get("shipping", {}),
                        "free_shipping": item.get("shipping", {}).get("free_shipping", False),
                        "shipping_mode": item.get("shipping", {}).get("mode"),
                        
                        # Tags e tier
                        "tags": item.get("tags", []),
                        "tier": item.get("tier"),
                        
                        # Reputação do vendedor
                        "seller_reputation": item.get("seller", {}).get("reputation_level_id") if item.get("seller") else None
                    }
                    
                    competitors.append(competitor)
                
                # Ordena por preço (menor primeiro)
                competitors.sort(key=lambda x: x.get("price", float('inf')))
                
                # Identifica o ganhador (Buy Box)
                buy_box_winner = product_data.get("buy_box_winner", {})
                winner_item_id = buy_box_winner.get("item_id")
                
                # Marca o ganhador e calcula posições
                for i, competitor in enumerate(competitors):
                    competitor["position"] = i + 1
                    competitor["is_buy_box_winner"] = competitor["item_id"] == winner_item_id
                    
                    # Calcula diferença percentual com o primeiro colocado
                    if competitors and competitors[0].get("price"):
                        lowest_price = competitors[0]["price"]
                        competitor_price = competitor.get("price")
                        if competitor_price and lowest_price > 0:
                            competitor["price_difference_percent"] = round(
                                ((competitor_price - lowest_price) / lowest_price) * 100, 2
                            )
                        else:
                            competitor["price_difference_percent"] = 0
                    else:
                        competitor["price_difference_percent"] = 0
                
                return {
                    "catalog_product_id": catalog_product_id,
                    "product_name": product_data.get("name"),
                    "product_permalink": product_data.get("permalink"),
                    "total_competitors": len(competitors),
                    "buy_box_winner_item_id": winner_item_id,
                    "price_range": {
                        "min_price": competitors[0].get("price") if competitors else None,
                        "max_price": competitors[-1].get("price") if competitors else None,
                        "currency_id": competitors[0].get("currency_id") if competitors else None
                    },
                    "competitors": competitors,
                    "updated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            print(f"[ERROR] Exceção em buscar_competidores_produto: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
    
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
    
    async def buscar_price_to_win(self, item_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca dados detalhados de competição usando API oficial price_to_win
        Endpoint: GET /items/{item_id}/price_to_win?version=v2
        
        Retorna informações completas sobre:
        - Status da competição (winning/competing/sharing_first_place/listed)
        - Preço necessário para ganhar
        - Boosts disponíveis (fulfillment, free_shipping, etc)
        - Dados do vendedor ganhador
        - Motivos para não estar competindo
        """
        print(f"[DEBUG] buscar_price_to_win iniciado para item_id={item_id}")
        
        try:
            token = await self._carregar_token()
            if not token:
                print(f"[ERROR] Token não encontrado para user_id={self.user_id}")
                raise ValueError("Token ML não encontrado ou expirado. Conecte-se ao Mercado Livre primeiro.")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Busca dados de price_to_win
                response = await client.get(
                    f"{self.ML_API_BASE}/items/{item_id}/price_to_win",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"version": "v2"}
                )
                
                if response.status_code == 401:
                    raise ValueError("Token ML expirado. Reconecte-se ao Mercado Livre.")
                
                if response.status_code == 404:
                    return {
                        "item_id": item_id,
                        "error": "Item não encontrado ou não está no catálogo",
                        "has_catalog": False
                    }
                
                if response.status_code != 200:
                    print(f"[ERROR] Erro HTTP {response.status_code} ao buscar price_to_win: {response.text}")
                    return {
                        "item_id": item_id,
                        "error": f"Erro HTTP {response.status_code}",
                        "has_catalog": False
                    }
                
                data = response.json()
                
                # Formatar dados de acordo com a estrutura da documentação
                result = {
                    "item_id": data.get("item_id"),
                    "current_price": data.get("current_price"),
                    "currency_id": data.get("currency_id"),
                    "price_to_win": data.get("price_to_win"),
                    "status": data.get("status"),  # winning/competing/sharing_first_place/listed
                    "consistent": data.get("consistent"),
                    "visit_share": data.get("visit_share"),  # maximum/medium/minimum
                    "competitors_sharing_first_place": data.get("competitors_sharing_first_place"),
                    "catalog_product_id": data.get("catalog_product_id"),
                    "has_catalog": True,
                    
                    # Análise de boosts
                    "boosts": [],
                    "boosts_analysis": {
                        "boosted": [],
                        "opportunities": [],
                        "not_boosted": [],
                        "not_apply": []
                    },
                    
                    # Dados do ganhador atual
                    "winner": data.get("winner"),
                    
                    # Motivos para não competir (quando aplicável)
                    "reason": data.get("reason", []),
                    
                    # Cálculos adicionais
                    "price_difference": None,
                    "price_difference_percent": None,
                    "is_winning": data.get("status") == "winning",
                    "can_compete": data.get("status") not in ["listed"],
                    
                    "updated_at": datetime.utcnow().isoformat()
                }
                
                # Processa boosts
                boosts = data.get("boosts", [])
                result["boosts"] = boosts
                
                for boost in boosts:
                    boost_id = boost.get("id")
                    boost_status = boost.get("status")
                    boost_desc = boost.get("description")
                    
                    boost_info = {
                        "id": boost_id,
                        "status": boost_status,
                        "description": boost_desc
                    }
                    
                    # Categoriza boosts por status
                    if boost_status == "boosted":
                        result["boosts_analysis"]["boosted"].append(boost_info)
                    elif boost_status == "opportunity":
                        result["boosts_analysis"]["opportunities"].append(boost_info)
                    elif boost_status == "not_boosted":
                        result["boosts_analysis"]["not_boosted"].append(boost_info)
                    elif boost_status == "not_apply":
                        result["boosts_analysis"]["not_apply"].append(boost_info)
                
                # Calcula diferenças de preço
                current_price = data.get("current_price")
                price_to_win = data.get("price_to_win")
                
                if current_price and price_to_win and price_to_win > 0:
                    result["price_difference"] = current_price - price_to_win
                    result["price_difference_percent"] = round(
                        ((current_price - price_to_win) / price_to_win) * 100, 2
                    )
                
                # Se tem ganhador, calcula diferença com ele
                winner = data.get("winner")
                if winner and current_price:
                    winner_price = winner.get("price")
                    if winner_price and winner_price > 0:
                        result["winner_price_difference"] = current_price - winner_price
                        result["winner_price_difference_percent"] = round(
                            ((current_price - winner_price) / winner_price) * 100, 2
                        )
                
                print(f"[DEBUG] price_to_win processado com sucesso: status={result.get('status')}")
                return result
                
        except Exception as e:
            print(f"[ERROR] Exceção em buscar_price_to_win: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
