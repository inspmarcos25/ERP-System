from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.crm import Cliente
from app.models.estoque import Produto
from app.models.vendas import PedidoVenda
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/search", tags=["Pesquisa Global"])


@router.get("/global")
def search_global(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = []

    clientes = db.query(Cliente).filter(
        Cliente.deleted_at == None,
        (Cliente.nome.ilike(f"%{q}%") | Cliente.email.ilike(f"%{q}%") | Cliente.cpf_cnpj.ilike(f"%{q}%"))
    ).limit(5).all()
    for c in clientes:
        results.append({"tipo": "cliente", "id": c.id, "titulo": c.nome, "subtitulo": c.email or "", "url": f"/crm/clientes/{c.id}"})

    produtos = db.query(Produto).filter(
        Produto.deleted_at == None, Produto.ativo == True,
        (Produto.nome.ilike(f"%{q}%") | Produto.codigo.ilike(f"%{q}%"))
    ).limit(5).all()
    for p in produtos:
        results.append({"tipo": "produto", "id": p.id, "titulo": p.nome, "subtitulo": p.codigo, "url": f"/estoque/produtos/{p.id}"})

    pedidos = db.query(PedidoVenda).filter(
        PedidoVenda.deleted_at == None,
        PedidoVenda.numero.ilike(f"%{q}%")
    ).limit(5).all()
    for p in pedidos:
        results.append({"tipo": "pedido", "id": p.id, "titulo": f"Pedido {p.numero}", "subtitulo": str(p.total), "url": f"/vendas/pedidos/{p.id}"})

    return {"query": q, "resultados": results, "total": len(results)}
