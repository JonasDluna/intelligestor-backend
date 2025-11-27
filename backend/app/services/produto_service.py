"""
Service - Produtos
CRUD completo para gestão de produtos
"""
from typing import List, Optional
from datetime import datetime
from supabase import Client
from app.models.schemas import (
    ProdutoCreate, 
    ProdutoUpdate, 
    ProdutoResponse,
    StatusProduto
)


class ProdutoService:
    def __init__(self, supabase_client: Client, user_id: str):
        self.db = supabase_client
        self.user_id = user_id
    
    def criar_produto(self, produto: ProdutoCreate) -> ProdutoResponse:
        """Cria novo produto no banco"""
        data = {
            "user_id": self.user_id,
            "sku_interno": produto.sku_interno,
            "titulo": produto.titulo,
            "descricao": produto.descricao,
            "categoria_ml": produto.categoria_ml,
            "marca": produto.marca,
            "custo": str(produto.custo) if produto.custo else None,
            "preco_sugerido": str(produto.preco_sugerido) if produto.preco_sugerido else None,
            "margem_minima": str(produto.margem_minima),
            "status": StatusProduto.ACTIVE.value
        }
        
        result = self.db.table("produtos").insert(data).execute()
        return ProdutoResponse(**result.data[0])
    
    def buscar_produto(self, produto_id: int) -> Optional[ProdutoResponse]:
        """Busca produto por ID"""
        result = self.db.table("produtos")\
            .select("*")\
            .eq("id", produto_id)\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if result.data:
            return ProdutoResponse(**result.data)
        return None
    
    def listar_produtos(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[StatusProduto] = None
    ) -> List[ProdutoResponse]:
        """Lista produtos do usuário com paginação"""
        query = self.db.table("produtos")\
            .select("*")\
            .eq("user_id", self.user_id)\
            .order("created_at", desc=True)\
            .range(skip, skip + limit - 1)
        
        if status:
            query = query.eq("status", status.value)
        
        result = query.execute()
        return [ProdutoResponse(**item) for item in result.data]
    
    def atualizar_produto(
        self, 
        produto_id: int, 
        produto: ProdutoUpdate
    ) -> Optional[ProdutoResponse]:
        """Atualiza dados do produto"""
        # Busca produto primeiro para validar ownership
        existing = self.buscar_produto(produto_id)
        if not existing:
            return None
        
        # Prepara dados apenas com campos fornecidos
        update_data = {}
        if produto.titulo is not None:
            update_data["titulo"] = produto.titulo
        if produto.descricao is not None:
            update_data["descricao"] = produto.descricao
        if produto.categoria_ml is not None:
            update_data["categoria_ml"] = produto.categoria_ml
        if produto.marca is not None:
            update_data["marca"] = produto.marca
        if produto.custo is not None:
            update_data["custo"] = str(produto.custo)
        if produto.preco_sugerido is not None:
            update_data["preco_sugerido"] = str(produto.preco_sugerido)
        if produto.margem_minima is not None:
            update_data["margem_minima"] = str(produto.margem_minima)
        if produto.status is not None:
            update_data["status"] = produto.status.value
        
        result = self.db.table("produtos")\
            .update(update_data)\
            .eq("id", produto_id)\
            .eq("user_id", self.user_id)\
            .execute()
        
        return ProdutoResponse(**result.data[0])
    
    def deletar_produto(self, produto_id: int) -> bool:
        """Soft delete - marca produto como descontinuado"""
        result = self.db.table("produtos")\
            .update({"status": StatusProduto.DISCONTINUED.value})\
            .eq("id", produto_id)\
            .eq("user_id", self.user_id)\
            .execute()
        
        return len(result.data) > 0
    
    def buscar_por_sku(self, sku: str) -> Optional[ProdutoResponse]:
        """Busca produto por SKU interno"""
        result = self.db.table("produtos")\
            .select("*")\
            .eq("sku_interno", sku)\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if result.data:
            return ProdutoResponse(**result.data)
        return None
