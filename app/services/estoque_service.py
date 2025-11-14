"""
Service - Estoque
Gestão de estoque com movimentações e validações
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from supabase import Client
from app.models.schemas import (
    EstoqueResponse,
    TipoMovimentacao
)


class EstoqueService:
    def __init__(self, supabase_client: Client, user_id: str):
        self.db = supabase_client
        self.user_id = user_id
    
    async def buscar_estoque(self, produto_id: int) -> Optional[EstoqueResponse]:
        """Busca estoque de um produto"""
        # Valida ownership do produto
        produto = self.db.table("produtos")\
            .select("id")\
            .eq("id", produto_id)\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if not produto.data:
            return None
        
        result = self.db.table("estoque")\
            .select("*")\
            .eq("produto_id", produto_id)\
            .maybe_single()\
            .execute()
        
        if result.data:
            return EstoqueResponse(**result.data)
        return None
    
    async def movimentar_estoque(
        self,
        produto_id: int,
        variacao_id: Optional[int],
        tipo: TipoMovimentacao,
        quantidade: int,
        motivo: str,
        custo_unitario: Optional[Decimal] = None,
        documento: Optional[str] = None
    ) -> EstoqueResponse:
        """
        Registra movimentação de estoque
        
        - ENTRADA: Adiciona ao estoque
        - SAIDA: Remove do estoque (ex: venda)
        - AJUSTE: Corrige divergências
        - RESERVA: Bloqueia quantidade (pedido pendente)
        - LIBERACAO: Libera reserva cancelada
        """
        # Valida ownership
        produto = self.db.table("produtos")\
            .select("id")\
            .eq("id", produto_id)\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if not produto.data:
            raise ValueError("Produto não encontrado")
        
        # Busca estoque atual
        estoque_atual = await self.buscar_estoque(produto_id)
        
        if not estoque_atual:
            # Cria registro de estoque se não existir
            self.db.table("estoque").insert({
                "produto_id": produto_id,
                "variacao_id": variacao_id,
                "estoque_atual": 0,
                "estoque_disponivel": 0,
                "estoque_minimo": 0,
                "estoque_reservado": 0
            }).execute()
            estoque_atual = await self.buscar_estoque(produto_id)
        
        # Valida movimentação
        if tipo == TipoMovimentacao.SAIDA:
            if estoque_atual.estoque_disponivel < quantidade:
                raise ValueError(f"Estoque insuficiente. Disponível: {estoque_atual.estoque_disponivel}")
        
        elif tipo == TipoMovimentacao.RESERVA:
            if estoque_atual.estoque_disponivel < quantidade:
                raise ValueError(f"Estoque insuficiente para reserva. Disponível: {estoque_atual.estoque_disponivel}")
        
        # Registra movimentação
        movimentacao_data = {
            "produto_id": produto_id,
            "variacao_id": variacao_id,
            "tipo": tipo.value,
            "quantidade": quantidade,
            "motivo": motivo,
            "custo_unitario": str(custo_unitario) if custo_unitario else None,
            "documento": documento,
            "user_id": self.user_id
        }
        
        self.db.table("movimentacoes_estoque").insert(movimentacao_data).execute()
        
        # Atualiza estoque
        novo_estoque = self._calcular_novo_estoque(
            estoque_atual, tipo, quantidade
        )
        
        result = self.db.table("estoque")\
            .update(novo_estoque)\
            .eq("produto_id", produto_id)\
            .execute()
        
        return EstoqueResponse(**result.data[0])
    
    def _calcular_novo_estoque(
        self, 
        estoque: EstoqueResponse, 
        tipo: TipoMovimentacao, 
        quantidade: int
    ) -> dict:
        """Calcula novos valores de estoque baseado no tipo de movimentação"""
        novo = {
            "estoque_atual": estoque.estoque_atual,
            "estoque_disponivel": estoque.estoque_disponivel,
            "estoque_reservado": getattr(estoque, 'estoque_reservado', 0)
        }
        
        if tipo == TipoMovimentacao.ENTRADA:
            novo["estoque_atual"] += quantidade
            novo["estoque_disponivel"] += quantidade
        
        elif tipo == TipoMovimentacao.SAIDA:
            novo["estoque_atual"] -= quantidade
            novo["estoque_disponivel"] -= quantidade
        
        elif tipo == TipoMovimentacao.AJUSTE:
            diferenca = quantidade - estoque.estoque_atual
            novo["estoque_atual"] = quantidade
            novo["estoque_disponivel"] += diferenca
        
        elif tipo == TipoMovimentacao.RESERVA:
            novo["estoque_disponivel"] -= quantidade
            novo["estoque_reservado"] += quantidade
        
        elif tipo == TipoMovimentacao.LIBERACAO:
            novo["estoque_disponivel"] += quantidade
            novo["estoque_reservado"] -= quantidade
        
        return novo
    
    async def listar_movimentacoes(
        self,
        produto_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[dict]:
        """Lista histórico de movimentações de um produto"""
        # Valida ownership
        produto = self.db.table("produtos")\
            .select("id")\
            .eq("id", produto_id)\
            .eq("user_id", self.user_id)\
            .maybe_single()\
            .execute()
        
        if not produto.data:
            return []
        
        result = self.db.table("movimentacoes_estoque")\
            .select("*")\
            .eq("produto_id", produto_id)\
            .order("created_at", desc=True)\
            .range(skip, skip + limit - 1)\
            .execute()
        
        return result.data
    
    async def produtos_abaixo_minimo(self) -> List[dict]:
        """Lista produtos com estoque abaixo do mínimo"""
        result = self.db.rpc("produtos_abaixo_minimo", {
            "p_user_id": self.user_id
        }).execute()
        
        return result.data if result.data else []
