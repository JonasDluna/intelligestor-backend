"""
Router - Automação
Endpoints para gestão de regras automáticas
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.schemas import (
    RegraAutomacaoCreate,
    RegraAutomacaoResponse
)
from app.services.automacao_service import AutomacaoService
from app.config.settings import get_supabase_client
from app.middleware.auth import get_current_user_id

router = APIRouter(prefix="/automacao", tags=["Automação"])


def get_automacao_service(user_id: str = Depends(get_current_user_id)) -> AutomacaoService:
    """Dependency injection do service com autenticação JWT"""
    supabase = get_supabase_client()
    return AutomacaoService(supabase, user_id)


@router.post("/regras", response_model=RegraAutomacaoResponse, status_code=201)
async def criar_regra(
    regra: RegraAutomacaoCreate,
    service: AutomacaoService = Depends(get_automacao_service)
):
    """
    Cria nova regra de automação
    
    **Tipos de regra:**
    - **price**: Ajuste automático de preços
    - **buybox**: Conquista/manutenção de BuyBox
    - **stock**: Gestão automática de estoque
    - **reactivation**: Reativação de anúncios
    
    **Exemplo - Regra de Preço:**
    ```json
    {
      "nome": "Reduzir 5% se perder BuyBox",
      "tipo": "price",
      "condicoes": {
        "perdeu_buybox": true,
        "diferenca_max": "10%"
      },
      "acoes": {
        "acao": "reduzir",
        "percentual": 5,
        "anuncios": ["MLB123", "MLB456"]
      },
      "ativo": true
    }
    ```
    """
    try:
        return await service.criar_regra(regra)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/regras", response_model=List[RegraAutomacaoResponse])
async def listar_regras(
    apenas_ativas: bool = False,
    service: AutomacaoService = Depends(get_automacao_service)
):
    """
    Lista regras de automação
    
    - **apenas_ativas**: Filtrar apenas regras ativas (default: False)
    """
    return await service.listar_regras(apenas_ativas)


@router.post("/executar")
async def executar_regras(
    service: AutomacaoService = Depends(get_automacao_service)
) -> Dict[str, Any]:
    """
    Executa todas as regras ativas do usuário
    
    Útil para:
    - Execução manual via dashboard
    - Chamadas via cron job
    - Testes de regras
    
    Retorna resumo das execuções com detalhes.
    """
    try:
        return await service.executar_regras()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/regras/{regra_id}/desativar")
async def desativar_regra(
    regra_id: int,
    service: AutomacaoService = Depends(get_automacao_service)
):
    """Desativa uma regra sem deletá-la"""
    sucesso = await service.desativar_regra(regra_id)
    
    if not sucesso:
        raise HTTPException(status_code=404, detail="Regra não encontrada")
    
    return {"success": True, "message": "Regra desativada"}


@router.delete("/regras/{regra_id}")
async def deletar_regra(
    regra_id: int,
    service: AutomacaoService = Depends(get_automacao_service)
):
    """Deleta uma regra permanentemente"""
    sucesso = await service.deletar_regra(regra_id)
    
    if not sucesso:
        raise HTTPException(status_code=404, detail="Regra não encontrada")
    
    return {"success": True, "message": "Regra deletada"}
