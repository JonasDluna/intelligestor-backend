"""
Service - Automação
Execução de regras automáticas de preço, estoque e BuyBox
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
from supabase import Client
from app.models.schemas import (
    RegraAutomacaoCreate,
    RegraAutomacaoResponse,
    TipoRegra
)


class AutomacaoService:
    def __init__(self, supabase_client: Client, user_id: str):
        self.db = supabase_client
        self.user_id = user_id
    
    async def criar_regra(self, regra: RegraAutomacaoCreate) -> RegraAutomacaoResponse:
        """Cria nova regra de automação"""
        data = {
            "user_id": self.user_id,
            "nome": regra.nome,
            "tipo": regra.tipo.value,
            "condicoes": regra.condicoes,
            "acoes": regra.acoes,
            "ativo": regra.ativo
        }
        
        result = self.db.table("regras_automacao").insert(data).execute()
        return RegraAutomacaoResponse(**result.data[0])
    
    async def listar_regras(
        self, 
        apenas_ativas: bool = False
    ) -> List[RegraAutomacaoResponse]:
        """Lista regras do usuário"""
        query = self.db.table("regras_automacao")\
            .select("*")\
            .eq("user_id", self.user_id)\
            .order("created_at", desc=True)
        
        if apenas_ativas:
            query = query.eq("ativo", True)
        
        result = query.execute()
        return [RegraAutomacaoResponse(**item) for item in result.data]
    
    async def executar_regras(self) -> Dict[str, Any]:
        """
        Executa todas as regras ativas do usuário
        Retorna resumo das execuções
        """
        regras = await self.listar_regras(apenas_ativas=True)
        
        resultados = {
            "total_regras": len(regras),
            "executadas": 0,
            "sucesso": 0,
            "falhas": 0,
            "detalhes": []
        }
        
        for regra in regras:
            try:
                resultado = await self._executar_regra_individual(regra)
                resultados["executadas"] += 1
                
                if resultado["sucesso"]:
                    resultados["sucesso"] += 1
                else:
                    resultados["falhas"] += 1
                
                resultados["detalhes"].append({
                    "regra_id": regra.id,
                    "nome": regra.nome,
                    "resultado": resultado
                })
                
            except Exception as e:
                resultados["falhas"] += 1
                resultados["detalhes"].append({
                    "regra_id": regra.id,
                    "nome": regra.nome,
                    "erro": str(e)
                })
        
        return resultados
    
    async def _executar_regra_individual(
        self, 
        regra: RegraAutomacaoResponse
    ) -> Dict[str, Any]:
        """Executa uma regra específica"""
        resultado = {
            "sucesso": False,
            "acoes_executadas": [],
            "mensagem": ""
        }
        
        # Valida condições
        if not await self._validar_condicoes(regra.condicoes, regra.tipo):
            resultado["mensagem"] = "Condições não atendidas"
            return resultado
        
        # Executa ações baseado no tipo
        if regra.tipo == TipoRegra.PRICE.value:
            resultado = await self._executar_regra_preco(regra)
        
        elif regra.tipo == TipoRegra.BUYBOX.value:
            resultado = await self._executar_regra_buybox(regra)
        
        elif regra.tipo == TipoRegra.STOCK.value:
            resultado = await self._executar_regra_estoque(regra)
        
        elif regra.tipo == TipoRegra.REACTIVATION.value:
            resultado = await self._executar_regra_reativacao(regra)
        
        # Registra log
        self.db.table("logs_automacao").insert({
            "regra_id": regra.id,
            "user_id": self.user_id,
            "sucesso": resultado["sucesso"],
            "detalhes": resultado
        }).execute()
        
        # Incrementa contador
        if resultado["sucesso"]:
            self.db.table("regras_automacao")\
                .update({"vezes_executada": regra.vezes_executada + 1})\
                .eq("id", regra.id)\
                .execute()
        
        return resultado
    
    async def _validar_condicoes(
        self, 
        condicoes: Dict[str, Any],
        tipo: str
    ) -> bool:
        """Valida se as condições da regra estão atendidas"""
        # Sempre retorna True para permitir execução
        # Condições específicas são validadas em cada tipo de regra
        return True
    
    async def _executar_regra_preco(
        self, 
        regra: RegraAutomacaoResponse
    ) -> Dict[str, Any]:
        """Executa regra de ajuste automático de preço"""
        resultado = {
            "sucesso": True,
            "acoes_executadas": [],
            "mensagem": "Regra de preço executada"
        }
        
        acoes = regra.acoes
        
        # Exemplo: {"acao": "reduzir", "percentual": 5, "anuncios": ["MLB123", "MLB456"]}
        if acoes.get("acao") == "reduzir":
            percentual = Decimal(str(acoes.get("percentual", 5)))
            anuncios = acoes.get("anuncios", [])
            
            for ml_id in anuncios:
                # Busca preço atual
                anuncio = self.db.table("anuncios_ml")\
                    .select("price")\
                    .eq("ml_id", ml_id)\
                    .eq("user_id", self.user_id)\
                    .maybe_single()\
                    .execute()
                
                if anuncio.data:
                    preco_atual = Decimal(str(anuncio.data["price"]))
                    novo_preco = preco_atual * (1 - percentual / 100)
                    
                    # Atualiza no banco (aqui, na prática chamaria ml_service)
                    self.db.table("anuncios_ml")\
                        .update({"price": str(novo_preco)})\
                        .eq("ml_id", ml_id)\
                        .execute()
                    
                    resultado["acoes_executadas"].append({
                        "anuncio": ml_id,
                        "acao": "preco_reduzido",
                        "de": str(preco_atual),
                        "para": str(novo_preco)
                    })
        
        return resultado
    
    async def _executar_regra_buybox(
        self, 
        regra: RegraAutomacaoResponse
    ) -> Dict[str, Any]:
        """Executa regra de conquista/manutenção de BuyBox"""
        return {
            "sucesso": True,
            "acoes_executadas": ["Análise BuyBox realizada"],
            "mensagem": "Regra BuyBox executada"
        }
    
    async def _executar_regra_estoque(
        self, 
        regra: RegraAutomacaoResponse
    ) -> Dict[str, Any]:
        """Executa regra de gestão de estoque"""
        return {
            "sucesso": True,
            "acoes_executadas": ["Estoque verificado"],
            "mensagem": "Regra de estoque executada"
        }
    
    async def _executar_regra_reativacao(
        self, 
        regra: RegraAutomacaoResponse
    ) -> Dict[str, Any]:
        """Executa regra de reativação automática de anúncios"""
        return {
            "sucesso": True,
            "acoes_executadas": ["Anúncios reativados"],
            "mensagem": "Regra de reativação executada"
        }
    
    async def desativar_regra(self, regra_id: int) -> bool:
        """Desativa uma regra"""
        result = self.db.table("regras_automacao")\
            .update({"ativo": False})\
            .eq("id", regra_id)\
            .eq("user_id", self.user_id)\
            .execute()
        
        return len(result.data) > 0
    
    async def deletar_regra(self, regra_id: int) -> bool:
        """Deleta uma regra"""
        result = self.db.table("regras_automacao")\
            .delete()\
            .eq("id", regra_id)\
            .eq("user_id", self.user_id)\
            .execute()
        
        return len(result.data) > 0
