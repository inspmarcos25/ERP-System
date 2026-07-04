from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.user import User
from app.models.crm import Cliente, Lead
from app.schemas.crm import (
    ClienteCreate, ClienteUpdate, ClienteResponse,
    LeadCreate, LeadUpdate, LeadResponse
)
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/crm", tags=["CRM"])


# ---- CLIENTES ----
@router.get("/clientes", response_model=List[ClienteResponse])
def list_clientes(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Cliente).filter(Cliente.deleted_at == None)
    if search:
        q = q.filter(Cliente.nome.ilike(f"%{search}%") | Cliente.email.ilike(f"%{search}%"))
    if status:
        q = q.filter(Cliente.status == status)
    return q.order_by(Cliente.nome).offset(skip).limit(limit).all()


@router.get("/clientes/{id}", response_model=ClienteResponse)
def get_cliente(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cliente = db.query(Cliente).filter(Cliente.id == id, Cliente.deleted_at == None).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    return cliente


@router.post("/clientes", response_model=ClienteResponse, status_code=201)
def create_cliente(data: ClienteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cliente = Cliente(**data.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put("/clientes/{id}", response_model=ClienteResponse)
def update_cliente(id: str, data: ClienteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cliente = db.query(Cliente).filter(Cliente.id == id, Cliente.deleted_at == None).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(cliente, k, v)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/clientes/{id}", status_code=204)
def delete_cliente(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime
    cliente = db.query(Cliente).filter(Cliente.id == id, Cliente.deleted_at == None).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    cliente.deleted_at = datetime.utcnow()
    db.commit()


# ---- LEADS ----
@router.get("/leads", response_model=List[LeadResponse])
def list_leads(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Lead).filter(Lead.deleted_at == None)
    if search:
        q = q.filter(Lead.nome.ilike(f"%{search}%"))
    if status:
        q = q.filter(Lead.status == status)
    return q.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/leads", response_model=LeadResponse, status_code=201)
def create_lead(data: LeadCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = Lead(**data.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.put("/leads/{id}", response_model=LeadResponse)
def update_lead(id: str, data: LeadUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == id, Lead.deleted_at == None).first()
    if not lead:
        raise HTTPException(404, "Lead não encontrado")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(lead, k, v)
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/leads/{id}", status_code=204)
def delete_lead(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime
    lead = db.query(Lead).filter(Lead.id == id, Lead.deleted_at == None).first()
    if not lead:
        raise HTTPException(404, "Lead não encontrado")
    lead.deleted_at = datetime.utcnow()
    db.commit()
