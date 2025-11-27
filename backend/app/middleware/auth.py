"""
Middleware de Autenticação
Funções auxiliares para proteção de rotas
"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.config.settings import settings, get_supabase_client

security = HTTPBearer()


def decode_token(token: str) -> dict:
    """Decodifica JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency para obter usuário atual do token JWT
    Use como: current_user = Depends(get_current_user)
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    supabase = get_supabase_client()
    result = supabase.table("usuarios").select("*").eq("id", payload["user_id"]).maybe_single().execute()
    
    if not result or not result.data:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    if result.data.get("status") == "suspended":
        raise HTTPException(status_code=403, detail="Usuário desativado")
    
    return result.data


async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> str:
    """
    Dependency simplificada que retorna apenas o user_id
    Use como: user_id: str = Depends(get_current_user_id)
    """
    return current_user["id"]


# Dependency opcional - permite acesso sem autenticação
async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))
):
    """
    Dependency que retorna usuário se autenticado, None se não
    Útil para endpoints que funcionam com ou sem autenticação
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
