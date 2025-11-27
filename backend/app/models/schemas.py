"""
Pydantic Models - IntelliGestor V2.0
Organização por domínio: Auth, Produtos, Estoque, ML, IA, Automação
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum


# =====================================================
# ENUMS
# =====================================================

class PlanoUsuario(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class StatusUsuario(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"

class StatusProduto(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"

class TipoProduto(str, Enum):
    SIMPLE = "simple"
    VARIABLE = "variable"

class TipoMovimentacao(str, Enum):
    ENTRADA = "entrada"
    SAIDA = "saida"
    AJUSTE = "ajuste"
    RESERVA = "reserva"
    LIBERACAO = "liberacao"

class StatusAnuncio(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    UNDER_REVIEW = "under_review"

class TipoRegra(str, Enum):
    PRICE = "price"
    BUYBOX = "buybox"
    STOCK = "stock"
    REACTIVATION = "reactivation"


# =====================================================
# 1. USUÁRIOS E AUTENTICAÇÃO
# =====================================================

class UsuarioBase(BaseModel):
    email: EmailStr
    nome_completo: Optional[str] = None
    empresa: Optional[str] = None
    telefone: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nome_completo: Optional[str] = None
    empresa: Optional[str] = None
    telefone: Optional[str] = None
    avatar_url: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: str
    plano: PlanoUsuario
    status: StatusUsuario
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TokenMLResponse(BaseModel):
    ml_user_id: int
    nickname: Optional[str] = None
    email: Optional[str] = None
    expires_at: datetime
    
    class Config:
        from_attributes = True


# =====================================================
# 2. PRODUTOS
# =====================================================

class ProdutoBase(BaseModel):
    sku_interno: str = Field(..., min_length=1, max_length=100)
    titulo: str = Field(..., min_length=1, max_length=500)
    descricao: Optional[str] = None
    categoria_ml: Optional[str] = None
    marca: Optional[str] = None

class ProdutoCreate(ProdutoBase):
    custo: Optional[Decimal] = None
    preco_sugerido: Optional[Decimal] = None
    margem_minima: Decimal = Field(20.00, ge=0)

class ProdutoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    categoria_ml: Optional[str] = None
    marca: Optional[str] = None
    custo: Optional[Decimal] = None
    preco_sugerido: Optional[Decimal] = None
    margem_minima: Optional[Decimal] = None
    status: Optional[StatusProduto] = None

class ProdutoResponse(ProdutoBase):
    id: int
    user_id: str
    status: StatusProduto
    created_at: datetime
    
    class Config:
        from_attributes = True


# =====================================================
# 3. ANÚNCIOS ML
# =====================================================

class AnuncioMLBase(BaseModel):
    title: str
    price: Decimal
    available_quantity: int

class AnuncioMLCreate(AnuncioMLBase):
    ml_id: str
    produto_id: Optional[int] = None

class AnuncioMLResponse(AnuncioMLBase):
    id: int
    ml_id: str
    status: StatusAnuncio
    permalink: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# =====================================================
# 4. BUYBOX E IA
# =====================================================

class BuyBoxAnalysisRequest(BaseModel):
    anuncio_id: int
    incluir_historico: bool = True

class BuyBoxAnalysisResponse(BaseModel):
    anuncio_id: int
    nosso_preco: Decimal
    preco_campeao: Decimal
    diferenca_percent: Decimal
    estamos_no_buybox: bool
    recomendacao: str
    acoes_sugeridas: List[str]

class PriceOptimizationRequest(BaseModel):
    anuncio_id: int
    margem_minima: Optional[Decimal] = None

class PriceOptimizationResponse(BaseModel):
    preco_atual: Decimal
    preco_recomendado: Decimal
    motivo: str
    impacto_estimado: str


# =====================================================
# 5. ESTOQUE
# =====================================================

class EstoqueResponse(BaseModel):
    id: int
    estoque_atual: int
    estoque_disponivel: int
    estoque_minimo: int
    
    class Config:
        from_attributes = True


# =====================================================
# 6. AUTOMAÇÃO
# =====================================================

class RegraAutomacaoBase(BaseModel):
    nome: str
    tipo: TipoRegra

class RegraAutomacaoCreate(RegraAutomacaoBase):
    condicoes: Dict[str, Any]
    acoes: Dict[str, Any]
    ativo: bool = True

class RegraAutomacaoResponse(RegraAutomacaoBase):
    id: int
    ativo: bool
    vezes_executada: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# =====================================================
# 7. DASHBOARD
# =====================================================

class DashboardResponse(BaseModel):
    total_anuncios: int
    anuncios_ativos: int
    produtos_sem_estoque: int
    anuncios_sem_buybox: int
    alertas: List[str]
