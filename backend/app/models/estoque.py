import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Enum as SAEnum, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class CategoriaEstoque(Base):
    __tablename__ = "categorias_estoque"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    produtos = relationship("Produto", back_populates="categoria")


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nome = Column(String(200), nullable=False, index=True)
    descricao = Column(Text, nullable=True)
    categoria_id = Column(String, ForeignKey("categorias_estoque.id"), nullable=True)
    unidade = Column(String(10), default="UN")
    preco_custo = Column(Float, default=0.0)
    preco_venda = Column(Float, default=0.0)
    margem_lucro = Column(Float, default=0.0)
    estoque_atual = Column(Float, default=0.0)
    estoque_minimo = Column(Float, default=0.0)
    estoque_maximo = Column(Float, default=0.0)
    localizacao = Column(String(100), nullable=True)
    peso = Column(Float, nullable=True)
    ativo = Column(Boolean, default=True)
    imagem_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    categoria = relationship("CategoriaEstoque", back_populates="produtos")
    itens_venda = relationship("ItemVenda", back_populates="produto")
    movimentacoes = relationship("MovimentacaoEstoque", back_populates="produto")


class MovimentacaoEstoque(Base):
    __tablename__ = "movimentacoes_estoque"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # entrada, saida, ajuste
    quantidade = Column(Float, nullable=False)
    quantidade_anterior = Column(Float, nullable=False)
    quantidade_posterior = Column(Float, nullable=False)
    motivo = Column(String(200), nullable=True)
    referencia_id = Column(String, nullable=True)
    referencia_tipo = Column(String(50), nullable=True)
    usuario_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    produto = relationship("Produto", back_populates="movimentacoes")
    usuario = relationship("User", foreign_keys=[usuario_id])
