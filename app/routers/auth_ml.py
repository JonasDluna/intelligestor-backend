"""
Router para autenticação OAuth2 com Mercado Livre
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
import requests
from typing import Optional
from datetime import datetime, timedelta

from app.config.settings import settings
from app.services.supabase_service import SupabaseService

router = APIRouter(prefix="/auth/ml", tags=["Mercado Livre Auth"])


@router.get("/login")
async def mercadolivre_login():
    """
    Inicia o fluxo OAuth2 do Mercado Livre
    Redireciona o usuário para a página de autorização do ML
    """
    auth_url = (
        f"{settings.ML_AUTH_URL}"
        f"?response_type=code"
        f"&client_id={settings.ML_CLIENT_ID}"
        f"&redirect_uri={settings.ML_REDIRECT_URI}"
    )
    
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def mercadolivre_callback(
    code: str = Query(..., description="Código de autorização do ML"),
    error: Optional[str] = Query(None, description="Erro retornado pelo ML")
):
    """
    Callback do OAuth2 do Mercado Livre
    Troca o código de autorização por um access_token
    """
    if error:
        raise HTTPException(status_code=400, detail=f"Erro na autenticação: {error}")
    
    # Trocar código por token
    token_data = {
        "grant_type": "authorization_code",
        "client_id": settings.ML_CLIENT_ID,
        "client_secret": settings.ML_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.ML_REDIRECT_URI
    }
    
    try:
        response = requests.post(
            settings.ML_TOKEN_URL,
            json=token_data,
            headers={"Accept": "application/json", "Content-Type": "application/json"}
        )
        response.raise_for_status()
        token_response = response.json()
        
        # Extrair informações do token
        access_token = token_response.get("access_token")
        refresh_token = token_response.get("refresh_token")
        expires_in = token_response.get("expires_in", 21600)  # 6 horas padrão
        user_id = token_response.get("user_id")
        
        # Buscar informações do usuário no ML
        user_info = await get_ml_user_info(access_token)
        
        # Salvar no Supabase
        supabase = SupabaseService()
        await supabase.save_ml_token(
            user_id=user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            user_info=user_info
        )
        
        return {
            "status": "success",
            "message": "Autenticação realizada com sucesso",
            "user_id": user_id,
            "nickname": user_info.get("nickname"),
            "expires_in": expires_in
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter token: {str(e)}")


@router.post("/refresh")
async def refresh_mercadolivre_token(refresh_token: str):
    """
    Renova o access_token usando o refresh_token
    """
    token_data = {
        "grant_type": "refresh_token",
        "client_id": settings.ML_CLIENT_ID,
        "client_secret": settings.ML_CLIENT_SECRET,
        "refresh_token": refresh_token
    }
    
    try:
        response = requests.post(
            settings.ML_TOKEN_URL,
            json=token_data,
            headers={"Accept": "application/json", "Content-Type": "application/json"}
        )
        response.raise_for_status()
        token_response = response.json()
        
        # Atualizar no Supabase
        supabase = SupabaseService()
        await supabase.update_ml_token(
            access_token=token_response.get("access_token"),
            refresh_token=token_response.get("refresh_token"),
            expires_in=token_response.get("expires_in", 21600)
        )
        
        return {
            "status": "success",
            "message": "Token renovado com sucesso",
            "access_token": token_response.get("access_token"),
            "expires_in": token_response.get("expires_in")
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erro ao renovar token: {str(e)}")


async def get_ml_user_info(access_token: str) -> dict:
    """
    Busca informações do usuário no Mercado Livre
    """
    try:
        response = requests.get(
            f"{settings.ML_API_URL}/users/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return {}


@router.get("/status/{user_id}")
async def check_auth_status(user_id: int):
    """
    Verifica o status da autenticação do usuário
    """
    supabase = SupabaseService()
    token_info = await supabase.get_ml_token(user_id)
    
    if not token_info:
        return {"authenticated": False, "message": "Usuário não autenticado"}
    
    # Verificar se o token está expirado
    expires_at = token_info.get("expires_at")
    if expires_at and datetime.fromisoformat(expires_at) < datetime.utcnow():
        return {"authenticated": False, "message": "Token expirado", "needs_refresh": True}
    
    return {
        "authenticated": True,
        "user_id": user_id,
        "nickname": token_info.get("nickname"),
        "expires_at": expires_at
    }
