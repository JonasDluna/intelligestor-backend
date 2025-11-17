"""
Router - Autenticação de Usuários
Sistema de login/registro com JWT
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from app.config.settings import settings, get_supabase_client

router = APIRouter(prefix="/auth", tags=["Autenticação"])
security = HTTPBearer()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nome: str
    empresa: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def hash_password(password: str) -> str:
    """Hash de senha usando bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verifica senha contra hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(user_id: str, email: str) -> str:
    """Cria JWT token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decodifica JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency para obter usuário atual do token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    supabase = get_supabase_client()
    result = supabase.table("usuarios").select("*").eq("id", payload["user_id"]).maybe_single().execute()
    
    if not result.data:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    return result.data


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister):
    """
    Registra novo usuário no sistema
    
    **Fluxo:**
    1. Valida email único
    2. Cria hash da senha
    3. Insere no banco
    4. Retorna JWT token
    """
    supabase = get_supabase_client()
    
    # Verifica se email já existe
    try:
        existing = supabase.table("usuarios").select("id").eq("email", data.email).maybe_single().execute()
        if existing and existing.data:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
    except Exception as e:
        # Se a tabela não existe, vamos tentar criar o usuário mesmo assim
        print(f"Erro ao verificar email existente: {e}")
    
    # Cria usuário
    hashed_password = hash_password(data.password)
    user_data = {
        "email": data.email,
        "password_hash": hashed_password,
        "nome_completo": data.nome,
        "empresa": data.empresa,
        "status": "active"
    }
    
    try:
        result = supabase.table("usuarios").insert(user_data).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao criar usuário. Verifique se a tabela 'usuarios' existe no Supabase: {str(e)}"
        )
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Erro ao criar usuário")
    
    user = result.data[0]
    token = create_access_token(user["id"], user["email"])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "nome": user.get("nome_completo"),
            "empresa": user.get("empresa")
        }
    }


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """
    Login de usuário
    
    **Retorna:**
    - JWT token válido por 7 dias
    - Dados do usuário
    """
    supabase = get_supabase_client()
    
    # Busca usuário
    result = supabase.table("usuarios").select("*").eq("email", data.email).maybe_single().execute()
    
    if not result.data:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    user = result.data
    
    # Verifica senha
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Verifica se está ativo
    if user.get("status") == "suspended":
        raise HTTPException(status_code=403, detail="Usuário desativado")
    
    # Gera token
    token = create_access_token(user["id"], user["email"])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "nome": user.get("nome_completo"),
            "empresa": user.get("empresa")
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retorna dados do usuário logado
    """
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "nome": current_user["nome"],
        "empresa": current_user.get("empresa"),
        "created_at": current_user.get("created_at")
    }


@router.post("/refresh")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """
    Renova token JWT
    """
    token = create_access_token(current_user["id"], current_user["email"])
    return {
        "access_token": token,
        "token_type": "bearer"
    }
