"""
Serviço para integração com Supabase (PostgreSQL)
"""
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

from app.config.settings import settings


class SupabaseService:
    """Cliente Supabase para operações no banco de dados"""
    
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    
    # ========== TOKENS MERCADO LIVRE ==========
    
    async def save_ml_token(
        self,
        user_id: int,
        access_token: str,
        refresh_token: str,
        expires_in: int,
        user_info: dict
    ) -> Dict[str, Any]:
        """
        Salva ou atualiza token do Mercado Livre
        """
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        data = {
            "user_id": user_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at.isoformat(),
            "nickname": user_info.get("nickname"),
            "email": user_info.get("email"),
            "first_name": user_info.get("first_name"),
            "last_name": user_info.get("last_name"),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Upsert (insert ou update)
        response = self.client.table("tokens_ml").upsert(data).execute()
        return response.data
    
    async def get_ml_token(self, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca token do Mercado Livre por user_id
        """
        response = self.client.table("tokens_ml").select("*").eq("user_id", user_id).execute()
        return response.data[0] if response.data else None
    
    async def update_ml_token(self, access_token: str, refresh_token: str, expires_in: int):
        """
        Atualiza tokens do Mercado Livre
        """
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at.isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = self.client.table("tokens_ml").update(data).eq("access_token", access_token).execute()
        return response.data
    
    # ========== PRODUTOS ==========
    
    async def save_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Salva ou atualiza produto
        """
        response = self.client.table("produtos").upsert(product_data).execute()
        return response.data
    
    async def get_products(self, user_id: int, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lista produtos de um usuário
        """
        response = self.client.table("produtos").select("*").eq("user_id", user_id).limit(limit).execute()
        return response.data
    
    async def get_product_by_ml_id(self, ml_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca produto pelo ID do Mercado Livre
        """
        response = self.client.table("produtos").select("*").eq("ml_id", ml_id).execute()
        return response.data[0] if response.data else None
    
    # ========== ANÚNCIOS ==========
    
    async def save_anuncio(self, anuncio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Salva anúncio
        """
        response = self.client.table("anuncios").insert(anuncio_data).execute()
        return response.data
    
    async def get_anuncios(self, user_id: int, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lista anúncios de um usuário
        """
        response = self.client.table("anuncios").select("*").eq("user_id", user_id).limit(limit).execute()
        return response.data
    
    # ========== CATÁLOGO ==========
    
    async def save_catalog_item(self, catalog_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Salva item do catálogo
        """
        response = self.client.table("catalogo").upsert(catalog_data).execute()
        return response.data
    
    async def search_catalog(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Busca itens no catálogo
        """
        response = self.client.table("catalogo").select("*").ilike("title", f"%{search_term}%").limit(limit).execute()
        return response.data
    
    # ========== PREÇOS CONCORRENTES ==========
    
    async def save_competitor_price(self, price_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Salva preço de concorrente
        """
        response = self.client.table("precos_concorrentes").insert(price_data).execute()
        return response.data
    
    async def get_competitor_prices(self, product_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Lista preços de concorrentes para um produto
        """
        response = (
            self.client.table("precos_concorrentes")
            .select("*")
            .eq("product_id", product_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data
    
    # ========== LOGS DE MONITORAMENTO ==========
    
    async def save_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Salva log de monitoramento
        """
        response = self.client.table("logs_monitoramento").insert(log_data).execute()
        return response.data
    
    async def get_logs(self, user_id: int, log_type: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lista logs de monitoramento
        """
        query = self.client.table("logs_monitoramento").select("*").eq("user_id", user_id)
        
        if log_type:
            query = query.eq("log_type", log_type)
        
        response = query.order("created_at", desc=True).limit(limit).execute()
        return response.data
