from fastapi import APIRouter
from app.models.schemas import DescricaoProdutoRequest, TituloProdutoRequest
from app.services.ia_service import chamar_ia
from app.services.ml_prompts import prompt_descricao_produto, prompt_titulo_produto

router = APIRouter()


@router.post("/descricao")
async def gerar_descricao(payload: DescricaoProdutoRequest):
    prompt = prompt_descricao_produto(payload.dict())
    content = chamar_ia([
        {"role": "system", "content": "Você é um copywriter profissional de anúncios para Mercado Livre."},
        {"role": "user", "content": prompt},
    ])
    return {"descricao": content}


@router.post("/titulos")
async def gerar_titulos(payload: TituloProdutoRequest):
    prompt = prompt_titulo_produto(payload.dict())
    content = chamar_ia([
        {"role": "system", "content": "Você é especialista em títulos com alto CTR no Mercado Livre."},
        {"role": "user", "content": prompt},
    ])
    return {"titulos": content}
