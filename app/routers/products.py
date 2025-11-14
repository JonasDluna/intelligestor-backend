"""
Products Router
Handles product-related endpoints
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.models.product import Product, ProductCreate, ProductUpdate
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.get("/", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    List all products with optional category filter
    """
    if not supabase_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not configured"
        )
    
    try:
        filters = {"category": category} if category else None
        products = await supabase_service.get_all("products", filters)
        return products[skip:skip + limit]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """
    Get a specific product by ID
    """
    if not supabase_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not configured"
        )
    
    try:
        product = await supabase_service.get_by_id("products", product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    """
    Create a new product
    """
    if not supabase_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not configured"
        )
    
    try:
        new_product = await supabase_service.create("products", product.dict())
        return new_product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate):
    """
    Update an existing product
    """
    if not supabase_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not configured"
        )
    
    try:
        # Check if product exists
        existing_product = await supabase_service.get_by_id("products", product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Update only provided fields
        update_data = product.dict(exclude_unset=True)
        updated_product = await supabase_service.update("products", product_id, update_data)
        return updated_product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """
    Delete a product
    """
    if not supabase_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not configured"
        )
    
    try:
        # Check if product exists
        existing_product = await supabase_service.get_by_id("products", product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        await supabase_service.delete("products", product_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
