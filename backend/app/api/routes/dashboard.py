from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, date, timedelta
from app.database.session import get_db
from app.models.user import User
from app.models.crm import Cliente
from app.models.vendas import PedidoVenda, PedidoStatus
from app.models.financeiro import ContaReceber, ContaPagar, ContaStatus
from app.models.estoque import Produto
from app.models.projetos import Projeto, ProjetoStatus
from app.models.rh import Funcionario
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    first_day_month = today.replace(day=1)
    last_month_start = (first_day_month - timedelta(days=1)).replace(day=1)

    # Vendas do mês
    vendas_mes = db.query(func.sum(PedidoVenda.total)).filter(
        PedidoVenda.status.notin_([PedidoStatus.CANCELADO]),
        func.date(PedidoVenda.data_pedido) >= first_day_month,
        PedidoVenda.deleted_at == None
    ).scalar() or 0

    # Vendas mês anterior
    vendas_mes_ant = db.query(func.sum(PedidoVenda.total)).filter(
        PedidoVenda.status.notin_([PedidoStatus.CANCELADO]),
        func.date(PedidoVenda.data_pedido) >= last_month_start,
        func.date(PedidoVenda.data_pedido) < first_day_month,
        PedidoVenda.deleted_at == None
    ).scalar() or 0

    # A receber vencido
    a_receber_vencido = db.query(func.sum(ContaReceber.valor - ContaReceber.valor_pago)).filter(
        ContaReceber.status == ContaStatus.PENDENTE,
        ContaReceber.data_vencimento < today,
        ContaReceber.deleted_at == None
    ).scalar() or 0

    # A pagar vencido
    a_pagar_vencido = db.query(func.sum(ContaPagar.valor - ContaPagar.valor_pago)).filter(
        ContaPagar.status == ContaStatus.PENDENTE,
        ContaPagar.data_vencimento < today,
        ContaPagar.deleted_at == None
    ).scalar() or 0

    # Total clientes ativos
    total_clientes = db.query(func.count(Cliente.id)).filter(
        Cliente.deleted_at == None
    ).scalar() or 0

    # Produtos com estoque baixo
    produtos_criticos = db.query(func.count(Produto.id)).filter(
        Produto.estoque_atual <= Produto.estoque_minimo,
        Produto.ativo == True,
        Produto.deleted_at == None
    ).scalar() or 0

    # Pedidos pendentes
    pedidos_pendentes = db.query(func.count(PedidoVenda.id)).filter(
        PedidoVenda.status == PedidoStatus.PENDENTE,
        PedidoVenda.deleted_at == None
    ).scalar() or 0

    # Projetos em andamento
    projetos_ativos = db.query(func.count(Projeto.id)).filter(
        Projeto.status == ProjetoStatus.EM_ANDAMENTO,
        Projeto.deleted_at == None
    ).scalar() or 0

    # Funcionários
    total_funcionarios = db.query(func.count(Funcionario.id)).filter(
        Funcionario.deleted_at == None
    ).scalar() or 0

    # Crescimento vendas
    crescimento = ((vendas_mes - vendas_mes_ant) / vendas_mes_ant * 100) if vendas_mes_ant > 0 else 0

    return {
        "vendas_mes": vendas_mes,
        "vendas_mes_anterior": vendas_mes_ant,
        "crescimento_vendas": round(crescimento, 1),
        "a_receber_vencido": a_receber_vencido,
        "a_pagar_vencido": a_pagar_vencido,
        "total_clientes": total_clientes,
        "produtos_criticos": produtos_criticos,
        "pedidos_pendentes": pedidos_pendentes,
        "projetos_ativos": projetos_ativos,
        "total_funcionarios": total_funcionarios,
    }


@router.get("/fluxo-caixa")
def get_fluxo_caixa(
    meses: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fluxo de caixa dos últimos N meses"""
    today = date.today()
    result = []

    for i in range(meses - 1, -1, -1):
        mes_ref = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if mes_ref.month == 12:
            mes_fim = mes_ref.replace(year=mes_ref.year + 1, month=1, day=1)
        else:
            mes_fim = mes_ref.replace(month=mes_ref.month + 1, day=1)

        receitas = db.query(func.sum(ContaReceber.valor_pago)).filter(
            ContaReceber.data_pagamento >= mes_ref,
            ContaReceber.data_pagamento < mes_fim,
            ContaReceber.deleted_at == None
        ).scalar() or 0

        despesas = db.query(func.sum(ContaPagar.valor_pago)).filter(
            ContaPagar.data_pagamento >= mes_ref,
            ContaPagar.data_pagamento < mes_fim,
            ContaPagar.deleted_at == None
        ).scalar() or 0

        result.append({
            "mes": mes_ref.strftime("%b/%Y"),
            "receitas": round(receitas, 2),
            "despesas": round(despesas, 2),
            "saldo": round(receitas - despesas, 2),
        })

    return result


@router.get("/vendas-por-status")
def get_vendas_por_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(PedidoVenda.status, func.count(PedidoVenda.id), func.sum(PedidoVenda.total)).filter(
        PedidoVenda.deleted_at == None
    ).group_by(PedidoVenda.status).all()

    return [{"status": r[0], "quantidade": r[1], "total": r[2] or 0} for r in rows]


@router.get("/alertas")
def get_alertas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    alertas = []

    # Contas vencidas
    ct_receber = db.query(func.count(ContaReceber.id)).filter(
        ContaReceber.status == ContaStatus.PENDENTE,
        ContaReceber.data_vencimento < today,
        ContaReceber.deleted_at == None
    ).scalar() or 0
    if ct_receber > 0:
        alertas.append({"tipo": "warning", "mensagem": f"{ct_receber} conta(s) a receber vencida(s)", "modulo": "financeiro"})

    ct_pagar = db.query(func.count(ContaPagar.id)).filter(
        ContaPagar.status == ContaStatus.PENDENTE,
        ContaPagar.data_vencimento < today,
        ContaPagar.deleted_at == None
    ).scalar() or 0
    if ct_pagar > 0:
        alertas.append({"tipo": "danger", "mensagem": f"{ct_pagar} conta(s) a pagar vencida(s)", "modulo": "financeiro"})

    # Estoque crítico
    prod_critico = db.query(func.count(Produto.id)).filter(
        Produto.estoque_atual <= Produto.estoque_minimo,
        Produto.ativo == True,
        Produto.deleted_at == None
    ).scalar() or 0
    if prod_critico > 0:
        alertas.append({"tipo": "warning", "mensagem": f"{prod_critico} produto(s) com estoque crítico", "modulo": "estoque"})

    return alertas
