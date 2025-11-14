"""
Product Data Models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    """Base product model"""
    title: str = Field(..., description="Product title")
    description: Optional[str] = Field(None, description="Product description")
    price: float = Field(..., description="Product price")
    category: Optional[str] = Field(None, description="Product category")
    image_url: Optional[str] = Field(None, description="Product image URL")


class ProductCreate(ProductBase):
    """Model for creating a new product"""
    mercadolivre_id: Optional[str] = Field(None, description="Mercado Livre product ID")


class ProductUpdate(BaseModel):
    """Model for updating a product"""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class Product(ProductBase):
    """Complete product model"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(..., description="Product ID")
    mercadolivre_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProductAnalysis(BaseModel):
    """Product analysis model"""
    model_config = ConfigDict(protected_namespaces=())
    
    product_id: str
    analysis: str
    model_used: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProductDescriptionRequest(BaseModel):
    """Request model for generating product descriptions"""
    product_name: str
    features: List[str]
    target_audience: Optional[str] = None


class KeywordSuggestionRequest(BaseModel):
    """Request model for keyword suggestions"""
    product_title: str
    category: str
