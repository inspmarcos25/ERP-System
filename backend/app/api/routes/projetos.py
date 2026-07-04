from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.projetos import Projeto, Tarefa
from app.schemas.projetos import ProjetoCreate, ProjetoUpdate, ProjetoResponse, TarefaCreate, TarefaUpdate, TarefaResponse
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/projetos", tags=["Projetos"])


@router.get("/", response_model=List[ProjetoResponse])
def list_projetos(
    skip: int = 0, limit: int = 50,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Projeto).filter(Projeto.deleted_at == None)
    if status:
        q = q.filter(Projeto.status == status)
    return q.order_by(Projeto.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{id}", response_model=ProjetoResponse)
def get_projeto(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = db.query(Projeto).filter(Projeto.id == id, Projeto.deleted_at == None).first()
    if not proj:
        raise HTTPException(404, "Projeto não encontrado")
    return proj


@router.post("/", response_model=ProjetoResponse, status_code=201)
def create_projeto(data: ProjetoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = Projeto(**data.model_dump())
    if not proj.responsavel_id:
        proj.responsavel_id = current_user.id
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


@router.put("/{id}", response_model=ProjetoResponse)
def update_projeto(id: str, data: ProjetoUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = db.query(Projeto).filter(Projeto.id == id, Projeto.deleted_at == None).first()
    if not proj:
        raise HTTPException(404, "Projeto não encontrado")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(proj, k, v)
    db.commit()
    db.refresh(proj)
    return proj


# ---- TAREFAS ----
@router.get("/{projeto_id}/tarefas", response_model=List[TarefaResponse])
def list_tarefas(projeto_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Tarefa).filter(Tarefa.projeto_id == projeto_id, Tarefa.deleted_at == None).order_by(Tarefa.ordem).all()


@router.post("/{projeto_id}/tarefas", response_model=TarefaResponse, status_code=201)
def create_tarefa(projeto_id: str, data: TarefaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tarefa = Tarefa(**data.model_dump())
    tarefa.projeto_id = projeto_id
    db.add(tarefa)
    db.commit()
    db.refresh(tarefa)
    return tarefa


@router.put("/tarefas/{id}", response_model=TarefaResponse)
def update_tarefa(id: str, data: TarefaUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == id, Tarefa.deleted_at == None).first()
    if not tarefa:
        raise HTTPException(404, "Tarefa não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(tarefa, k, v)
    db.commit()
    db.refresh(tarefa)
    return tarefa
