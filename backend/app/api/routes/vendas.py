from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.vendas import PedidoVenda, ItemVenda, PedidoStatus
from app.models.estoque import Produto, MovimentacaoEstoque
from app.schemas.vendas import PedidoVendaCreate, PedidoVendaUpdate, PedidoVendaResponse
from app.api.routes.auth import get_current_user
import uuid

router = APIRouter(prefix="/vendas", tags=["Vendas"])


def gerar_numero_pedido(db: Session) -> str:
    count = db.query(PedidoVenda).count()
    return f"PV{str(count + 1).zfill(6)}"


@router.get("/pedidos", response_model=List[PedidoVendaResponse])
def list_pedidos(
    skip: int = 0, limit: int = 50,
    status: Optional[str] = None,
    cliente_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(PedidoVenda).filter(PedidoVenda.deleted_at == None)
    if status:
        q = q.filter(PedidoVenda.status == status)
    if cliente_id:
        q = q.filter(PedidoVenda.cliente_id == cliente_id)
    return q.order_by(PedidoVenda.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/pedidos/{id}", response_model=PedidoVendaResponse)
def get_pedido(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pedido = db.query(PedidoVenda).filter(PedidoVenda.id == id, PedidoVenda.deleted_at == None).first()
    if not pedido:
        raise HTTPException(404, "Pedido não encontrado")
    return pedido


@router.post("/pedidos", response_model=PedidoVendaResponse, status_code=201)
def create_pedido(data: PedidoVendaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pedido_data = data.model_dump(exclude={"itens"})
    pedido = PedidoVenda(**pedido_data)
    pedido.numero = gerar_numero_pedido(db)
    pedido.vendedor_id = pedido.vendedor_id or current_user.id

    subtotal = 0.0
    for item_data in data.itens:
        produto = db.query(Produto).filter(Produto.id == item_data.produto_id).first()
        if not produto:
            raise HTTPException(404, f"Produto {item_data.produto_id} não encontrado")
        total_item = (item_data.quantidade * item_data.preco_unitario) - item_data.desconto
        item = ItemVenda(
            produto_id=item_data.produto_id,
            quantidade=item_data.quantidade,
            preco_unitario=item_data.preco_unitario,
            desconto=item_data.desconto,
            total=total_item,
        )
        pedido.itens.append(item)
        subtotal += total_item

    pedido.subtotal = subtotal
    pedido.total = subtotal - pedido.desconto + pedido.impostos + pedido.frete

    db.add(pedido)
    db.commit()
    db.refresh(pedido)
    return pedido


@router.put("/pedidos/{id}", response_model=PedidoVendaResponse)
def update_pedido(id: str, data: PedidoVendaUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pedido = db.query(PedidoVenda).filter(PedidoVenda.id == id, PedidoVenda.deleted_at == None).first()
    if not pedido:
        raise HTTPException(404, "Pedido não encontrado")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(pedido, k, v)
    db.commit()
    db.refresh(pedido)
    return pedido


@router.delete("/pedidos/{id}", status_code=204)
def delete_pedido(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pedido = db.query(PedidoVenda).filter(PedidoVenda.id == id, PedidoVenda.deleted_at == None).first()
    if not pedido:
        raise HTTPException(404, "Pedido não encontrado")
    pedido.deleted_at = datetime.utcnow()
    pedido.status = PedidoStatus.CANCELADO
    db.commit()
