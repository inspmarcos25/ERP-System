from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.estoque import Produto, CategoriaEstoque, MovimentacaoEstoque
from app.schemas.estoque import ProdutoCreate, ProdutoUpdate, ProdutoResponse, CategoriaCreate, CategoriaResponse
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/estoque", tags=["Estoque"])


# ---- CATEGORIAS ----
@router.get("/categorias", response_model=List[CategoriaResponse])
def list_categorias(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CategoriaEstoque).filter(CategoriaEstoque.deleted_at == None).all()


@router.post("/categorias", response_model=CategoriaResponse, status_code=201)
def create_categoria(data: CategoriaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cat = CategoriaEstoque(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ---- PRODUTOS ----
@router.get("/produtos", response_model=List[ProdutoResponse])
def list_produtos(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    categoria_id: Optional[str] = None,
    estoque_critico: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Produto).filter(Produto.deleted_at == None, Produto.ativo == True)
    if search:
        q = q.filter(Produto.nome.ilike(f"%{search}%") | Produto.codigo.ilike(f"%{search}%"))
    if categoria_id:
        q = q.filter(Produto.categoria_id == categoria_id)
    if estoque_critico:
        q = q.filter(Produto.estoque_atual <= Produto.estoque_minimo)
    return q.order_by(Produto.nome).offset(skip).limit(limit).all()


@router.get("/produtos/{id}", response_model=ProdutoResponse)
def get_produto(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    produto = db.query(Produto).filter(Produto.id == id, Produto.deleted_at == None).first()
    if not produto:
        raise HTTPException(404, "Produto não encontrado")
    return produto


@router.post("/produtos", response_model=ProdutoResponse, status_code=201)
def create_produto(data: ProdutoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    produto_data = data.model_dump(exclude={"estoque_inicial"})
    produto = Produto(**produto_data)
    produto.estoque_atual = data.estoque_inicial
    if produto.preco_custo > 0:
        produto.margem_lucro = ((produto.preco_venda - produto.preco_custo) / produto.preco_custo) * 100

    db.add(produto)
    db.commit()

    if data.estoque_inicial > 0:
        mov = MovimentacaoEstoque(
            produto_id=produto.id,
            tipo="entrada",
            quantidade=data.estoque_inicial,
            quantidade_anterior=0,
            quantidade_posterior=data.estoque_inicial,
            motivo="Estoque inicial",
            usuario_id=current_user.id,
        )
        db.add(mov)
        db.commit()

    db.refresh(produto)
    return produto


@router.put("/produtos/{id}", response_model=ProdutoResponse)
def update_produto(id: str, data: ProdutoUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    produto = db.query(Produto).filter(Produto.id == id, Produto.deleted_at == None).first()
    if not produto:
        raise HTTPException(404, "Produto não encontrado")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(produto, k, v)
    if produto.preco_custo > 0:
        produto.margem_lucro = ((produto.preco_venda - produto.preco_custo) / produto.preco_custo) * 100
    db.commit()
    db.refresh(produto)
    return produto


@router.post("/produtos/{id}/ajuste-estoque")
def ajuste_estoque(
    id: str,
    quantidade: float = Query(...),
    motivo: str = Query("Ajuste manual"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    produto = db.query(Produto).filter(Produto.id == id).first()
    if not produto:
        raise HTTPException(404, "Produto não encontrado")

    ant = produto.estoque_atual
    produto.estoque_atual += quantidade
    tipo = "entrada" if quantidade > 0 else "saida"

    mov = MovimentacaoEstoque(
        produto_id=produto.id,
        tipo=tipo,
        quantidade=abs(quantidade),
        quantidade_anterior=ant,
        quantidade_posterior=produto.estoque_atual,
        motivo=motivo,
        usuario_id=current_user.id,
    )
    db.add(mov)
    db.commit()
    return {"message": "Estoque ajustado", "estoque_atual": produto.estoque_atual}
