"""
Router para autenticação OAuth2 com Mercado Livre
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse, HTMLResponse
import httpx
from typing import Optional
from datetime import datetime, timedelta

from app.config.settings import settings, get_supabase_client

router = APIRouter(prefix="/auth/ml", tags=["Mercado Livre Auth"])


@router.get("/login")
async def mercadolivre_login(user_id: str = Query("default", description="ID do usuário")):
    """
    Inicia o fluxo OAuth2 do Mercado Livre
    Redireciona o usuário para a página de autorização do ML
    
    **Fluxo:**
    1. Usuário clica em "Conectar ML"
    2. É redirecionado para autorização no ML
    3. Após autorizar, ML redireciona para /callback
    """
    if not settings.ML_CLIENT_ID or not settings.ML_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="Credenciais ML não configuradas. Configure ML_CLIENT_ID e ML_REDIRECT_URI."
        )
    
    auth_url = (
        f"{settings.ML_AUTH_URL}"
        f"?response_type=code"
        f"&client_id={settings.ML_CLIENT_ID}"
        f"&redirect_uri={settings.ML_REDIRECT_URI}"
        f"&state={user_id}"  # Passar user_id via state
    )
    
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def mercadolivre_callback(
    code: str = Query(..., description="Código de autorização do ML"),
    state: str = Query("default", description="User ID passado no state"),
    error: Optional[str] = Query(None, description="Erro retornado pelo ML")
):
    """
    Callback do OAuth2 do Mercado Livre
    Troca o código de autorização por access_token e salva no Supabase
    """
    if error:
        return HTMLResponse(content=f"""
            <html>
                <body style="font-family: Arial; padding: 50px; text-align: center;">
                    <h1 style="color: #dc3545;">❌ Erro na Autenticação</h1>
                    <p>{error}</p>
                    <a href="/" style="color: #007bff;">Voltar para o início</a>
                </body>
            </html>
        """, status_code=400)
    
    if not settings.ML_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="ML_CLIENT_SECRET não configurado")
    
    # Trocar código por token
    token_data = {
        "grant_type": "authorization_code",
        "client_id": settings.ML_CLIENT_ID,
        "client_secret": settings.ML_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.ML_REDIRECT_URI
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
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
        ml_user_id = token_response.get("user_id")
        
        # Buscar informações do usuário no ML
        user_info = await get_ml_user_info(access_token)
        
        # Calcular data de expiração
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        # Salvar no Supabase
        supabase = get_supabase_client()
        supabase.table("tokens_ml").upsert({
            "user_id": state,  # Nosso user_id interno
            "ml_user_id": ml_user_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at.isoformat(),
            "nickname": user_info.get("nickname"),
            "email": user_info.get("email"),
            "site_id": user_info.get("site_id", "MLB")
        }, on_conflict="user_id").execute()
        
        return HTMLResponse(content=f"""
            <html>
                <head>
                    <style>
                        body {{ font-family: Arial; padding: 50px; text-align: center; }}
                        .success {{ color: #28a745; }}
                        .info {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 500px; }}
                    </style>
                </head>
                <body>
                    <h1 class="success">✅ Autenticação Realizada!</h1>
                    <div class="info">
                        <p><strong>Usuário ML:</strong> {user_info.get('nickname', 'N/A')}</p>
                        <p><strong>ML User ID:</strong> {ml_user_id}</p>
                        <p><strong>Expira em:</strong> {expires_in // 3600} horas</p>
                    </div>
                    <p><a href="/docs" style="color: #007bff;">Ver Documentação da API</a></p>
                </body>
            </html>
        """)
        
    except httpx.HTTPError as e:
        return HTMLResponse(content=f"""
            <html>
                <body style="font-family: Arial; padding: 50px; text-align: center;">
                    <h1 style="color: #dc3545;">❌ Erro ao Obter Token</h1>
                    <p>{str(e)}</p>
                    <a href="/auth/ml/login" style="color: #007bff;">Tentar novamente</a>
                </body>
            </html>
        """, status_code=500)


@router.post("/refresh")
async def refresh_mercadolivre_token(user_id: str):
    """
    Renova o access_token usando o refresh_token
    
    Útil para:
    - Renovar token expirado automaticamente
    - Manter usuário autenticado por mais tempo
    - Evitar re-autenticação manual
    """
    supabase = get_supabase_client()
    
    # Buscar refresh_token do usuário
    result = supabase.table("tokens_ml")\
        .select("refresh_token, ml_user_id")\
        .eq("user_id", user_id)\
        .maybe_single()\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Token não encontrado. Faça login novamente.")
    
    refresh_token = result.data.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token não disponível")
    
    token_data = {
        "grant_type": "refresh_token",
        "client_id": settings.ML_CLIENT_ID,
        "client_secret": settings.ML_CLIENT_SECRET,
        "refresh_token": refresh_token
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.ML_TOKEN_URL,
                json=token_data,
                headers={"Accept": "application/json", "Content-Type": "application/json"}
            )
            response.raise_for_status()
            token_response = response.json()
        
        # Atualizar no Supabase
        expires_in = token_response.get("expires_in", 21600)
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        supabase.table("tokens_ml").update({
            "access_token": token_response.get("access_token"),
            "refresh_token": token_response.get("refresh_token"),
            "expires_at": expires_at.isoformat()
        }).eq("user_id", user_id).execute()
        
        return {
            "status": "success",
            "message": "Token renovado com sucesso",
            "expires_in": expires_in
        }
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao renovar token: {str(e)}")


async def get_ml_user_info(access_token: str) -> dict:
    """
    Busca informações do usuário no Mercado Livre
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.ML_API_URL}/users/me",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        return {}


@router.get("/status/{user_id}")
async def check_auth_status(user_id: str):
    """
    Verifica o status da autenticação do usuário
    
    Retorna:
    - authenticated: bool - Se está autenticado
    - needs_refresh: bool - Se precisa renovar token
    - expires_at: datetime - Quando expira
    """
    supabase = get_supabase_client()
    
    result = supabase.table("tokens_ml")\
        .select("ml_user_id, nickname, expires_at, access_token")\
        .eq("user_id", user_id)\
        .maybe_single()\
        .execute()
    
    if not result.data:
        return {"authenticated": False, "message": "Usuário não autenticado"}
    
    # Verificar se o token está expirado
    expires_at_str = result.data.get("expires_at")
    if expires_at_str:
        expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        if expires_at < datetime.utcnow().replace(tzinfo=expires_at.tzinfo):
            return {
                "authenticated": False, 
                "message": "Token expirado", 
                "needs_refresh": True
            }
    
    return {
        "authenticated": True,
        "ml_user_id": result.data.get("ml_user_id"),
        "nickname": result.data.get("nickname"),
        "expires_at": expires_at_str
    }


@router.delete("/disconnect/{user_id}")
async def disconnect_mercadolivre(user_id: str):
    """
    Desconecta conta do Mercado Livre
    Remove tokens do banco de dados
    """
    supabase = get_supabase_client()
    
    result = supabase.table("tokens_ml")\
        .delete()\
        .eq("user_id", user_id)\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "status": "success",
        "message": "Desconectado do Mercado Livre com sucesso"
    }
