from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.models.vendas import PedidoStatus


class ItemVendaBase(BaseModel):
    produto_id: str
    quantidade: float
    preco_unitario: float
    desconto: float = 0.0
    observacoes: Optional[str] = None


class ItemVendaCreate(ItemVendaBase):
    pass


class ItemVendaResponse(ItemVendaBase):
    id: str
    total: float

    class Config:
        from_attributes = True


class PedidoVendaBase(BaseModel):
    cliente_id: str
    vendedor_id: Optional[str] = None
    status: PedidoStatus = PedidoStatus.PENDENTE
    data_previsao_entrega: Optional[datetime] = None
    desconto: float = 0.0
    desconto_percentual: float = 0.0
    impostos: float = 0.0
    frete: float = 0.0
    forma_pagamento: Optional[str] = None
    condicao_pagamento: Optional[str] = None
    observacoes: Optional[str] = None
    endereco_entrega: Optional[str] = None


class PedidoVendaCreate(PedidoVendaBase):
    itens: List[ItemVendaCreate]


class PedidoVendaUpdate(BaseModel):
    status: Optional[PedidoStatus] = None
    data_previsao_entrega: Optional[datetime] = None
    observacoes: Optional[str] = None


class PedidoVendaResponse(PedidoVendaBase):
    id: str
    numero: str
    subtotal: float
    total: float
    data_pedido: datetime
    itens: List[ItemVendaResponse] = []

    class Config:
        from_attributes = True
