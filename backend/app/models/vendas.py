import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Enum as SAEnum, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class PedidoStatus(str, enum.Enum):
    RASCUNHO = "rascunho"
    PENDENTE = "pendente"
    APROVADO = "aprovado"
    EM_PRODUCAO = "em_producao"
    ENVIADO = "enviado"
    ENTREGUE = "entregue"
    CANCELADO = "cancelado"


class PedidoVenda(Base):
    __tablename__ = "pedidos_venda"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    numero = Column(String(20), unique=True, nullable=False, index=True)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=False)
    vendedor_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(SAEnum(PedidoStatus), default=PedidoStatus.PENDENTE)
    data_pedido = Column(DateTime, default=datetime.utcnow)
    data_previsao_entrega = Column(DateTime, nullable=True)
    data_entrega = Column(DateTime, nullable=True)
    subtotal = Column(Float, default=0.0)
    desconto = Column(Float, default=0.0)
    desconto_percentual = Column(Float, default=0.0)
    impostos = Column(Float, default=0.0)
    frete = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    forma_pagamento = Column(String(50), nullable=True)
    condicao_pagamento = Column(String(100), nullable=True)
    observacoes = Column(Text, nullable=True)
    endereco_entrega = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    cliente = relationship("Cliente", back_populates="pedidos")
    vendedor = relationship("User", foreign_keys=[vendedor_id])
    itens = relationship("ItemVenda", back_populates="pedido", cascade="all, delete-orphan")


class ItemVenda(Base):
    __tablename__ = "itens_venda"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pedido_id = Column(String, ForeignKey("pedidos_venda.id"), nullable=False)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Float, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    desconto = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    observacoes = Column(String(200), nullable=True)

    pedido = relationship("PedidoVenda", back_populates="itens")
    produto = relationship("Produto", back_populates="itens_venda")
