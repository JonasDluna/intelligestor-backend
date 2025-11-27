"""
Serviço Real de API do Mercado Livre 
Para integração com dados verdadeiros de BuyBox e concorrência
Usando APIs OFICIAIS: price_to_win, products, items
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime

# Importar a API oficial
from ..services.ml_official_api import ml_official_api

router = APIRouter(prefix="/ml", tags=["Mercado Livre API Oficial"])

@router.get("/buybox/analysis/{item_id}")
async def get_buybox_analysis_official(item_id: str):
    """
    Análise OFICIAL do BuyBox usando API price_to_win do Mercado Livre
    Retorna dados verdadeiros de competição, status e recomendações
    """
    try:
        # Obter dados da API oficial price_to_win
        price_to_win_data = ml_official_api.get_item_price_to_win(item_id)
        
        # Obter produto do catálogo (se disponível)
        catalog_product_id = price_to_win_data.get('catalog_product_id')
        product_data = None
        competitors_data = None
        
        if catalog_product_id:
            # Buscar dados do produto e competidores
            product_data = ml_official_api.get_product_buybox_winner(catalog_product_id)
            competitors_data = ml_official_api.get_product_competitors(catalog_product_id)
        
        # Análise completa integrada
        analysis = {
            "item_id": item_id,
            "analysis_timestamp": datetime.now().isoformat(),
            "api_source": "official_mercadolibre",
            "catalog_product_id": catalog_product_id,
            
            # Dados do price_to_win (oficial)
            "buybox_status": {
                "current_status": price_to_win_data.get('status'),
                "is_winning": price_to_win_data.get('status') == 'winning',
                "is_competing": price_to_win_data.get('status') == 'competing',
                "is_sharing_first_place": price_to_win_data.get('status') == 'sharing_first_place',
                "is_listed_only": price_to_win_data.get('status') == 'listed',
                "visit_share": price_to_win_data.get('visit_share'),
                "competitors_sharing_first_place": price_to_win_data.get('competitors_sharing_first_place'),
                "consistent": price_to_win_data.get('consistent', False)
            },
            
            # Análise de preços
            "pricing_analysis": {
                "current_price": price_to_win_data.get('current_price'),
                "price_to_win": price_to_win_data.get('price_to_win'),
                "currency_id": price_to_win_data.get('currency_id'),
                "price_adjustment_needed": price_to_win_data.get('price_to_win') is not None,
                "price_gap": calculate_price_gap(
                    price_to_win_data.get('current_price'), 
                    price_to_win_data.get('price_to_win')
                )
            },
            
            # Boosts e oportunidades
            "competitive_advantages": {
                "active_boosts": [b for b in price_to_win_data.get('boosts', []) if b.get('is_active')],
                "available_opportunities": [b for b in price_to_win_data.get('boosts', []) if b.get('is_opportunity')],
                "boost_score": calculate_boost_score(price_to_win_data.get('boosts', []))
            },
            
            # Competitividade geral
            "competitive_analysis": price_to_win_data.get('competitive_analysis', {}),
            
            # Dados do produto (se disponível)
            "product_context": product_data,
            
            # Lista de competidores (se disponível) 
            "competitors_summary": {
                "total_competitors": competitors_data.get('total_competitors', 0) if competitors_data else 0,
                "top_competitors": competitors_data.get('competitors', [])[:5] if competitors_data else [],
                "competitor_price_range": calculate_competitor_price_range(competitors_data) if competitors_data else None
            },
            
            # Razões para não competir (se aplicável)
            "blocking_reasons": price_to_win_data.get('reason', []),
            "blocking_reasons_solved": generate_reason_solutions(price_to_win_data.get('reason', [])),
            
            # Winner atual
            "current_winner": price_to_win_data.get('winner', {}),
            
            # Recomendações estratégicas
            "strategic_recommendations": price_to_win_data.get('competitive_analysis', {}).get('recommendations', []),
            "immediate_opportunities": price_to_win_data.get('competitive_analysis', {}).get('opportunities', [])
        }
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise oficial: {str(e)}")

@router.get("/competitors/official/{product_id}")
async def get_competitors_official(
    product_id: str, 
    limit: int = Query(default=20, le=50),
    shipping_cost: str = Query(default=None, description="free para frete grátis"),
    official_store: str = Query(default=None, description="all para lojas oficiais"),
    price_range: str = Query(default=None, description="min-max ex: 20-50")
):
    """
    Lista OFICIAL de competidores usando endpoint /products/{product_id}/items
    Com filtros avançados da API oficial do ML
    """
    try:
        # Montar filtros
        filters = {'limit': limit}
        
        if shipping_cost:
            filters['shipping_cost'] = shipping_cost
        
        if official_store:
            filters['official_store'] = official_store
            
        if price_range:
            filters['price'] = price_range
        
        # Buscar competidores pela API oficial
        competitors_data = ml_official_api.get_product_competitors(product_id, filters)
        
        # Enriquecer dados com análise de price_to_win para cada competidor
        enriched_competitors = []
        
        for competitor in competitors_data.get('competitors', [])[:limit]:
            competitor_item_id = competitor.get('item_id')
            
            # Tentar obter price_to_win do competidor (pode falhar por rate limit)
            try:
                competitor_buybox = ml_official_api.get_item_price_to_win(competitor_item_id)
                competitor['buybox_analysis'] = {
                    'status': competitor_buybox.get('status'),
                    'visit_share': competitor_buybox.get('visit_share'),
                    'competitive_level': competitor_buybox.get('competitive_analysis', {}).get('competitive_level')
                }
            except:
                competitor['buybox_analysis'] = None
            
            enriched_competitors.append(competitor)
        
        # Análise do mercado
        market_analysis = analyze_competitor_market(enriched_competitors)
        
        return {
            "product_id": product_id,
            "api_source": "official_mercadolibre",
            "filters_applied": filters,
            "total_competitors": competitors_data.get('total_competitors', 0),
            "competitors": enriched_competitors,
            "market_analysis": market_analysis,
            "paging": competitors_data.get('paging', {}),
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar competidores oficiais: {str(e)}")

@router.get("/product/winner/{product_id}")
async def get_buybox_winner_official(product_id: str):
    """
    Identificar o ganhador OFICIAL do BuyBox usando /products/{product_id}
    """
    try:
        # Obter dados oficiais do produto
        product_data = ml_official_api.get_product_buybox_winner(product_id)
        
        winner_data = product_data.get('winner', {})
        
        if not winner_data:
            raise HTTPException(status_code=404, detail="Nenhum ganhador encontrado para este produto")
        
        # Analisar o winner atual
        winner_analysis = {
            "product_id": product_id,
            "product_name": product_data.get('product_name'),
            "permalink": product_data.get('permalink'),
            
            "current_winner": {
                "item_id": winner_data.get('item_id'),
                "seller_id": winner_data.get('seller_id'),
                "price": winner_data.get('price', 0) / 100,
                "currency_id": winner_data.get('currency_id'),
                "available_quantity": winner_data.get('available_quantity'),
                "condition": winner_data.get('condition'),
                "listing_type": winner_data.get('listing_type_id'),
                "official_store_id": winner_data.get('official_store_id'),
                "is_official_store": winner_data.get('official_store_id') is not None,
                
                "shipping_advantages": {
                    "free_shipping": winner_data.get('shipping', {}).get('free_shipping', False),
                    "shipping_mode": winner_data.get('shipping', {}).get('mode'),
                    "logistic_type": winner_data.get('shipping', {}).get('logistic_type'),
                    "is_fulfillment": winner_data.get('shipping', {}).get('logistic_type') == 'fulfillment'
                },
                
                "seller_advantages": {
                    "reputation_level": winner_data.get('seller', {}).get('reputation_level_id'),
                    "seller_tags": winner_data.get('seller', {}).get('tags', [])
                }
            },
            
            "price_range": product_data.get('price_range', {}),
            "buybox_activation_date": product_data.get('activation_date'),
            
            "competitive_insights": analyze_winner_advantages(winner_data),
            "how_to_compete": generate_competition_strategy(winner_data),
            
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return winner_analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao analisar winner oficial: {str(e)}")

# Funções auxiliares
def calculate_price_gap(current_price: Optional[float], price_to_win: Optional[float]) -> Optional[Dict]:
    """Calcular gap de preço para ganhar"""
    if not current_price or not price_to_win:
        return None
        
    gap_amount = current_price - price_to_win
    gap_percentage = (gap_amount / current_price) * 100
    
    return {
        "gap_amount": gap_amount,
        "gap_percentage": gap_percentage,
        "urgency": "alta" if gap_percentage > 10 else "média" if gap_percentage > 5 else "baixa"
    }

def calculate_boost_score(boosts: List[Dict]) -> Dict:
    """Calcular score baseado nos boosts ativos"""
    total_possible = len(boosts)
    active_boosts = len([b for b in boosts if b.get('is_active')])
    opportunities = len([b for b in boosts if b.get('is_opportunity')])
    
    score = (active_boosts / total_possible) * 100 if total_possible > 0 else 0
    
    return {
        "score": round(score, 1),
        "active_count": active_boosts,
        "total_possible": total_possible,
        "opportunities_count": opportunities,
        "level": "excelente" if score >= 80 else "bom" if score >= 60 else "médio" if score >= 40 else "baixo"
    }

def calculate_competitor_price_range(competitors_data: Optional[Dict]) -> Optional[Dict]:
    """Calcular range de preços dos competidores"""
    if not competitors_data or not competitors_data.get('competitors'):
        return None
    
    prices = [c.get('price', 0) for c in competitors_data.get('competitors', []) if c.get('price', 0) > 0]
    
    if not prices:
        return None
    
    return {
        "min_price": min(prices),
        "max_price": max(prices),
        "avg_price": sum(prices) / len(prices),
        "median_price": sorted(prices)[len(prices) // 2],
        "price_spread": max(prices) - min(prices)
    }

def generate_reason_solutions(reasons: List[str]) -> List[Dict]:
    """Gerar soluções para razões de não competição"""
    solutions = []
    
    reason_solutions = {
        'non_trusted_seller': {
            'problem': 'Vendedor marcado como não confiável',
            'solution': 'Melhorar histórico de vendas e avaliações',
            'urgency': 'crítica',
            'estimated_time': '30-90 dias'
        },
        'reputation_below_threshold': {
            'problem': 'Reputação abaixo do necessário',
            'solution': 'Aumentar volume de vendas e manter bom atendimento',
            'urgency': 'alta',
            'estimated_time': '15-60 dias'
        },
        'manufacturing_time': {
            'problem': 'Produto com tempo de fabricação',
            'solution': 'Manter estoque ou reduzir tempo de produção',
            'urgency': 'média',
            'estimated_time': '1-7 dias'
        },
        'item_paused': {
            'problem': 'Publicação pausada',
            'solution': 'Reativar a publicação',
            'urgency': 'crítica',
            'estimated_time': 'imediato'
        },
        'shipping_mode': {
            'problem': 'Método de envio inferior',
            'solution': 'Configurar Mercado Envios Full',
            'urgency': 'alta',
            'estimated_time': '1-3 dias'
        }
    }
    
    for reason in reasons:
        if reason in reason_solutions:
            solutions.append(reason_solutions[reason])
    
    return solutions

def analyze_competitor_market(competitors: List[Dict]) -> Dict:
    """Analisar mercado de competidores"""
    if not competitors:
        return {}
    
    total = len(competitors)
    
    # Análise de frete grátis
    free_shipping_count = len([c for c in competitors if c.get('shipping', {}).get('free_shipping')])
    free_shipping_rate = (free_shipping_count / total) * 100
    
    # Análise de fulfillment
    fulfillment_count = len([c for c in competitors if c.get('shipping', {}).get('logistic_type') == 'fulfillment'])
    fulfillment_rate = (fulfillment_count / total) * 100
    
    # Análise de lojas oficiais
    official_stores_count = len([c for c in competitors if c.get('official_store_id')])
    official_stores_rate = (official_stores_count / total) * 100
    
    return {
        "market_characteristics": {
            "total_analyzed": total,
            "free_shipping_adoption": {
                "count": free_shipping_count,
                "percentage": round(free_shipping_rate, 1),
                "is_standard": free_shipping_rate > 70
            },
            "fulfillment_adoption": {
                "count": fulfillment_count,
                "percentage": round(fulfillment_rate, 1),
                "competitive_advantage": fulfillment_rate < 50
            },
            "official_stores": {
                "count": official_stores_count,
                "percentage": round(official_stores_rate, 1)
            }
        },
        "competitive_recommendations": [
            "Frete grátis é essencial" if free_shipping_rate > 70 else "Frete grátis pode ser diferencial",
            "Mercado Envios Full é vantagem competitiva" if fulfillment_rate < 50 else "Fulfillment é padrão no mercado"
        ]
    }

def analyze_winner_advantages(winner_data: Dict) -> List[str]:
    """Analisar vantagens do ganhador atual"""
    advantages = []
    
    # Análise de preço
    price = winner_data.get('price', 0) / 100
    if price > 0:
        advantages.append(f"Preço competitivo: R$ {price:.2f}")
    
    # Análise de envio
    shipping = winner_data.get('shipping', {})
    if shipping.get('free_shipping'):
        advantages.append("Oferece frete grátis")
    
    if shipping.get('logistic_type') == 'fulfillment':
        advantages.append("Usa Mercado Envios Full")
    
    # Análise de vendedor
    seller = winner_data.get('seller', {})
    reputation = seller.get('reputation_level_id')
    if reputation == 'GREEN':
        advantages.append("Vendedor com reputação verde (excelente)")
    
    # Loja oficial
    if winner_data.get('official_store_id'):
        advantages.append("Loja oficial do Mercado Livre")
    
    return advantages

def generate_competition_strategy(winner_data: Dict) -> List[str]:
    """Gerar estratégia para competir com o winner"""
    strategies = []
    
    winner_price = winner_data.get('price', 0) / 100
    if winner_price > 0:
        target_price = winner_price - 0.50
        strategies.append(f"Defina preço em R$ {target_price:.2f} ou menor")
    
    shipping = winner_data.get('shipping', {})
    if shipping.get('free_shipping'):
        strategies.append("Configure frete grátis obrigatoriamente")
    
    if shipping.get('logistic_type') == 'fulfillment':
        strategies.append("Ative Mercado Envios Full para igualar vantagem logística")
    
    if winner_data.get('official_store_id'):
        strategies.append("Considere se tornar loja oficial para competir em pé de igualdade")
    
    strategies.append("Mantenha estoque alto para garantir disponibilidade")
    strategies.append("Monitore mudanças de preço do ganhador")
    
    return strategies


# ==================== ENDPOINTS DE LISTING TYPES ====================

@router.get("/listing-types/{site_id}")
async def get_listing_types_by_site(site_id: str):
    """
    Obter todos os tipos de publicação disponíveis por site
    Exemplo: MLB, MLA, MLM, etc.
    """
    try:
        data = ml_official_api.get_listing_types(site_id)
        return {
            "site_id": site_id,
            "listing_types": data,
            "total": len(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar listing types: {str(e)}")


@router.get("/listing-types/{site_id}/{listing_type_id}")
async def get_listing_type_specs(site_id: str, listing_type_id: str):
    """
    Obter especificações detalhadas de um tipo de publicação
    Retorna: fees, duração, exposição, etc.
    """
    try:
        data = ml_official_api.get_listing_type_details(site_id, listing_type_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar especificações: {str(e)}")


@router.get("/users/{user_id}/available-listing-types")
async def get_available_listing_types_for_user(
    user_id: str,
    category_id: Optional[str] = Query(None, description="ID da categoria")
):
    """
    Verificar tipos de publicação disponíveis para um usuário em uma categoria
    """
    try:
        data = ml_official_api.get_user_available_listing_types(user_id, category_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar tipos disponíveis: {str(e)}")


@router.get("/listing-exposures/{site_id}")
async def get_listing_exposures(site_id: str):
    """
    Obter níveis de exposição de publicações por site
    Retorna: lowest, low, mid, high, highest
    """
    try:
        data = ml_official_api.get_listing_exposures(site_id)
        return {
            "site_id": site_id,
            "exposures": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar exposições: {str(e)}")


@router.get("/listing-exposures/{site_id}/{exposure_id}")
async def get_listing_exposure_details(site_id: str, exposure_id: str):
    """
    Obter detalhes de um nível de exposição específico
    """
    try:
        data = ml_official_api.get_listing_exposure_by_id(site_id, exposure_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar exposição: {str(e)}")


@router.get("/items/{item_id}/available-listing-types")
async def get_item_available_listing_types(item_id: str):
    """
    Verificar tipos de publicação disponíveis para um item específico
    """
    try:
        data = ml_official_api.get_item_available_listing_types(item_id)
        return {
            "item_id": item_id,
            "available_listing_types": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar tipos disponíveis: {str(e)}")


@router.get("/items/{item_id}/available-upgrades")
async def get_item_available_upgrades(item_id: str):
    """
    Verificar upgrades disponíveis para um item
    Retorna tipos de publicação com maior exposição
    """
    try:
        data = ml_official_api.get_item_available_upgrades(item_id)
        return {
            "item_id": item_id,
            "available_upgrades": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar upgrades: {str(e)}")


@router.get("/items/{item_id}/available-downgrades")
async def get_item_available_downgrades(item_id: str):
    """
    Verificar downgrades disponíveis para um item
    Retorna tipos de publicação com menor exposição
    """
    try:
        data = ml_official_api.get_item_available_downgrades(item_id)
        return {
            "item_id": item_id,
            "available_downgrades": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar downgrades: {str(e)}")


@router.post("/items/{item_id}/listing-type")
async def update_item_listing_type(
    item_id: str,
    listing_type_data: Dict[str, str]
):
    """
    Atualizar o tipo de publicação de um item
    Body: {"id": "gold_special"} ou {"id": "gold_pro"}
    """
    try:
        listing_type_id = listing_type_data.get('id')
        if not listing_type_id:
            raise HTTPException(status_code=400, detail="Campo 'id' é obrigatório")
        
        data = ml_official_api.update_item_listing_type(item_id, listing_type_id)
        return {
            "item_id": item_id,
            "new_listing_type": listing_type_id,
            "updated": True,
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar listing type: {str(e)}")


# ========================================
# ENDPOINTS DE CATÁLOGO (CATALOG)
# ========================================

@router.get("/catalog/seller/{user_id}/items")
async def get_seller_catalog_items(
    user_id: str,
    catalog_listing: bool = Query(True, description="Filtrar por publicações de catálogo (true) ou tradicionais (false)"),
    status: str = Query(None, description="Filtrar por status: active, paused, closed")
):
    """
    Listar publicações de catálogo ou tradicionais de um vendedor
    
    Exemplos:
    - GET /ml/catalog/seller/123456/items?catalog_listing=true (publicações de catálogo)
    - GET /ml/catalog/seller/123456/items?catalog_listing=false (publicações tradicionais)
    - GET /ml/catalog/seller/123456/items?catalog_listing=true&status=active
    """
    try:
        data = ml_official_api.search_catalog_items_by_seller(user_id, catalog_listing, status)
        return {
            "seller_id": user_id,
            "catalog_listing": catalog_listing,
            "status_filter": status,
            "total_items": data.get('total', 0),
            "items": data.get('items', []),
            "paging": data.get('paging', {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar itens do vendedor: {str(e)}")


@router.get("/catalog/eligibility/{item_id}")
async def check_catalog_eligibility(item_id: str):
    """
    Verificar se um item é elegível para catálogo
    
    Retorna:
    - buy_box_eligible: true/false se pode competir no catálogo
    - status: READY_FOR_OPTIN, ALREADY_OPTED_IN, CLOSED, NOT_ELIGIBLE, etc.
    - variations: elegibilidade de cada variação
    """
    try:
        data = ml_official_api.check_catalog_eligibility(item_id)
        return {
            "item_id": item_id,
            "eligibility": data,
            "can_optin": data.get('buy_box_eligible', False),
            "status": data.get('status'),
            "has_variations": len(data.get('variations', [])) > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar elegibilidade: {str(e)}")


@router.get("/catalog/eligibility/multiget")
async def check_multiple_catalog_eligibility(
    item_ids: str = Query(..., description="IDs separados por vírgula: MLA123,MLA456,MLA789")
):
    """
    Verificar elegibilidade de múltiplos itens de uma vez
    
    Exemplo:
    - GET /ml/catalog/eligibility/multiget?item_ids=MLA123,MLA456,MLA789
    """
    try:
        ids_list = item_ids.split(',')
        data = ml_official_api.check_multiple_catalog_eligibility(ids_list)
        
        return {
            "total_items_checked": len(ids_list),
            "items": data,
            "eligible_count": sum(1 for item in data if item.get('buy_box_eligible') == True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar múltiplos itens: {str(e)}")


@router.get("/catalog/products/search")
async def search_catalog_products(
    site_id: str = Query(..., description="ID do site: MLB, MLA, MLM, etc."),
    status: str = Query('active', description="Status: active ou inactive"),
    q: str = Query(None, description="Palavras-chave de busca: 'Samsung Galaxy S20'"),
    product_identifier: str = Query(None, description="GTIN/EAN/UPC do produto"),
    domain_id: str = Query(None, description="ID do domínio: MLA-CELLPHONES, etc."),
    listing_strategy: str = Query(None, description="Filtrar por: catalog_required, catalog_only"),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Buscar produtos no catálogo do Mercado Livre
    
    Exemplos:
    - GET /ml/catalog/products/search?site_id=MLA&q=iPhone 13
    - GET /ml/catalog/products/search?site_id=MLB&product_identifier=123456789
    - GET /ml/catalog/products/search?site_id=MLM&domain_id=MLM-CELLPHONES&status=active
    - GET /ml/catalog/products/search?site_id=MLA&listing_strategy=catalog_required
    """
    try:
        data = ml_official_api.search_catalog_products(
            site_id=site_id,
            status=status,
            q=q,
            product_identifier=product_identifier,
            domain_id=domain_id,
            listing_strategy=listing_strategy,
            offset=offset,
            limit=limit
        )
        
        return {
            "site_id": site_id,
            "query": q or product_identifier,
            "total_results": data.get('total', 0),
            "results": data.get('results', []),
            "paging": data.get('paging', {}),
            "filters_applied": {
                "status": status,
                "domain_id": domain_id,
                "listing_strategy": listing_strategy
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produtos: {str(e)}")


@router.get("/catalog/products/{product_id}")
async def get_catalog_product_details(product_id: str):
    """
    Obter detalhes completos de um produto de catálogo
    
    Retorna:
    - Informações do produto
    - Atributos técnicos
    - Fotos
    - Produtos pai/filho (parent_id, children_ids)
    - Ganhador do BuyBox atual
    - Faixa de preços
    """
    try:
        data = ml_official_api.get_catalog_product_details(product_id)
        
        return {
            "product_id": product_id,
            "product": data,
            "is_parent": len(data.get('children_ids', [])) > 0,
            "is_child": data.get('parent_id') is not None,
            "is_buyable": data.get('status') == 'active' and len(data.get('children_ids', [])) == 0,
            "has_winner": data.get('buy_box_winner') is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar detalhes do produto: {str(e)}")


@router.post("/catalog/items/create")
async def create_catalog_listing(item_data: Dict[str, Any]):
    """
    Criar publicação diretamente no catálogo
    
    Body JSON (exemplo):
    {
        "site_id": "MLA",
        "title": "iPhone 13 128GB Preto",
        "category_id": "MLA1055",
        "price": 500000,
        "currency_id": "ARS",
        "available_quantity": 1,
        "buying_mode": "buy_it_now",
        "listing_type_id": "gold_special",
        "catalog_product_id": "MLA18500844",
        "catalog_listing": true,
        "attributes": [...]
    }
    """
    try:
        # Validar campos obrigatórios
        required_fields = ['site_id', 'title', 'category_id', 'price', 'catalog_product_id']
        missing_fields = [field for field in required_fields if field not in item_data]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Campos obrigatórios faltando: {', '.join(missing_fields)}"
            )
        
        data = ml_official_api.create_catalog_listing(item_data)
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data)
        
        return {
            "success": True,
            "item_id": data.get('id'),
            "catalog_listing": True,
            "status": data.get('status'),
            "permalink": data.get('permalink'),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar publicação de catálogo: {str(e)}")


@router.post("/catalog/items/optin")
async def create_catalog_optin(optin_data: Dict[str, Any]):
    """
    Fazer optin de item tradicional para catálogo
    
    Body JSON (sem variações):
    {
        "item_id": "MLA123456789",
        "catalog_product_id": "MLA18500844"
    }
    
    Body JSON (com variações):
    {
        "item_id": "MLM123456789",
        "catalog_product_id": "MLM15996654",
        "variation_id": 174997747229
    }
    """
    try:
        item_id = optin_data.get('item_id')
        catalog_product_id = optin_data.get('catalog_product_id')
        variation_id = optin_data.get('variation_id')
        
        if not item_id or not catalog_product_id:
            raise HTTPException(
                status_code=400,
                detail="Campos 'item_id' e 'catalog_product_id' são obrigatórios"
            )
        
        data = ml_official_api.create_catalog_optin(item_id, catalog_product_id, variation_id)
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data)
        
        return {
            "success": True,
            "original_item_id": item_id,
            "catalog_item_id": data.get('id'),
            "catalog_product_id": catalog_product_id,
            "variation_id": variation_id,
            "catalog_listing": True,
            "item_relations": data.get('item_relations', []),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer optin: {str(e)}")


@router.get("/catalog/forewarning/{item_id}/date")
async def get_catalog_forewarning_date(item_id: str):
    """
    Consultar data limite para associar item ao catálogo
    
    Possíveis status:
    - date_defined: Data definida para moderação
    - date_not_defined: Sem data (item não tem tag catalog_forewarning)
    - date_expired: Data já expirou
    """
    try:
        data = ml_official_api.get_catalog_forewarning_date(item_id)
        
        return {
            "item_id": item_id,
            "status": data.get('status'),
            "moderation_date": data.get('moderation_date'),
            "needs_action": data.get('status') == 'date_defined'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar data de forewarning: {str(e)}")


@router.get("/catalog/sync/{item_id}/status")
async def get_catalog_sync_status(item_id: str):
    """
    Verificar status de sincronização entre item tradicional e catálogo
    
    Possíveis status:
    - SYNC: Sincronizado
    - UNSYNC: Dessincronizado (precisa correção)
    """
    try:
        data = ml_official_api.get_catalog_sync_status(item_id)
        
        return {
            "item_id": item_id,
            "sync_status": data.get('status'),
            "is_synced": data.get('status') == 'SYNC',
            "needs_fix": data.get('status') == 'UNSYNC',
            "timestamp": data.get('timestamp'),
            "relations": data.get('relations', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar sincronização: {str(e)}")


@router.post("/catalog/sync/{item_id}/fix")
async def fix_catalog_sync(item_id: str):
    """
    Corrigir sincronização de item dessincronizado
    
    Use este endpoint quando o item estiver com status UNSYNC
    """
    try:
        data = ml_official_api.fix_catalog_sync(item_id)
        
        return {
            "item_id": item_id,
            "sync_fixed": data.get('success', False),
            "message": data.get('message', 'Operação concluída'),
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao corrigir sincronização: {str(e)}")


# ========================================
# ENDPOINTS DE BRAND CENTRAL
# ========================================

@router.get("/brand-central/users/{user_id}/quota")
async def get_user_catalog_quota(user_id: str):
    """
    Verificar quota de sugestões disponíveis para o usuário
    
    Retorna:
    - quota: Lista com tipos de quota e quantidade disponível
    - Usuários não permitidos retornam erro 403
    """
    try:
        data = ml_official_api.get_user_catalog_quota(user_id)
        
        if 'error' in data:
            raise HTTPException(status_code=403, detail=data.get('error'))
        
        quota_info = data.get('quota', [])
        total_available = sum(q.get('available', 0) for q in quota_info)
        
        return {
            "user_id": user_id,
            "quota": quota_info,
            "total_available": total_available,
            "can_create_suggestions": total_available > 0
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar quota: {str(e)}")


@router.get("/brand-central/domains/{site_id}/available")
async def get_available_domains_for_suggestions(site_id: str):
    """
    Listar domínios disponíveis para criar sugestões de produtos
    
    Retorna:
    - Lista de domínios com flag 'available'
    - Nome e fotos de exemplo de cada domínio
    """
    try:
        data = ml_official_api.get_available_domains_for_suggestions(site_id)
        
        domains = data.get('domains', [])
        available_domains = [d for d in domains if d.get('available')]
        
        return {
            "site_id": site_id,
            "generation_date": data.get('generation_date'),
            "total_domains": len(domains),
            "available_domains": len(available_domains),
            "domains": domains
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar domínios: {str(e)}")


@router.get("/brand-central/domains/{domain_id}/technical-specs")
async def get_domain_technical_specs(
    domain_id: str,
    spec_type: str = Query('full', description="Tipo: full, input ou output")
):
    """
    Obter ficha técnica de um domínio para criar sugestões
    
    spec_type:
    - full: Input e output completos
    - input: Apenas campos para preenchimento
    - output: Apenas campos que serão exibidos
    """
    try:
        data = ml_official_api.get_domain_technical_specs(domain_id, spec_type)
        
        return {
            "domain_id": domain_id,
            "spec_type": spec_type,
            "technical_specs": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ficha técnica: {str(e)}")


@router.post("/brand-central/suggestions/validate")
async def validate_catalog_suggestion(suggestion_data: Dict[str, Any]):
    """
    Validar sugestão antes de criar efetivamente
    
    Body JSON (exemplo):
    {
        "title": "Samsung Galaxy S21 128GB",
        "domain_id": "MLA-CELLPHONES",
        "pictures": [{"id": "647954-MLA46144073729_052021"}],
        "attributes": [
            {"id": "BRAND", "values": [{"name": "Samsung"}]},
            {"id": "MODEL", "values": [{"name": "Galaxy S21"}]},
            {"id": "INTERNAL_MEMORY", "values": [{"name": "128 GB"}]}
        ]
    }
    """
    try:
        result = ml_official_api.validate_catalog_suggestion(suggestion_data)
        
        is_valid = result.get('valid', False)
        
        return {
            "is_valid": is_valid,
            "can_create": is_valid,
            "validation_result": result,
            "errors": result.get('errors', []) if not is_valid else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao validar sugestão: {str(e)}")


@router.post("/brand-central/suggestions/create")
async def create_catalog_suggestion(suggestion_data: Dict[str, Any]):
    """
    Criar sugestão de produto para o catálogo
    
    Body JSON (exemplo):
    {
        "title": "Samsung Galaxy S21 128GB Preto",
        "domain_id": "MLA-CELLPHONES",
        "pictures": [{"id": "647954-MLA46144073729_052021"}],
        "attributes": [
            {"id": "BRAND", "values": [{"id": "206", "name": "Samsung"}]},
            {"id": "LINE", "values": [{"id": "249991", "name": "Galaxy S"}]},
            {"id": "MODEL", "values": [{"name": "S21"}]},
            {"id": "INTERNAL_MEMORY", "values": [{"name": "128 GB"}]},
            {"id": "COLOR", "values": [{"name": "Preto"}]},
            {"id": "GTIN", "values": [{"name": "8801643709488"}]}
        ]
    }
    """
    try:
        data = ml_official_api.create_catalog_suggestion(suggestion_data)
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data)
        
        return {
            "success": True,
            "suggestion_id": data.get('id'),
            "status": data.get('status'),
            "title": data.get('title'),
            "domain_id": data.get('domain_id'),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar sugestão: {str(e)}")


@router.get("/brand-central/suggestions/{suggestion_id}")
async def get_catalog_suggestion(suggestion_id: str):
    """
    Obter detalhes de uma sugestão existente
    
    Status possíveis:
    - UNDER_REVIEW: Em revisão
    - WAITING_FOR_FIX: Aguardando correção
    - PUBLISHED: Aprovada e publicada
    - REJECTED: Rejeitada
    """
    try:
        data = ml_official_api.get_catalog_suggestion(suggestion_id)
        
        if 'error' in data:
            raise HTTPException(status_code=404, detail=data.get('error'))
        
        return {
            "suggestion_id": suggestion_id,
            "status": data.get('status'),
            "sub_status": data.get('sub_status'),
            "needs_action": data.get('status') == 'WAITING_FOR_FIX',
            "is_published": data.get('status') == 'PUBLISHED',
            "suggestion": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar sugestão: {str(e)}")


@router.put("/brand-central/suggestions/{suggestion_id}")
async def update_catalog_suggestion(
    suggestion_id: str,
    suggestion_data: Dict[str, Any]
):
    """
    Modificar uma sugestão existente (apenas se status = WAITING_FOR_FIX)
    
    Body JSON: Mesma estrutura do create, com campos a modificar
    """
    try:
        data = ml_official_api.update_catalog_suggestion(suggestion_id, suggestion_data)
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data)
        
        return {
            "success": True,
            "suggestion_id": suggestion_id,
            "updated_status": data.get('status'),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar sugestão: {str(e)}")


@router.get("/brand-central/users/{user_id}/suggestions")
async def list_user_suggestions(
    user_id: str,
    limit: int = Query(50, ge=10, le=50),
    offset: int = Query(0, ge=0),
    domain_ids: str = Query(None, description="IDs separados por vírgula"),
    status: str = Query(None, description="Filtrar por status"),
    title: str = Query(None, description="Buscar por título parcial")
):
    """
    Listar todas as sugestões criadas por um usuário
    
    Exemplos:
    - GET /ml/brand-central/users/123456/suggestions
    - GET /ml/brand-central/users/123456/suggestions?status=UNDER_REVIEW
    - GET /ml/brand-central/users/123456/suggestions?domain_ids=MLA-CELLPHONES,MLA-TABLETS
    - GET /ml/brand-central/users/123456/suggestions?title=Samsung
    """
    try:
        domain_list = domain_ids.split(',') if domain_ids else None
        
        data = ml_official_api.list_user_suggestions(
            user_id=user_id,
            limit=limit,
            offset=offset,
            domain_ids=domain_list,
            status=status,
            title=title
        )
        
        return {
            "user_id": user_id,
            "total": data.get('total', 0),
            "suggestions": data.get('suggestions', []),
            "scroll_id": data.get('scroll_id'),
            "filters": {
                "status": status,
                "domain_ids": domain_list,
                "title": title
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar sugestões: {str(e)}")


@router.get("/brand-central/suggestions/{suggestion_id}/validations")
async def get_suggestion_validations(suggestion_id: str):
    """
    Obter resultado das validações de uma sugestão
    
    Retorna lista de erros e avisos encontrados
    """
    try:
        data = ml_official_api.get_suggestion_validations(suggestion_id)
        
        validations = data.get('validations', [])
        errors = [v for v in validations if v.get('type') == 'error']
        warnings = [v for v in validations if v.get('type') == 'warning']
        
        return {
            "suggestion_id": suggestion_id,
            "total_validations": len(validations),
            "total_errors": len(errors),
            "total_warnings": len(warnings),
            "has_errors": len(errors) > 0,
            "validations": validations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar validações: {str(e)}")


@router.post("/brand-central/suggestions/{suggestion_id}/description")
async def create_suggestion_description(
    suggestion_id: str,
    description_data: Dict[str, str]
):
    """
    Criar descrição para uma sugestão
    
    Body JSON:
    {
        "description": "Texto completo da descrição do produto..."
    }
    """
    try:
        description = description_data.get('description')
        if not description:
            raise HTTPException(status_code=400, detail="Campo 'description' é obrigatório")
        
        data = ml_official_api.create_suggestion_description(suggestion_id, description)
        
        return {
            "suggestion_id": suggestion_id,
            "description_created": data.get('success', False),
            "message": data.get('message', ''),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar descrição: {str(e)}")


@router.put("/brand-central/suggestions/{suggestion_id}/description")
async def update_suggestion_description(
    suggestion_id: str,
    description_data: Dict[str, str]
):
    """
    Atualizar descrição de uma sugestão existente
    
    Body JSON:
    {
        "description": "Novo texto da descrição..."
    }
    """
    try:
        description = description_data.get('description')
        if not description:
            raise HTTPException(status_code=400, detail="Campo 'description' é obrigatório")
        
        data = ml_official_api.update_suggestion_description(suggestion_id, description)
        
        return {
            "suggestion_id": suggestion_id,
            "description_updated": data.get('success', False),
            "message": data.get('message', ''),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar descrição: {str(e)}")
