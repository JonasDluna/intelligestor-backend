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
from app.config.settings import get_supabase_client

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


def get_estoque_service(user_id: str = "default") -> EstoqueService:
    """Dependency injection do service"""
    # TODO: Pegar user_id real do JWT token
    supabase = get_supabase_client()
    return EstoqueService(supabase, user_id)


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
