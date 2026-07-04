from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.crm import ClienteStatus, LeadStatus


# ---- Cliente ----
class ClienteBase(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    celular: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    tipo: str = "PJ"
    status: ClienteStatus = ClienteStatus.ATIVO
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    limite_credito: float = 0.0
    observacoes: Optional[str] = None
    responsavel_id: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    status: Optional[ClienteStatus] = None
    limite_credito: Optional[float] = None
    observacoes: Optional[str] = None


class ClienteResponse(ClienteBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Lead ----
class LeadBase(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    empresa: Optional[str] = None
    status: LeadStatus = LeadStatus.NOVO
    valor_estimado: float = 0.0
    probabilidade: int = 0
    origem: Optional[str] = None
    responsavel_id: Optional[str] = None
    cliente_id: Optional[str] = None
    observacoes: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    nome: Optional[str] = None
    status: Optional[LeadStatus] = None
    valor_estimado: Optional[float] = None
    probabilidade: Optional[int] = None
    responsavel_id: Optional[str] = None


class LeadResponse(LeadBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
