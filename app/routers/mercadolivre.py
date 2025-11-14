"""
Mercado Livre Router
Handles Mercado Livre API endpoints
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.mercadolivre import (
    MercadoLivreProduct,
    MercadoLivreSearchRequest,
    MercadoLivreCategory,
    MercadoLivreAuthCallback
)
from app.services.mercadolivre_service import mercadolivre_service

router = APIRouter()


@router.get("/auth/url")
async def get_auth_url():
    """
    Get OAuth authorization URL
    """
    try:
        auth_url = await mercadolivre_service.get_authorization_url()
        return {"authorization_url": auth_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/auth/callback")
async def handle_auth_callback(callback: MercadoLivreAuthCallback):
    """
    Handle OAuth callback and exchange code for token
    """
    try:
        token_data = await mercadolivre_service.get_access_token(callback.code)
        return token_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/search", response_model=List[MercadoLivreProduct])
async def search_products(search_request: MercadoLivreSearchRequest):
    """
    Search for products on Mercado Livre
    """
    try:
        products = await mercadolivre_service.search_products(
            query=search_request.query,
            category=search_request.category,
            limit=search_request.limit
        )
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Get detailed information about a product
    """
    try:
        product = await mercadolivre_service.get_product(product_id)
        return product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/categories", response_model=List[MercadoLivreCategory])
async def get_categories():
    """
    Get available categories
    """
    try:
        categories = await mercadolivre_service.get_categories()
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/users/{user_id}/items")
async def get_user_items(user_id: str):
    """
    Get items listed by a user
    """
    try:
        items = await mercadolivre_service.get_user_items(user_id)
        return items
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
