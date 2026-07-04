from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.projetos import ProjetoStatus, TarefaStatus, TarefaPrioridade


class TarefaBase(BaseModel):
    projeto_id: str
    titulo: str
    descricao: Optional[str] = None
    responsavel_id: Optional[str] = None
    status: TarefaStatus = TarefaStatus.TODO
    prioridade: TarefaPrioridade = TarefaPrioridade.MEDIA
    data_fim_previsto: Optional[datetime] = None
    horas_estimadas: Optional[float] = None
    ordem: int = 0


class TarefaCreate(TarefaBase):
    pass


class TarefaUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[TarefaStatus] = None
    prioridade: Optional[TarefaPrioridade] = None
    responsavel_id: Optional[str] = None
    horas_realizadas: Optional[float] = None
    ordem: Optional[int] = None


class TarefaResponse(TarefaBase):
    id: str
    horas_realizadas: float
    created_at: datetime

    class Config:
        from_attributes = True


class ProjetoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cliente_id: Optional[str] = None
    responsavel_id: Optional[str] = None
    status: ProjetoStatus = ProjetoStatus.PLANEJAMENTO
    data_inicio: Optional[datetime] = None
    data_fim_previsto: Optional[datetime] = None
    orcamento: float = 0.0


class ProjetoCreate(ProjetoBase):
    pass


class ProjetoUpdate(BaseModel):
    nome: Optional[str] = None
    status: Optional[ProjetoStatus] = None
    progresso: Optional[int] = None
    custo_atual: Optional[float] = None
    data_fim_real: Optional[datetime] = None


class ProjetoResponse(ProjetoBase):
    id: str
    progresso: int
    custo_atual: float
    created_at: datetime
    tarefas: List[TarefaResponse] = []

    class Config:
        from_attributes = True
