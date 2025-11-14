from fastapi import APIRouter
from app.models.schemas import BuyboxRequest
from app.services.ia_service import chamar_ia
from app.services.ml_prompts import prompt_diagnostico_buybox

router = APIRouter()


@router.post("/diagnostico")
async def diagnostico_buybox(payload: BuyboxRequest):
    prompt = prompt_diagnostico_buybox(payload.dict())
    content = chamar_ia([
        {"role": "system", "content": "Você é um consultor sênior de Mercado Livre, especialista em BuyBox."},
        {"role": "user", "content": prompt},
    ])
    return {"diagnostico": content}
