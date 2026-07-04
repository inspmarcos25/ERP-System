import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Enum as SAEnum, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class ClienteStatus(str, enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    PROSPECTO = "prospecto"
    BLOQUEADO = "bloqueado"


class LeadStatus(str, enum.Enum):
    NOVO = "novo"
    CONTATO = "contato"
    QUALIFICADO = "qualificado"
    PROPOSTA = "proposta"
    NEGOCIACAO = "negociacao"
    GANHO = "ganho"
    PERDIDO = "perdido"


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(200), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    telefone = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    cpf_cnpj = Column(String(20), nullable=True, unique=True)
    tipo = Column(String(10), default="PJ")  # PF ou PJ
    status = Column(SAEnum(ClienteStatus), default=ClienteStatus.ATIVO)
    endereco = Column(String(300), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    cep = Column(String(10), nullable=True)
    limite_credito = Column(Float, default=0.0)
    observacoes = Column(Text, nullable=True)
    responsavel_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    responsavel = relationship("User", foreign_keys=[responsavel_id])
    pedidos = relationship("PedidoVenda", back_populates="cliente")
    leads = relationship("Lead", back_populates="cliente")
    contas_receber = relationship("ContaReceber", back_populates="cliente")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(200), nullable=False)
    email = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    empresa = Column(String(200), nullable=True)
    status = Column(SAEnum(LeadStatus), default=LeadStatus.NOVO)
    valor_estimado = Column(Float, default=0.0)
    probabilidade = Column(Integer, default=0)  # 0-100%
    origem = Column(String(100), nullable=True)
    responsavel_id = Column(String, ForeignKey("users.id"), nullable=True)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=True)
    data_fechamento_previsto = Column(DateTime, nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    responsavel = relationship("User", foreign_keys=[responsavel_id])
    cliente = relationship("Cliente", back_populates="leads")
