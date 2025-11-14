"""
Router para rotas adicionais de produtos e catálogo
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import requests

from app.config.settings import settings
from app.services.supabase_service import SupabaseService

router = APIRouter(prefix="/api", tags=["Products & Catalog"])


@router.get("/products/sync")
async def sync_products(user_id: int):
    """
    Sincroniza produtos do Mercado Livre com o banco de dados
    """
    try:
        # Buscar token do usuário
        supabase = SupabaseService()
        token_info = await supabase.get_ml_token(user_id)
        
        if not token_info:
            raise HTTPException(status_code=401, detail="Usuário não autenticado")
        
        access_token = token_info.get("access_token")
        
        # Buscar produtos no ML
        response = requests.get(
            f"{settings.ML_API_URL}/users/{user_id}/items/search",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        response.raise_for_status()
        data = response.json()
        
        # Processar e salvar produtos
        products_saved = []
        for item_id in data.get("results", []):
            # Buscar detalhes do produto
            product_response = requests.get(
                f"{settings.ML_API_URL}/items/{item_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            product_data = product_response.json()
            
            # Preparar dados para salvar
            product_to_save = {
                "user_id": user_id,
                "ml_id": product_data.get("id"),
                "title": product_data.get("title"),
                "price": product_data.get("price"),
                "available_quantity": product_data.get("available_quantity"),
                "condition": product_data.get("condition"),
                "category_id": product_data.get("category_id"),
                "thumbnail": product_data.get("thumbnail"),
                "permalink": product_data.get("permalink"),
                "status": product_data.get("status")
            }
            
            saved = await supabase.save_product(product_to_save)
            products_saved.append(saved)
        
        return {
            "status": "success",
            "message": f"{len(products_saved)} produtos sincronizados",
            "products": products_saved
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar produtos: {str(e)}")


@router.get("/catalog/search")
async def search_catalog(
    query: str = Query(..., description="Termo de busca"),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Busca itens no catálogo do Mercado Livre
    """
    try:
        response = requests.get(
            f"{settings.ML_API_URL}/sites/MLB/search",
            params={"q": query, "limit": limit}
        )
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get("results", []):
            results.append({
                "id": item.get("id"),
                "title": item.get("title"),
                "price": item.get("price"),
                "thumbnail": item.get("thumbnail"),
                "condition": item.get("condition"),
                "permalink": item.get("permalink"),
                "seller": {
                    "id": item.get("seller", {}).get("id"),
                    "nickname": item.get("seller", {}).get("nickname")
                }
            })
        
        return {
            "status": "success",
            "total": len(results),
            "results": results
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar catálogo: {str(e)}")


@router.get("/catalog/compare/{product_id}")
async def compare_prices(product_id: str):
    """
    Compara preços de um produto específico
    """
    try:
        # Buscar produto
        response = requests.get(f"{settings.ML_API_URL}/items/{product_id}")
        response.raise_for_status()
        product = response.json()
        
        # Buscar produtos similares
        search_response = requests.get(
            f"{settings.ML_API_URL}/sites/MLB/search",
            params={
                "q": product.get("title"),
                "limit": 20
            }
        )
        search_data = search_response.json()
        
        competitors = []
        for item in search_data.get("results", []):
            if item.get("id") != product_id:
                competitors.append({
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "price": item.get("price"),
                    "seller_nickname": item.get("seller", {}).get("nickname"),
                    "condition": item.get("condition"),
                    "shipping_free": item.get("shipping", {}).get("free_shipping", False)
                })
        
        # Salvar preços no banco
        supabase = SupabaseService()
        for competitor in competitors:
            await supabase.save_competitor_price({
                "product_id": product_id,
                "seller_id": competitor.get("seller_id"),
                "seller_nickname": competitor.get("seller_nickname"),
                "price": competitor.get("price"),
                "shipping_free": competitor.get("shipping_free"),
                "condition": competitor.get("condition")
            })
        
        return {
            "status": "success",
            "product": {
                "id": product.get("id"),
                "title": product.get("title"),
                "price": product.get("price")
            },
            "competitors_count": len(competitors),
            "competitors": competitors[:10]  # Retornar apenas os 10 primeiros
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erro ao comparar preços: {str(e)}")


@router.get("/monitor/prices/{user_id}")
async def monitor_prices(user_id: int):
    """
    Monitora preços dos produtos do usuário
    """
    supabase = SupabaseService()
    
    # Buscar produtos do usuário
    products = await supabase.get_products(user_id)
    
    monitoring_results = []
    for product in products:
        ml_id = product.get("ml_id")
        
        # Buscar preços de concorrentes
        competitors = await supabase.get_competitor_prices(ml_id, limit=5)
        
        if competitors:
            min_price = min([c.get("price") for c in competitors])
            avg_price = sum([c.get("price") for c in competitors]) / len(competitors)
            
            monitoring_results.append({
                "product_id": ml_id,
                "product_title": product.get("title"),
                "current_price": product.get("price"),
                "min_competitor_price": min_price,
                "avg_competitor_price": avg_price,
                "competitors_count": len(competitors)
            })
    
    return {
        "status": "success",
        "user_id": user_id,
        "products_monitored": len(monitoring_results),
        "results": monitoring_results
    }


@router.post("/automations/rules")
async def create_automation_rule(
    user_id: int,
    rule_type: str,
    product_id: Optional[str] = None,
    threshold: Optional[float] = None
):
    """
    Cria regra de automação
    """
    supabase = SupabaseService()
    
    log_data = {
        "user_id": user_id,
        "log_type": "automation_rule",
        "action": f"create_{rule_type}",
        "details": {
            "product_id": product_id,
            "threshold": threshold,
            "rule_type": rule_type
        },
        "status": "active"
    }
    
    await supabase.save_log(log_data)
    
    return {
        "status": "success",
        "message": "Regra de automação criada",
        "rule_type": rule_type
    }
