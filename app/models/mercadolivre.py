"""
Mercado Livre Data Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class MercadoLivreProduct(BaseModel):
    """Mercado Livre product model"""
    id: str
    title: str
    price: float
    currency_id: str
    available_quantity: int
    thumbnail: Optional[str] = None
    condition: Optional[str] = None
    permalink: Optional[str] = None


class MercadoLivreSearchRequest(BaseModel):
    """Request model for product search"""
    query: str = Field(..., description="Search query")
    category: Optional[str] = Field(None, description="Category filter")
    limit: int = Field(50, ge=1, le=100, description="Maximum number of results")


class MercadoLivreCategory(BaseModel):
    """Mercado Livre category model"""
    id: str
    name: str


class MercadoLivreAuthCallback(BaseModel):
    """OAuth callback model"""
    code: str = Field(..., description="Authorization code")
