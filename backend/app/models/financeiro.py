import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Float, Enum as SAEnum, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class ContaStatus(str, enum.Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    VENCIDO = "vencido"
    CANCELADO = "cancelado"
    PARCIAL = "parcial"


class ContaReceber(Base):
    __tablename__ = "contas_receber"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    descricao = Column(String(300), nullable=False)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=True)
    pedido_id = Column(String, ForeignKey("pedidos_venda.id"), nullable=True)
    valor = Column(Float, nullable=False)
    valor_pago = Column(Float, default=0.0)
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date, nullable=True)
    status = Column(SAEnum(ContaStatus), default=ContaStatus.PENDENTE)
    forma_pagamento = Column(String(50), nullable=True)
    numero_documento = Column(String(100), nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    cliente = relationship("Cliente", back_populates="contas_receber")


class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    descricao = Column(String(300), nullable=False)
    fornecedor_id = Column(String, nullable=True)
    categoria = Column(String(100), nullable=True)
    valor = Column(Float, nullable=False)
    valor_pago = Column(Float, default=0.0)
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date, nullable=True)
    status = Column(SAEnum(ContaStatus), default=ContaStatus.PENDENTE)
    forma_pagamento = Column(String(50), nullable=True)
    numero_documento = Column(String(100), nullable=True)
    recorrente = Column(Boolean, default=False)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
