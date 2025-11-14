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
        token = await self._carregar_token()
        if not token:
            raise ValueError("Token ML não encontrado ou expirado")
        
        # Busca ml_user_id
        ml_user = self.db.table("tokens_ml")\
            .select("ml_user_id")\
            .eq("user_id", self.user_id)\
            .limit(1)\
            .execute()
        
        if not ml_user.data:
            raise ValueError("ML User ID não encontrado")
        
        ml_user_id = ml_user.data[0]["ml_user_id"]
        
        # Busca anúncios do ML
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.ML_API_BASE}/users/{ml_user_id}/items/search",
                headers={"Authorization": f"Bearer {token}"},
                params={"status": "active"}
            )
            response.raise_for_status()
            items_ids = response.json()["results"]
        
        # Busca detalhes de cada anúncio
        anuncios_atualizados = []
        for ml_id in items_ids:
            anuncio = await self._buscar_detalhes_anuncio(ml_id)
            if anuncio:
                anuncios_atualizados.append(anuncio)
        
        return anuncios_atualizados
    
    async def _buscar_detalhes_anuncio(self, ml_id: str) -> Optional[AnuncioMLResponse]:
        """Busca detalhes de um anúncio e salva no banco"""
        token = await self._carregar_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.ML_API_BASE}/items/{ml_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
        
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
        
        async with httpx.AsyncClient() as client:
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
        
        async with httpx.AsyncClient() as client:
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
        
        async with httpx.AsyncClient() as client:
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
