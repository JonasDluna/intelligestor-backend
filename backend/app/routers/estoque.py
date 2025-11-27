"""
Router - Estoque
Endpoints para gestão de estoque e movimentações
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.schemas import (
    EstoqueResponse,
    TipoMovimentacao
)
from app.services.estoque_service import EstoqueService
from app.services.ml_sync_service import MLSyncService
from app.config.settings import get_supabase_client
from app.middleware.auth import get_current_user_id

router = APIRouter(prefix="/estoque", tags=["Estoque"])


# Models específicos do router
class MovimentacaoRequest(BaseModel):
    produto_id: int
    variacao_id: Optional[int] = None
    tipo: TipoMovimentacao
    quantidade: int = Field(..., gt=0)
    motivo: str
    custo_unitario: Optional[Decimal] = None
    documento: Optional[str] = None


def get_estoque_service(user_id: str = Depends(get_current_user_id)) -> EstoqueService:
    """Dependency injection do service com autenticação JWT"""
    supabase = get_supabase_client()
    return EstoqueService(supabase, user_id)


def get_ml_sync_service(user_id: str = Depends(get_current_user_id)) -> MLSyncService:
    """Dependency injection do service de sincronização ML com autenticação JWT"""
    supabase = get_supabase_client()
    return MLSyncService(supabase, user_id)


@router.get("/produto/{produto_id}", response_model=EstoqueResponse)
async def buscar_estoque(
    produto_id: int,
    service: EstoqueService = Depends(get_estoque_service)
):
    """Busca estoque de um produto específico"""
    estoque = await service.buscar_estoque(produto_id)
    if not estoque:
        raise HTTPException(status_code=404, detail="Estoque não encontrado")
    return estoque


@router.post("/movimentacao", response_model=EstoqueResponse)
async def movimentar_estoque(
    movimentacao: MovimentacaoRequest,
    service: EstoqueService = Depends(get_estoque_service)
):
    """
    Registra movimentação de estoque
    
    **Tipos de movimentação:**
    - **entrada**: Adiciona ao estoque (ex: compra de mercadoria)
    - **saida**: Remove do estoque (ex: venda)
    - **ajuste**: Corrige divergências (inventário)
    - **reserva**: Bloqueia quantidade (pedido pendente)
    - **liberacao**: Libera reserva (cancelamento)
    
    **Campos:**
    - **produto_id**: ID do produto (obrigatório)
    - **variacao_id**: ID da variação (opcional)
    - **tipo**: Tipo de movimentação (obrigatório)
    - **quantidade**: Quantidade movimentada (obrigatório, > 0)
    - **motivo**: Justificativa da movimentação (obrigatório)
    - **custo_unitario**: Custo por unidade (opcional, útil para ENTRADA)
    - **documento**: Nota fiscal, pedido, etc (opcional)
    """
    try:
        return await service.movimentar_estoque(
            produto_id=movimentacao.produto_id,
            variacao_id=movimentacao.variacao_id,
            tipo=movimentacao.tipo,
            quantidade=movimentacao.quantidade,
            motivo=movimentacao.motivo,
            custo_unitario=movimentacao.custo_unitario,
            documento=movimentacao.documento
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/movimentacoes/{produto_id}")
async def listar_movimentacoes(
    produto_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    service: EstoqueService = Depends(get_estoque_service)
):
    """
    Lista histórico de movimentações de um produto
    
    - **skip**: Quantos registros pular
    - **limit**: Quantos registros retornar (máx 200)
    """
    return await service.listar_movimentacoes(produto_id, skip, limit)


@router.get("/alertas/baixo-estoque")
async def produtos_abaixo_minimo(
    service: EstoqueService = Depends(get_estoque_service)
):
    """
    Lista produtos com estoque abaixo do mínimo
    
    Útil para:
    - Dashboard de alertas
    - Notificações automáticas
    - Planejamento de compras
    """
    return await service.produtos_abaixo_minimo()


@router.post("/sync/produto/{produto_id}")
async def sincronizar_estoque_produto(
    produto_id: int,
    nova_quantidade: int = Query(..., ge=0, description="Nova quantidade a sincronizar"),
    service: MLSyncService = Depends(get_ml_sync_service)
):
    """
    Sincroniza estoque de um produto específico com ML
    Atualiza todos os anúncios vinculados
    """
    try:
        return await service.sincronizar_estoque_produto(produto_id, nova_quantidade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/todos")
async def sincronizar_todos_estoques(
    service: MLSyncService = Depends(get_ml_sync_service)
):
    """
    Sincroniza estoque de todos os produtos com ML
    Atualiza automaticamente baseado no estoque local
    """
    try:
        return await service.sincronizar_todos_estoques()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/importar-ml")
async def importar_estoque_ml(
    service: MLSyncService = Depends(get_ml_sync_service)
):
    """
    Importa quantidades do ML para o sistema local
    Útil para sincronizar após vendas diretas no ML
    """
    try:
        return await service.importar_estoque_ml()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/ml/{ml_id}")
async def buscar_estoque_ml(
    ml_id: str,
    service: MLSyncService = Depends(get_ml_sync_service)
):
    """
    Consulta estoque de um anúncio diretamente no ML
    """
    try:
        quantidade = await service.buscar_estoque_ml(ml_id)
        return {
            "ml_id": ml_id,
            "quantidade": quantidade
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
