from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.rh import Funcionario, Cargo
from app.api.routes.auth import get_current_user
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/rh", tags=["RH & Funcionários"])

# Pydantic Schemas inside route for simplicity or structure compliance
class CargoResponse(BaseModel):
    id: str
    nome: str
    departamento: Optional[str] = None
    salario_base: float

    class Config:
        from_attributes = True

class FuncionarioCreate(BaseModel):
    nome: str
    cpf: Optional[str] = None
    email: Optional[str] = None
    cargo_id: Optional[str] = None
    departamento: Optional[str] = None
    salario: float = 0.0
    data_admissao: Optional[date] = None

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    cargo_id: Optional[str] = None
    departamento: Optional[str] = None
    status: Optional[str] = None
    salario: Optional[float] = None
    data_admissao: Optional[date] = None

class FuncionarioResponse(BaseModel):

    id: str
    nome: str
    cpf: Optional[str] = None
    email: Optional[str] = None
    cargo_id: Optional[str] = None
    departamento: Optional[str] = None
    status: str
    salario: float
    data_admissao: Optional[date] = None

    class Config:
        from_attributes = True


@router.get("/funcionarios", response_model=List[FuncionarioResponse])
def list_funcionarios(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Funcionario).filter(Funcionario.deleted_at == None)
    if search:
        q = q.filter(Funcionario.nome.ilike(f"%{search}%") | Funcionario.cpf.ilike(f"%{search}%"))
    return q.order_by(Funcionario.nome).offset(skip).limit(limit).all()


@router.post("/funcionarios", response_model=FuncionarioResponse, status_code=201)
def create_funcionario(data: FuncionarioCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    f = Funcionario(**data.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.put("/funcionarios/{id}", response_model=FuncionarioResponse)
def update_funcionario(id: str, data: FuncionarioUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    f = db.query(Funcionario).filter(Funcionario.id == id, Funcionario.deleted_at == None).first()
    if not f:
        raise HTTPException(404, "Funcionário não encontrado")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(f, k, v)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/funcionarios/{id}", status_code=204)
def delete_funcionario(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    f = db.query(Funcionario).filter(Funcionario.id == id, Funcionario.deleted_at == None).first()
    if not f:
        raise HTTPException(404, "Funcionário não encontrado")
    f.deleted_at = datetime.utcnow()
    db.commit()


@router.get("/cargos", response_model=List[CargoResponse])
def list_cargos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Cargo).filter(Cargo.deleted_at == None).all()
