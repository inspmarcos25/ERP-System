import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Float, Enum as SAEnum, Date, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class FuncionarioStatus(str, enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    FERIAS = "ferias"
    LICENCA = "licenca"
    DEMITIDO = "demitido"


class Cargo(Base):
    __tablename__ = "cargos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(150), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)
    salario_base = Column(Float, default=0.0)
    departamento = Column(String(100), nullable=True)
    nivel = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    funcionarios = relationship("Funcionario", back_populates="cargo")


class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(200), nullable=False, index=True)
    cpf = Column(String(14), unique=True, nullable=True)
    rg = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    cargo_id = Column(String, ForeignKey("cargos.id"), nullable=True)
    departamento = Column(String(100), nullable=True)
    status = Column(SAEnum(FuncionarioStatus), default=FuncionarioStatus.ATIVO)
    data_admissao = Column(Date, nullable=True)
    data_demissao = Column(Date, nullable=True)
    salario = Column(Float, default=0.0)
    banco = Column(String(100), nullable=True)
    agencia = Column(String(10), nullable=True)
    conta = Column(String(20), nullable=True)
    endereco = Column(String(300), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    observacoes = Column(Text, nullable=True)
    foto_url = Column(String(500), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    cargo = relationship("Cargo", back_populates="funcionarios")
    user = relationship("User", foreign_keys=[user_id])
