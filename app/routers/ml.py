"""
Router - Mercado Livre
Endpoints para integração com API do ML
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.schemas import AnuncioMLResponse
from app.services.ml_service import MercadoLivreService
from app.config.settings import get_supabase_client

router = APIRouter(prefix="/mercadolivre", tags=["Mercado Livre"])


# Models específicos
class AtualizarPrecoRequest(BaseModel):
    ml_id: str
    novo_preco: Decimal = Field(..., gt=0)


class StatusAnuncioRequest(BaseModel):
    ml_id: str


def get_ml_service(user_id: str = "default") -> MercadoLivreService:
    """Dependency injection do service"""
    # TODO: Pegar user_id real do JWT token
    supabase = get_supabase_client()
    return MercadoLivreService(supabase, user_id)


@router.post("/sincronizar", response_model=List[AnuncioMLResponse])
async def sincronizar_anuncios(
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Sincroniza anúncios do Mercado Livre com banco local
    
    Busca todos os anúncios ativos do usuário no ML e atualiza base local.
    Útil para:
    - Primeira sincronização
    - Atualização periódica (via cron)
    - Refresh manual pelo usuário
    """
    try:
        return await service.sincronizar_anuncios()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar: {str(e)}")


@router.get("/anuncio/{ml_id}", response_model=AnuncioMLResponse)
async def buscar_anuncio(
    ml_id: str,
    service: MercadoLivreService = Depends(get_ml_service)
):
    """Busca anúncio no banco local por ML ID"""
    anuncio = await service.buscar_anuncio_local(ml_id)
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anúncio não encontrado")
    return anuncio


@router.put("/preco")
async def atualizar_preco(
    request: AtualizarPrecoRequest,
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Atualiza preço de um anúncio no Mercado Livre
    
    - **ml_id**: ID do anúncio no ML (ex: MLB123456789)
    - **novo_preco**: Novo preço (deve ser > 0)
    
    Atualiza tanto no ML quanto no banco local.
    """
    sucesso = await service.atualizar_preco(request.ml_id, request.novo_preco)
    
    if not sucesso:
        raise HTTPException(
            status_code=400, 
            detail="Falha ao atualizar preço. Verifique token ML e ID do anúncio."
        )
    
    return {
        "success": True,
        "message": f"Preço atualizado para R$ {request.novo_preco}",
        "ml_id": request.ml_id
    }


@router.post("/pausar")
async def pausar_anuncio(
    request: StatusAnuncioRequest,
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Pausa anúncio no Mercado Livre
    
    Útil para:
    - Estoque zerado temporariamente
    - Ajustes no produto
    - Estratégia de vendas
    """
    sucesso = await service.pausar_anuncio(request.ml_id)
    
    if not sucesso:
        raise HTTPException(
            status_code=400,
            detail="Falha ao pausar anúncio. Verifique token ML e ID do anúncio."
        )
    
    return {
        "success": True,
        "message": "Anúncio pausado com sucesso",
        "ml_id": request.ml_id
    }


@router.post("/reativar")
async def reativar_anuncio(
    request: StatusAnuncioRequest,
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Reativa anúncio pausado no Mercado Livre
    
    Útil para:
    - Estoque reabastecido
    - Fim de ajustes
    - Reativação automática por regras
    """
    sucesso = await service.reativar_anuncio(request.ml_id)
    
    if not sucesso:
        raise HTTPException(
            status_code=400,
            detail="Falha ao reativar anúncio. Verifique token ML e ID do anúncio."
        )
    
    return {
        "success": True,
        "message": "Anúncio reativado com sucesso",
        "ml_id": request.ml_id
    }


@router.get("/status-token")
async def verificar_token(
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Verifica status do token ML
    
    Retorna se o token está válido ou expirado.
    Útil para dashboard e alertas.
    """
    token = await service._carregar_token()
    
    return {
        "token_valido": token is not None,
        "message": "Token válido" if token else "Token expirado ou não encontrado"
    }
