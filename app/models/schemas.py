from pydantic import BaseModel
from typing import Optional, Any


class BuyboxRequest(BaseModel):
    sku: Optional[str] = None
    titulo: Optional[str] = None
    categoria: Optional[str] = None
    custo: Optional[float] = None
    preco_atual: Optional[float] = None
    estoque: Optional[int] = None
    tem_buybox: Optional[bool] = None
    preco_campeao: Optional[float] = None
    diferenca_preco_percent: Optional[float] = None
    taxa_conversao: Optional[float] = None
    historico_buybox: Optional[Any] = None
    concorrentes: Optional[Any] = None


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
