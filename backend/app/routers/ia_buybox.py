"""
Router - IA BuyBox (Legacy + New)
Mantém compatibilidade com endpoints antigos + novos com services
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import (
    BuyBoxAnalysisRequest,
    BuyBoxAnalysisResponse,
    PriceOptimizationRequest,
    PriceOptimizationResponse
)
from app.services.ia_service import IAService, chamar_ia
from app.services.ml_prompts import prompt_diagnostico_buybox
from app.config.settings import get_supabase_client

router = APIRouter(prefix="/ia/buybox", tags=["IA - BuyBox"])


def get_ia_service(user_id: str = "default") -> IAService:
    """Dependency injection do service"""
    # TODO: Pegar user_id real do JWT token
    supabase = get_supabase_client()
    return IAService(supabase, user_id)


# ============ NOVOS ENDPOINTS ============

@router.post("/analisar", response_model=BuyBoxAnalysisResponse)
async def analisar_buybox(
    request: BuyBoxAnalysisRequest,
    service: IAService = Depends(get_ia_service)
):
    """
    Análise completa de BuyBox com IA
    
    - Compara preços com concorrentes
    - Avalia histórico (7 dias)
    - Gera recomendações inteligentes via GPT-4
    - Sugere ações práticas
    
    **Campos:**
    - **anuncio_id**: ID do anúncio no banco local
    - **incluir_historico**: Incluir análise de histórico (default: true)
    """
    try:
        return await service.analisar_buybox(
            request.anuncio_id, 
            request.incluir_historico
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/otimizar-preco", response_model=PriceOptimizationResponse)
async def otimizar_preco(
    request: PriceOptimizationRequest,
    service: IAService = Depends(get_ia_service)
):
    """
    Otimização inteligente de preço com IA
    
    Considera:
    - Custo do produto
    - Margem mínima desejada
    - Preços da concorrência
    - Histórico de vendas
    
    **Campos:**
    - **anuncio_id**: ID do anúncio
    - **margem_minima**: Margem mínima % (opcional, default: 20%)
    """
    try:
        return await service.otimizar_preco(
            request.anuncio_id,
            request.margem_minima
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ ENDPOINT LEGACY ============

@router.post("/diagnostico")
async def diagnostico_buybox_legacy(payload: dict):
    """
    [LEGACY] Diagnóstico BuyBox - mantido para compatibilidade
    
    Use `/analisar` para nova versão com mais recursos.
    """
    prompt = prompt_diagnostico_buybox(payload)
    content = chamar_ia([
        {"role": "system", "content": "Você é um consultor sênior de Mercado Livre, especialista em BuyBox."},
        {"role": "user", "content": prompt},
    ])
    return {"diagnostico": content}
