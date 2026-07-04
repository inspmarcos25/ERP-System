from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.estoque import CategoriaEstoque


class ProdutoBase(BaseModel):
    codigo: str
    nome: str
    descricao: Optional[str] = None
    categoria_id: Optional[str] = None
    unidade: str = "UN"
    preco_custo: float = 0.0
    preco_venda: float = 0.0
    estoque_minimo: float = 0.0
    estoque_maximo: float = 0.0
    localizacao: Optional[str] = None
    peso: Optional[float] = None
    ativo: bool = True


class ProdutoCreate(ProdutoBase):
    estoque_inicial: float = 0.0


class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    preco_custo: Optional[float] = None
    preco_venda: Optional[float] = None
    estoque_minimo: Optional[float] = None
    ativo: Optional[bool] = None


class ProdutoResponse(ProdutoBase):
    id: str
    estoque_atual: float
    margem_lucro: float
    created_at: datetime

    class Config:
        from_attributes = True


class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaResponse(CategoriaBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
