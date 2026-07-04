import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Enum as SAEnum, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class ProjetoStatus(str, enum.Enum):
    PLANEJAMENTO = "planejamento"
    EM_ANDAMENTO = "em_andamento"
    PAUSADO = "pausado"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"


class TarefaStatus(str, enum.Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    EM_ANDAMENTO = "em_andamento"
    REVISAO = "revisao"
    CONCLUIDO = "concluido"


class TarefaPrioridade(str, enum.Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"


class Projeto(Base):
    __tablename__ = "projetos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=True)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=True)
    responsavel_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(SAEnum(ProjetoStatus), default=ProjetoStatus.PLANEJAMENTO)
    data_inicio = Column(DateTime, nullable=True)
    data_fim_previsto = Column(DateTime, nullable=True)
    data_fim_real = Column(DateTime, nullable=True)
    orcamento = Column(Float, default=0.0)
    custo_atual = Column(Float, default=0.0)
    progresso = Column(Integer, default=0)  # 0-100%
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    responsavel = relationship("User", foreign_keys=[responsavel_id])
    tarefas = relationship("Tarefa", back_populates="projeto", cascade="all, delete-orphan")


class Tarefa(Base):
    __tablename__ = "tarefas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    projeto_id = Column(String, ForeignKey("projetos.id"), nullable=False)
    titulo = Column(String(300), nullable=False)
    descricao = Column(Text, nullable=True)
    responsavel_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(SAEnum(TarefaStatus), default=TarefaStatus.TODO)
    prioridade = Column(SAEnum(TarefaPrioridade), default=TarefaPrioridade.MEDIA)
    data_inicio = Column(DateTime, nullable=True)
    data_fim_previsto = Column(DateTime, nullable=True)
    horas_estimadas = Column(Float, nullable=True)
    horas_realizadas = Column(Float, default=0.0)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    projeto = relationship("Projeto", back_populates="tarefas")
    responsavel = relationship("User", foreign_keys=[responsavel_id])
