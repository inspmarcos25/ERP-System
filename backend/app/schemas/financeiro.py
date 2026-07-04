from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.financeiro import ContaStatus


class ContaReceberBase(BaseModel):
    descricao: str
    cliente_id: Optional[str] = None
    pedido_id: Optional[str] = None
    valor: float
    data_vencimento: date
    forma_pagamento: Optional[str] = None
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None


class ContaReceberCreate(ContaReceberBase):
    pass


class ContaReceberUpdate(BaseModel):
    status: Optional[ContaStatus] = None
    valor_pago: Optional[float] = None
    data_pagamento: Optional[date] = None
    forma_pagamento: Optional[str] = None


class ContaReceberResponse(ContaReceberBase):
    id: str
    valor_pago: float
    status: ContaStatus
    data_pagamento: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ContaPagarBase(BaseModel):
    descricao: str
    fornecedor_id: Optional[str] = None
    categoria: Optional[str] = None
    valor: float
    data_vencimento: date
    forma_pagamento: Optional[str] = None
    numero_documento: Optional[str] = None
    recorrente: bool = False
    observacoes: Optional[str] = None


class ContaPagarCreate(ContaPagarBase):
    pass


class ContaPagarUpdate(BaseModel):
    status: Optional[ContaStatus] = None
    valor_pago: Optional[float] = None
    data_pagamento: Optional[date] = None


class ContaPagarResponse(ContaPagarBase):
    id: str
    valor_pago: float
    status: ContaStatus
    data_pagamento: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True
