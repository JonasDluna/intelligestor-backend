"""
Router - IA Produtos (Legacy)
Geração de conteúdo para produtos com IA
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.ia_service import chamar_ia
from app.services.ml_prompts import prompt_descricao_produto, prompt_titulo_produto

router = APIRouter(prefix="/ia/products", tags=["IA - Produtos"])


# Models (legacy)
class DescricaoProdutoRequest(BaseModel):
    titulo: str
    categoria: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    caracteristicas: Optional[str] = None
    beneficios: Optional[str] = None
    publico_alvo: Optional[str] = None
    diferenciais: Optional[str] = None
    garantia: Optional[str] = None


class TituloProdutoRequest(BaseModel):
    nome: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    categoria: Optional[str] = None
    caracteristicas: Optional[str] = None


@router.post("/descricao")
async def gerar_descricao(payload: DescricaoProdutoRequest):
    """
    Gera descrição profissional para produto usando IA
    
    A IA cria descrições:
    - Persuasivas e otimizadas para conversão
    - Com SEO para Mercado Livre
    - Destacando benefícios e diferenciais
    - Formatadas e prontas para uso
    """
    prompt = prompt_descricao_produto(payload.dict())
    content = chamar_ia([
        {"role": "system", "content": "Você é um copywriter profissional de anúncios para Mercado Livre."},
        {"role": "user", "content": prompt},
    ])
    return {"descricao": content}


@router.post("/titulos")
async def gerar_titulos(payload: TituloProdutoRequest):
    """
    Gera múltiplas opções de títulos otimizados com IA
    
    A IA cria títulos:
    - Dentro do limite de 60 caracteres
    - Com palavras-chave relevantes
    - Otimizados para busca no ML
    - Atrativos e com alto CTR
    """
    prompt = prompt_titulo_produto(payload.dict())
    content = chamar_ia([
        {"role": "system", "content": "Você é especialista em títulos com alto CTR no Mercado Livre."},
        {"role": "user", "content": prompt},
    ])
    return {"titulos": content}
