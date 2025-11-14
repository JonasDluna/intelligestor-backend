"""
Mercado Livre API Service
Handles all interactions with Mercado Livre API
"""
import httpx
from typing import Optional, List, Dict, Any
from app.utils.config import settings


class MercadoLivreService:
    """Service for interacting with Mercado Livre API"""
    
    BASE_URL = "https://api.mercadolibre.com"
    
    def __init__(self):
        """Initialize Mercado Livre service"""
        self.client_id = settings.MERCADOLIVRE_CLIENT_ID
        self.client_secret = settings.MERCADOLIVRE_CLIENT_SECRET
        self.redirect_uri = settings.MERCADOLIVRE_REDIRECT_URI
        self.access_token = settings.MERCADOLIVRE_ACCESS_TOKEN
    
    async def get_authorization_url(self) -> str:
        """
        Get OAuth authorization URL
        
        Returns:
            Authorization URL
        """
        return (
            f"{self.BASE_URL}/authorization"
            f"?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
        )
    
    async def get_access_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token
        
        Args:
            code: Authorization code
            
        Returns:
            Token response
        """
        url = f"{self.BASE_URL}/oauth/token"
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data)
            response.raise_for_status()
            return response.json()
    
    async def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Search for products on Mercado Livre
        
        Args:
            query: Search query
            category: Optional category filter
            limit: Maximum number of results
            
        Returns:
            List of products
        """
        url = f"{self.BASE_URL}/sites/MLB/search"
        params = {
            "q": query,
            "limit": limit
        }
        
        if category:
            params["category"] = category
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
    
    async def get_product(self, product_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a product
        
        Args:
            product_id: Product ID
            
        Returns:
            Product details
        """
        url = f"{self.BASE_URL}/items/{product_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    
    async def get_user_items(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get items listed by a user
        
        Args:
            user_id: User ID
            
        Returns:
            List of items
        """
        if not self.access_token:
            raise ValueError("Access token is required for this operation")
        
        url = f"{self.BASE_URL}/users/{user_id}/items/search"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
    
    async def get_categories(self, site: str = "MLB") -> List[Dict[str, Any]]:
        """
        Get available categories
        
        Args:
            site: Site ID (MLB for Brazil)
            
        Returns:
            List of categories
        """
        url = f"{self.BASE_URL}/sites/{site}/categories"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()


# Singleton instance
mercadolivre_service = MercadoLivreService()
