"""
Endpoints SaaS para gerenciar integrações Mercado Livre por cliente.
Fluxo:
- CRUD de integrações (client_id/secret/redirect)
- Geração de auth URL por integração
- Callback salva tokens na própria integração
"""
from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import RedirectResponse
from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from urllib.parse import quote
import httpx
from postgrest.exceptions import APIError

from app.config.settings import settings, get_supabase_client


router = APIRouter(prefix="/integrations/ml", tags=["Integrações - Mercado Livre"])


def _table():
    return get_supabase_client().table("integrations_ml")


@router.get("")
async def list_integrations(user_id: str = Query(..., description="ID do cliente SaaS")):
    result = _table().select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return {"status": "success", "integrations": result.data or []}


@router.post("")
async def create_integration(payload: Dict[str, Any]):
    required = ["user_id", "client_id", "client_secret", "redirect_uri", "name"]
    missing = [f for f in required if not payload.get(f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Campos obrigatórios faltando: {', '.join(missing)}")
    if not str(payload.get("redirect_uri", "")).startswith("https://"):
        raise HTTPException(status_code=400, detail="O redirect_uri deve começar com https://")

    record = {
        "user_id": payload["user_id"],
        "name": payload.get("name") or "Mercado Livre",
        "client_id": payload["client_id"],
        "client_secret": payload["client_secret"],
        "redirect_uri": payload["redirect_uri"],
        "status": "disconnected",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    try:
        res = _table().insert(record).execute()
        return {"status": "success", "integration": res.data[0] if res.data else record}
    except APIError as e:
        # Expor detalhe de erro do PostgREST para diagnóstico em produção
        raise HTTPException(status_code=400, detail={
            "source": "supabase",
            "code": e.code,
            "message": e.message,
            "hint": e.hint,
            "details": e.details
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{integration_id}")
async def update_integration(integration_id: str, payload: Dict[str, Any]):
    if not payload:
        raise HTTPException(status_code=400, detail="Payload vazio")
    if "redirect_uri" in payload and payload["redirect_uri"] and not str(payload["redirect_uri"]).startswith("https://"):
        raise HTTPException(status_code=400, detail="O redirect_uri deve começar com https://")
    payload["updated_at"] = datetime.utcnow().isoformat()
    res = _table().update(payload).eq("id", integration_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    return {"status": "success", "integration": res.data[0]}


@router.delete("/{integration_id}")
async def delete_integration(integration_id: str):
    res = _table().delete().eq("id", integration_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    return {"status": "success", "deleted": True}


@router.get("/{integration_id}/auth-url")
async def get_auth_url(integration_id: str, user_id: str = Query(..., description="cliente SaaS")):
    res = _table().select("*").eq("id", integration_id).eq("user_id", user_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    integration = res.data

    auth_url = (
        f"{settings.ML_AUTH_URL}"
        f"?response_type=code"
        f"&client_id={integration['client_id']}"
        f"&redirect_uri={quote(integration['redirect_uri'], safe=':/')}"
        f"&state={integration_id}"
    )
    return {"status": "success", "auth_url": auth_url}


@router.get("/callback")
async def oauth_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    # Em caso de erro no provedor, redireciona ao frontend com querystring informando o erro
    if error:
        target = f"{settings.FRONTEND_SUCCESS_REDIRECT}?error={quote(str(error))}"
        return RedirectResponse(url=target, status_code=302)
    if not code or not state:
        target = f"{settings.FRONTEND_SUCCESS_REDIRECT}?error=codigo_ou_state_ausente"
        return RedirectResponse(url=target, status_code=302)

    # Carrega integração específica
    res = _table().select("*").eq("id", state).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    integration = res.data

    token_data = {
        "grant_type": "authorization_code",
        "client_id": integration["client_id"],
        "client_secret": integration["client_secret"],
        "code": code.strip(),
        "redirect_uri": integration["redirect_uri"].strip(),
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.ML_TOKEN_URL,
            data=token_data,
            headers={"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        token_response = response.json()

    access_token = token_response.get("access_token")
    refresh_token = token_response.get("refresh_token")
    expires_in = token_response.get("expires_in", 21600)
    ml_user_id = token_response.get("user_id")
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    update_payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "ml_user_id": ml_user_id,
        "expires_at": expires_at.isoformat(),
        "status": "connected",
        "updated_at": datetime.utcnow().isoformat(),
    }
    _table().update(update_payload).eq("id", state).execute()

    # Sucesso: redireciona para o frontend (experiência unificada)
    return RedirectResponse(url=settings.FRONTEND_SUCCESS_REDIRECT, status_code=302)


@router.post("/{integration_id}/disconnect")
class DisconnectRequest(BaseModel):
    user_id: Optional[str] = None


@router.post("/{integration_id}/disconnect")
async def disconnect(
    integration_id: str,
    user_id: Optional[str] = Query(None, description="ID do cliente (query opcional)"),
    body: Optional[DisconnectRequest] = Body(None),
):
    # Aceita user_id via query ou body para compatibilidade com o frontend
    if not user_id and body and body.user_id:
        user_id = body.user_id

    update_payload = {
        "access_token": None,
        "refresh_token": None,
        "ml_user_id": None,
        "expires_at": None,
        "status": "disconnected",
        "updated_at": datetime.utcnow().isoformat(),
    }

    query = _table().update(update_payload).eq("id", integration_id)
    if user_id:
        query = query.eq("user_id", user_id)
    res = query.execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    return {"status": "success", "integration": res.data[0]}


@router.get("/{integration_id}/status")
async def status(integration_id: str, user_id: str):
    res = _table().select("ml_user_id, expires_at, status, nickname").eq("id", integration_id).eq("user_id", user_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    data = res.data
    expires_at = data.get("expires_at")
    needs_refresh = False
    if expires_at:
        dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        needs_refresh = dt < datetime.utcnow().replace(tzinfo=dt.tzinfo)
    return {"status": data.get("status"), "needs_refresh": needs_refresh, "ml_user_id": data.get("ml_user_id"), "expires_at": expires_at}
