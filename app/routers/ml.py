"""
Router - Mercado Livre
Endpoints para integração com API do ML
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.schemas import AnuncioMLResponse
from app.services.ml_service import MercadoLivreService
from app.config.settings import get_supabase_client
from app.middleware.auth import get_current_user_id
from app.utils.version import get_version_info

router = APIRouter(prefix="/ml", tags=["Mercado Livre"])


@router.get("/health")
async def health_check():
    """
    Health check - verifica versão do deploy
    NÃO requer autenticação
    """
    version_info = get_version_info()
    return {
        "status": "ok",
        "version": version_info["version"],
        "timestamp": datetime.utcnow().isoformat(),
        "changes": version_info["changes"]
    }


# Models específicos
class AtualizarPrecoRequest(BaseModel):
    ml_id: str
    novo_preco: Decimal = Field(..., gt=0)


class StatusAnuncioRequest(BaseModel):
    ml_id: str


def get_ml_service(user_id: str = Depends(get_current_user_id)) -> MercadoLivreService:
    """Dependency injection do service"""
    supabase = get_supabase_client()
    return MercadoLivreService(supabase, user_id)


@router.get("/status")
async def verificar_status_ml(user_id: str = Depends(get_current_user_id)):
    """
    Verifica se o usuário tem conta ML conectada
    
    Retorna:
    - connected: bool - Se há token ML válido
    - ml_user_id: str - ID do usuário no ML (se conectado)
    - nickname: str - Nome no ML (se conectado)
    """
    try:
        print(f"[DEBUG] Verificando status ML para user_id: {user_id}")
        supabase = get_supabase_client()
        
        result = supabase.table("tokens_ml")\
            .select("ml_user_id, nickname, expires_at, access_token")\
            .eq("user_id", user_id)\
            .maybe_single()\
            .execute()
        
        print(f"[DEBUG] Query result exists: {result is not None}")
        print(f"[DEBUG] Query data exists: {result.data is not None if result else False}")
        
        if result and result.data:
            has_token = bool(result.data.get("access_token"))
            print(f"[DEBUG] Token exists: {has_token}")
            print(f"[DEBUG] Nickname: {result.data.get('nickname')}")
            print(f"[DEBUG] ML User ID: {result.data.get('ml_user_id')}")
            
            return {
                "connected": True,
                "ml_user_id": result.data.get("ml_user_id"),
                "nickname": result.data.get("nickname"),
                "expires_at": result.data.get("expires_at")
            }
        else:
            print(f"[DEBUG] Nenhum token encontrado para user_id: {user_id}")
            return {
                "connected": False,
                "ml_user_id": None,
                "nickname": None
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar status ML: {str(e)}")


@router.post("/disconnect")
async def desconectar_ml(user_id: str = Depends(get_current_user_id)):
    """
    Desconecta conta do Mercado Livre
    
    Remove o token de acesso do banco de dados.
    O usuário precisará reconectar para usar funcionalidades ML novamente.
    """
    try:
        print(f"[DEBUG] Desconectando ML para user_id: {user_id}")
        supabase = get_supabase_client()
        
        # Deleta o token do usuário
        result = supabase.table("tokens_ml")\
            .delete()\
            .eq("user_id", user_id)\
            .execute()
        
        print(f"[DEBUG] Token ML removido, result: {len(result.data) if result.data else 0}")
        
        return {
            "success": True,
            "message": "Conta do Mercado Livre desconectada com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao desconectar ML: {str(e)}")


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


@router.get("/anuncios")
async def listar_anuncios(
    limit: int = Query(100, ge=1, le=500),
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Lista anúncios salvos no banco local
    
    Retorna anúncios já sincronizados. Use /sincronizar para atualizar.
    """
    try:
        print(f"[DEBUG] Listando anúncios para user_id: {service.user_id}")
        anuncios = await service.listar_anuncios_locais(limit=limit)
        print(f"[DEBUG] Encontrados {len(anuncios)} anúncios")
        
        return {
            "success": True,
            "count": len(anuncios),
            "anuncios": anuncios
        }
    except Exception as e:
        print(f"[ERROR] Erro ao listar anúncios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar anúncios: {str(e)}")


@router.get("/catalog/items")
async def listar_catalog_items(
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Lista itens do catálogo ML que o usuário possui
    
    Retorna apenas anúncios que participam do catálogo ML.
    Estes são os itens elegíveis para Monitor BuyBox.
    """
    try:
        items = await service.buscar_catalog_items()
        return {
            "success": True,
            "count": len(items),
            "items": items
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar itens do catálogo: {str(e)}")


@router.get("/catalog/buybox/{item_id}")
async def buscar_buybox(
    item_id: str,
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Busca dados de BuyBox/concorrência de um item
    
    Retorna:
    - Preço atual do item
    - Preço do campeão (menor preço)
    - Diferença percentual
    - Se está ganhando ou perdendo BuyBox
    - Quantidade de ofertas concorrentes
    """
    try:
        buybox_data = await service.buscar_buybox_data(item_id)
        
        if not buybox_data:
            raise HTTPException(status_code=404, detail="Dados de BuyBox não encontrados")
        
        return {
            "success": True,
            "data": buybox_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar BuyBox: {str(e)}")


@router.get("/perguntas")
async def listar_perguntas(
    status: str = Query("unanswered", regex="^(unanswered|answered|all)$"),
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Lista perguntas dos anúncios
    
    - **status**: 'unanswered' (pendentes), 'answered' (respondidas), 'all' (todas)
    
    Útil para:
    - Dashboard de perguntas pendentes
    - Resposta automática por IA
    - Histórico de atendimento
    """
    try:
        perguntas = await service.buscar_perguntas(status=status)
        return {
            "success": True,
            "count": len(perguntas),
            "status_filter": status,
            "perguntas": perguntas
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar perguntas: {str(e)}")


class ResponderPerguntaRequest(BaseModel):
    question_id: int
    resposta: str = Field(..., min_length=1, max_length=2000)


@router.post("/perguntas/responder")
async def responder_pergunta(
    request: ResponderPerguntaRequest,
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Responde uma pergunta no Mercado Livre
    
    - **question_id**: ID da pergunta (obtido em /ml/perguntas)
    - **resposta**: Texto da resposta (1-2000 caracteres)
    
    A resposta será publicada no ML e o comprador receberá notificação.
    """
    try:
        sucesso = await service.responder_pergunta(request.question_id, request.resposta)
        
        if not sucesso:
            raise HTTPException(
                status_code=400,
                detail="Falha ao responder pergunta. Verifique token ML e ID da pergunta."
            )
        
        return {
            "success": True,
            "message": "Pergunta respondida com sucesso",
            "question_id": request.question_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao responder pergunta: {str(e)}")


@router.get("/vendas")
async def listar_vendas(
    limit: int = Query(50, ge=1, le=200),
    service: MercadoLivreService = Depends(get_ml_service)
):
    """
    Lista vendas/pedidos do Mercado Livre
    
    Retorna pedidos ordenados por data (mais recentes primeiro).
    
    Útil para:
    - Dashboard de vendas
    - Acompanhamento de pedidos
    - Relatórios financeiros
    """
    try:
        vendas = await service.buscar_vendas(limit=limit)
        return {
            "success": True,
            "count": len(vendas),
            "vendas": vendas
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar vendas: {str(e)}")
