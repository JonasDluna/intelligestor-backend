"""
Router - Produtos
Endpoints para gestão de produtos
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.models.schemas import (
    ProdutoCreate,
    ProdutoUpdate,
    ProdutoResponse,
    StatusProduto
)
from app.services.produto_service import ProdutoService
from app.config.settings import get_supabase_client

router = APIRouter(prefix="/produtos", tags=["Produtos"])


def get_produto_service(user_id: str = "c98c6de3-2c35-4840-880f-70d7215fc3e5") -> ProdutoService:
    """Dependency injection do service"""
    # TODO: Pegar user_id real do JWT token
    supabase = get_supabase_client()
    return ProdutoService(supabase, user_id)


@router.post("/", response_model=ProdutoResponse, status_code=201)
async def criar_produto(
    produto: ProdutoCreate,
    service: ProdutoService = Depends(get_produto_service)
):
    """
    Cria novo produto
    
    - **sku_interno**: SKU único do produto (obrigatório)
    - **titulo**: Nome/título do produto (obrigatório)
    - **descricao**: Descrição detalhada
    - **categoria_ml**: Categoria do Mercado Livre
    - **custo**: Custo do produto
    - **preco_sugerido**: Preço de venda sugerido
    - **margem_minima**: Margem mínima desejada (%)
    """
    try:
        return service.criar_produto(produto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{produto_id}", response_model=ProdutoResponse)
async def buscar_produto(
    produto_id: int,
    service: ProdutoService = Depends(get_produto_service)
):
    """Busca produto por ID"""
    produto = service.buscar_produto(produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto


@router.get("/", response_model=List[ProdutoResponse])
async def listar_produtos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[StatusProduto] = None,
    service: ProdutoService = Depends(get_produto_service)
):
    """
    Lista produtos com paginação
    
    - **skip**: Quantos registros pular (paginação)
    - **limit**: Quantos registros retornar (máx 500)
    - **status**: Filtrar por status (active, inactive, discontinued)
    """
    return service.listar_produtos(skip, limit, status)


@router.put("/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(
    produto_id: int,
    produto: ProdutoUpdate,
    service: ProdutoService = Depends(get_produto_service)
):
    """Atualiza dados do produto (campos opcionais)"""
    resultado = service.atualizar_produto(produto_id, produto)
    if not resultado:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return resultado


@router.delete("/{produto_id}", status_code=204)
async def deletar_produto(
    produto_id: int,
    service: ProdutoService = Depends(get_produto_service)
):
    """Soft delete - marca produto como DISCONTINUED"""
    sucesso = service.deletar_produto(produto_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Produto não encontrado")


@router.get("/sku/{sku}", response_model=ProdutoResponse)
async def buscar_por_sku(
    sku: str,
    service: ProdutoService = Depends(get_produto_service)
):
    """Busca produto por SKU interno"""
    produto = service.buscar_por_sku(sku)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto
