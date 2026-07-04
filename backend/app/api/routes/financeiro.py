from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.financeiro import ContaReceber, ContaPagar, ContaStatus
from app.schemas.financeiro import (
    ContaReceberCreate, ContaReceberUpdate, ContaReceberResponse,
    ContaPagarCreate, ContaPagarUpdate, ContaPagarResponse
)
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/financeiro", tags=["Financeiro"])


# ---- CONTAS A RECEBER ----
@router.get("/contas-receber", response_model=List[ContaReceberResponse])
def list_contas_receber(
    skip: int = 0, limit: int = 50,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(ContaReceber).filter(ContaReceber.deleted_at == None)
    if status:
        q = q.filter(ContaReceber.status == status)
    return q.order_by(ContaReceber.data_vencimento).offset(skip).limit(limit).all()


@router.post("/contas-receber", response_model=ContaReceberResponse, status_code=201)
def create_conta_receber(data: ContaReceberCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conta = ContaReceber(**data.model_dump())
    db.add(conta)
    db.commit()
    db.refresh(conta)
    return conta


@router.put("/contas-receber/{id}", response_model=ContaReceberResponse)
def update_conta_receber(id: str, data: ContaReceberUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conta = db.query(ContaReceber).filter(ContaReceber.id == id, ContaReceber.deleted_at == None).first()
    if not conta:
        raise HTTPException(404, "Conta não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(conta, k, v)
    # Auto-status
    if conta.valor_pago >= conta.valor:
        conta.status = ContaStatus.PAGO
    db.commit()
    db.refresh(conta)
    return conta


# ---- CONTAS A PAGAR ----
@router.get("/contas-pagar", response_model=List[ContaPagarResponse])
def list_contas_pagar(
    skip: int = 0, limit: int = 50,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(ContaPagar).filter(ContaPagar.deleted_at == None)
    if status:
        q = q.filter(ContaPagar.status == status)
    return q.order_by(ContaPagar.data_vencimento).offset(skip).limit(limit).all()


@router.post("/contas-pagar", response_model=ContaPagarResponse, status_code=201)
def create_conta_pagar(data: ContaPagarCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conta = ContaPagar(**data.model_dump())
    db.add(conta)
    db.commit()
    db.refresh(conta)
    return conta


@router.put("/contas-pagar/{id}", response_model=ContaPagarResponse)
def update_conta_pagar(id: str, data: ContaPagarUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conta = db.query(ContaPagar).filter(ContaPagar.id == id, ContaPagar.deleted_at == None).first()
    if not conta:
        raise HTTPException(404, "Conta não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(conta, k, v)
    if conta.valor_pago >= conta.valor:
        conta.status = ContaStatus.PAGO
    db.commit()
    db.refresh(conta)
    return conta


@router.delete("/contas-receber/{id}", status_code=204)
def delete_conta_receber(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conta = db.query(ContaReceber).filter(ContaReceber.id == id, ContaReceber.deleted_at == None).first()
    if not conta:
        raise HTTPException(404, "Conta não encontrada")
    conta.deleted_at = datetime.utcnow()
    db.commit()


@router.delete("/contas-pagar/{id}", status_code=204)
def delete_conta_pagar(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conta = db.query(ContaPagar).filter(ContaPagar.id == id, ContaPagar.deleted_at == None).first()
    if not conta:
        raise HTTPException(404, "Conta não encontrada")
    conta.deleted_at = datetime.utcnow()
    db.commit()

