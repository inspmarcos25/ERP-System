"""Seeds automáticas com dados demo realistas"""
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.crm import Cliente, Lead, ClienteStatus, LeadStatus
from app.models.estoque import Produto, CategoriaEstoque, MovimentacaoEstoque
from app.models.vendas import PedidoVenda, ItemVenda, PedidoStatus
from app.models.financeiro import ContaReceber, ContaPagar, ContaStatus
from app.models.rh import Funcionario, Cargo
from app.models.projetos import Projeto, Tarefa, ProjetoStatus, TarefaStatus, TarefaPrioridade
import random


def seed_database(db: Session):
    # Verificar se já tem dados
    if db.query(User).filter(User.email == "admin@erp.com").first():
        return

    print("🌱 Iniciando seeds...")

    # === USUÁRIOS ===
    admin = User(
        name="Administrador Sistema",
        email="admin@erp.com",
        hashed_password=get_password_hash("Admin@123"),
        role=UserRole.ADMIN,
        is_active=True,
        is_superuser=True,
        department="TI",
    )
    gerente = User(
        name="Carlos Gerente",
        email="gerente@erp.com",
        hashed_password=get_password_hash("Admin@123"),
        role=UserRole.MANAGER,
        is_active=True,
        department="Comercial",
    )
    vendedor = User(
        name="Ana Vendas",
        email="vendedor@erp.com",
        hashed_password=get_password_hash("Admin@123"),
        role=UserRole.SELLER,
        is_active=True,
        department="Vendas",
    )
    financeiro = User(
        name="Roberto Financeiro",
        email="financeiro@erp.com",
        hashed_password=get_password_hash("Admin@123"),
        role=UserRole.FINANCIAL,
        is_active=True,
        department="Financeiro",
    )
    db.add_all([admin, gerente, vendedor, financeiro])
    db.flush()

    # === CATEGORIAS ===
    cats = [
        CategoriaEstoque(nome="Eletrônicos", descricao="Produtos eletrônicos em geral"),
        CategoriaEstoque(nome="Informática", descricao="Computadores e periféricos"),
        CategoriaEstoque(nome="Escritório", descricao="Material de escritório"),
        CategoriaEstoque(nome="Móveis", descricao="Mobiliário corporativo"),
    ]
    db.add_all(cats)
    db.flush()

    # === PRODUTOS ===
    produtos_data = [
        {"codigo": "EL001", "nome": "Notebook Dell XPS 15", "cat": cats[1], "custo": 4500, "venda": 6800, "min": 2, "atual": 15},
        {"codigo": "EL002", "nome": "Monitor LG 27' 4K", "cat": cats[0], "custo": 1200, "venda": 1900, "min": 3, "atual": 8},
        {"codigo": "EL003", "nome": "Teclado Mecânico RGB", "cat": cats[0], "custo": 280, "venda": 490, "min": 5, "atual": 22},
        {"codigo": "EL004", "nome": "Mouse Gamer Logitech", "cat": cats[0], "custo": 150, "venda": 260, "min": 5, "atual": 18},
        {"codigo": "EL005", "nome": "Headset Sony WH-1000", "cat": cats[0], "custo": 800, "venda": 1350, "min": 3, "atual": 2},  # crítico
        {"codigo": "ES001", "nome": "Cadeira Ergonômica Premium", "cat": cats[3], "custo": 650, "venda": 1100, "min": 2, "atual": 6},
        {"codigo": "ES002", "nome": "Mesa de Escritório L", "cat": cats[3], "custo": 800, "venda": 1400, "min": 1, "atual": 4},
        {"codigo": "OF001", "nome": "Resma A4 500 folhas", "cat": cats[2], "custo": 18, "venda": 32, "min": 20, "atual": 8},  # crítico
    ]
    produtos = []
    for pd in produtos_data:
        margem = ((pd["venda"] - pd["custo"]) / pd["custo"]) * 100
        p = Produto(
            codigo=pd["codigo"],
            nome=pd["nome"],
            categoria_id=pd["cat"].id,
            preco_custo=pd["custo"],
            preco_venda=pd["venda"],
            margem_lucro=round(margem, 2),
            estoque_minimo=pd["min"],
            estoque_atual=pd["atual"],
            ativo=True,
            unidade="UN",
        )
        db.add(p)
        produtos.append(p)
    db.flush()

    # === CLIENTES ===
    clientes_data = [
        {"nome": "Tech Solutions Ltda", "email": "contato@techsolutions.com.br", "cnpj": "12.345.678/0001-90", "cidade": "São Paulo", "estado": "SP", "limite": 50000},
        {"nome": "Inovação Digital SA", "email": "comercial@inovacaodigital.com", "cnpj": "23.456.789/0001-01", "cidade": "Rio de Janeiro", "estado": "RJ", "limite": 80000},
        {"nome": "Grupo Empresarial Norte", "email": "compras@gruponorte.com.br", "cnpj": "34.567.890/0001-12", "cidade": "Belém", "estado": "PA", "limite": 30000},
        {"nome": "Distribuidora Sul LTDA", "email": "admin@distribuidorasul.com", "cnpj": "45.678.901/0001-23", "cidade": "Porto Alegre", "estado": "RS", "limite": 60000},
        {"nome": "Consultoria Estratégica ME", "email": "info@consultoriaestrategica.com", "cnpj": "56.789.012/0001-34", "cidade": "Belo Horizonte", "estado": "MG", "limite": 20000},
        {"nome": "João Silva Santos", "email": "joao.silva@gmail.com", "cnpj": "123.456.789-00", "cidade": "Curitiba", "estado": "PR", "limite": 5000},
    ]
    clientes = []
    for cd in clientes_data:
        c = Cliente(
            nome=cd["nome"],
            email=cd["email"],
            cpf_cnpj=cd["cnpj"],
            tipo="PJ" if "/" in cd["cnpj"] else "PF",
            cidade=cd["cidade"],
            estado=cd["estado"],
            limite_credito=cd["limite"],
            status=ClienteStatus.ATIVO,
            responsavel_id=vendedor.id,
        )
        db.add(c)
        clientes.append(c)
    db.flush()

    # === LEADS ===
    leads_data = [
        {"nome": "StartupX", "email": "ceo@startupx.io", "valor": 15000, "prob": 75, "status": LeadStatus.NEGOCIACAO},
        {"nome": "Empresa ABC", "email": "vendas@abc.com.br", "valor": 8000, "prob": 50, "status": LeadStatus.PROPOSTA},
        {"nome": "João Empreendedor", "email": "joao@empreendedor.com", "valor": 3000, "prob": 25, "status": LeadStatus.QUALIFICADO},
        {"nome": "Corp Technologies", "email": "ti@corp.com.br", "valor": 45000, "prob": 85, "status": LeadStatus.NEGOCIACAO},
        {"nome": "Varejo Online Ltda", "email": "compras@varejoonline.com", "valor": 12000, "prob": 40, "status": LeadStatus.CONTATO},
    ]
    for ld in leads_data:
        lead = Lead(
            nome=ld["nome"],
            email=ld["email"],
            valor_estimado=ld["valor"],
            probabilidade=ld["prob"],
            status=ld["status"],
            responsavel_id=vendedor.id,
        )
        db.add(lead)
    db.flush()

    # === PEDIDOS DE VENDA ===
    pedidos_data = [
        {"cliente": clientes[0], "status": PedidoStatus.ENTREGUE, "days_ago": 25},
        {"cliente": clientes[1], "status": PedidoStatus.APROVADO, "days_ago": 10},
        {"cliente": clientes[2], "status": PedidoStatus.PENDENTE, "days_ago": 2},
        {"cliente": clientes[3], "status": PedidoStatus.EM_PRODUCAO, "days_ago": 5},
        {"cliente": clientes[0], "status": PedidoStatus.PENDENTE, "days_ago": 1},
        {"cliente": clientes[4], "status": PedidoStatus.ENTREGUE, "days_ago": 15},
    ]
    pedidos = []
    for i, pd_data in enumerate(pedidos_data):
        num_produtos = random.randint(1, 3)
        selected = random.sample(produtos, num_produtos)
        data_pedido = datetime.utcnow() - timedelta(days=pd_data["days_ago"])

        pedido = PedidoVenda(
            numero=f"PV{str(i+1).zfill(6)}",
            cliente_id=pd_data["cliente"].id,
            vendedor_id=vendedor.id,
            status=pd_data["status"],
            data_pedido=data_pedido,
            forma_pagamento=random.choice(["PIX", "Boleto", "Cartão", "Transferência"]),
        )
        subtotal = 0
        for p in selected:
            qty = random.randint(1, 5)
            total_item = qty * p.preco_venda
            item = ItemVenda(
                produto_id=p.id,
                quantidade=qty,
                preco_unitario=p.preco_venda,
                desconto=0,
                total=total_item,
            )
            pedido.itens.append(item)
            subtotal += total_item

        pedido.subtotal = subtotal
        pedido.total = subtotal
        db.add(pedido)
        pedidos.append(pedido)
    db.flush()

    # === CONTAS A RECEBER ===
    for i, pedido in enumerate(pedidos[:4]):
        vencimento = date.today() + timedelta(days=random.choice([-5, -2, 10, 30]))
        pago = pedido.status == PedidoStatus.ENTREGUE
        cr = ContaReceber(
            descricao=f"Recebimento pedido {pedido.numero}",
            cliente_id=pedido.cliente_id,
            pedido_id=pedido.id,
            valor=pedido.total,
            valor_pago=pedido.total if pago else 0,
            data_vencimento=vencimento,
            data_pagamento=date.today() if pago else None,
            status=ContaStatus.PAGO if pago else (ContaStatus.VENCIDO if vencimento < date.today() else ContaStatus.PENDENTE),
            forma_pagamento="PIX",
        )
        db.add(cr)

    # === CONTAS A PAGAR ===
    contas_pagar = [
        {"desc": "Aluguel escritório", "valor": 4500, "venc_delta": -3},
        {"desc": "Energia elétrica", "valor": 850, "venc_delta": 5},
        {"desc": "Internet fibra 1Gbps", "valor": 320, "venc_delta": 10},
        {"desc": "Fornecedor ABC - NF 001", "valor": 12000, "venc_delta": 15},
        {"desc": "Salários Dezembro", "valor": 28500, "venc_delta": -1},
        {"desc": "Software ERP licença", "valor": 990, "venc_delta": 20},
    ]
    for cp_data in contas_pagar:
        venc = date.today() + timedelta(days=cp_data["venc_delta"])
        pago = cp_data["venc_delta"] < 0
        cp = ContaPagar(
            descricao=cp_data["desc"],
            valor=cp_data["valor"],
            valor_pago=cp_data["valor"] if pago else 0,
            data_vencimento=venc,
            data_pagamento=date.today() if pago else None,
            status=ContaStatus.PAGO if pago else (ContaStatus.VENCIDO if venc < date.today() else ContaStatus.PENDENTE),
        )
        db.add(cp)

    # === CARGOS ===
    cargos = [
        Cargo(nome="Diretor de Tecnologia", departamento="TI", salario_base=15000, nivel="Diretoria"),
        Cargo(nome="Gerente Comercial", departamento="Comercial", salario_base=8000, nivel="Gerência"),
        Cargo(nome="Desenvolvedor Sênior", departamento="TI", salario_base=9000, nivel="Sênior"),
        Cargo(nome="Analista Financeiro", departamento="Financeiro", salario_base=5500, nivel="Pleno"),
        Cargo(nome="Vendedor Sênior", departamento="Vendas", salario_base=3500, nivel="Sênior"),
        Cargo(nome="Assistente Administrativo", departamento="Administrativo", salario_base=2200, nivel="Júnior"),
    ]
    db.add_all(cargos)
    db.flush()

    # === FUNCIONÁRIOS ===
    funcionarios_data = [
        {"nome": "Marcos Alberto Silva", "cpf": "111.222.333-44", "cargo": cargos[0], "salario": 15000, "admissao": date(2020, 3, 1)},
        {"nome": "Ana Carolina Santos", "cpf": "222.333.444-55", "cargo": cargos[1], "salario": 8500, "admissao": date(2021, 6, 15)},
        {"nome": "Pedro Henrique Costa", "cpf": "333.444.555-66", "cargo": cargos[2], "salario": 9200, "admissao": date(2022, 1, 10)},
        {"nome": "Fernanda Lima Oliveira", "cpf": "444.555.666-77", "cargo": cargos[3], "salario": 5800, "admissao": date(2021, 9, 20)},
        {"nome": "Lucas Rodrigues Pereira", "cpf": "555.666.777-88", "cargo": cargos[4], "salario": 3800, "admissao": date(2023, 2, 5)},
        {"nome": "Juliana Martins Alves", "cpf": "666.777.888-99", "cargo": cargos[5], "salario": 2400, "admissao": date(2023, 8, 1)},
    ]
    for fd in funcionarios_data:
        f = Funcionario(
            nome=fd["nome"],
            cpf=fd["cpf"],
            cargo_id=fd["cargo"].id,
            departamento=fd["cargo"].departamento,
            salario=fd["salario"],
            data_admissao=fd["admissao"],
        )
        db.add(f)
    db.flush()

    # === PROJETOS ===
    projeto1 = Projeto(
        nome="Implementação ERP Módulo Financeiro",
        descricao="Implementar e configurar todos os módulos financeiros do novo ERP",
        responsavel_id=gerente.id,
        status=ProjetoStatus.EM_ANDAMENTO,
        data_inicio=datetime(2025, 1, 10),
        data_fim_previsto=datetime(2025, 8, 31),
        orcamento=120000,
        custo_atual=65000,
        progresso=60,
    )
    projeto2 = Projeto(
        nome="Lançamento App Mobile",
        descricao="Desenvolvimento do aplicativo móvel para clientes",
        responsavel_id=admin.id,
        status=ProjetoStatus.PLANEJAMENTO,
        data_inicio=datetime(2025, 3, 1),
        data_fim_previsto=datetime(2025, 12, 31),
        orcamento=80000,
        custo_atual=0,
        progresso=15,
    )
    db.add_all([projeto1, projeto2])
    db.flush()

    tarefas = [
        Tarefa(projeto_id=projeto1.id, titulo="Levantamento de requisitos", status=TarefaStatus.CONCLUIDO, prioridade=TarefaPrioridade.ALTA, responsavel_id=gerente.id, ordem=1),
        Tarefa(projeto_id=projeto1.id, titulo="Design das interfaces financeiras", status=TarefaStatus.CONCLUIDO, prioridade=TarefaPrioridade.ALTA, responsavel_id=admin.id, ordem=2),
        Tarefa(projeto_id=projeto1.id, titulo="Desenvolvimento API contas a pagar", status=TarefaStatus.EM_ANDAMENTO, prioridade=TarefaPrioridade.URGENTE, responsavel_id=admin.id, ordem=3),
        Tarefa(projeto_id=projeto1.id, titulo="Integração bancária PIX", status=TarefaStatus.TODO, prioridade=TarefaPrioridade.MEDIA, responsavel_id=financeiro.id, ordem=4),
        Tarefa(projeto_id=projeto1.id, titulo="Testes e homologação", status=TarefaStatus.BACKLOG, prioridade=TarefaPrioridade.ALTA, responsavel_id=gerente.id, ordem=5),
        Tarefa(projeto_id=projeto2.id, titulo="Wireframes e protótipos", status=TarefaStatus.EM_ANDAMENTO, prioridade=TarefaPrioridade.ALTA, responsavel_id=admin.id, ordem=1),
        Tarefa(projeto_id=projeto2.id, titulo="Setup ambiente React Native", status=TarefaStatus.TODO, prioridade=TarefaPrioridade.MEDIA, responsavel_id=admin.id, ordem=2),
    ]
    db.add_all(tarefas)
    db.commit()

    print("✅ Seeds concluídas com sucesso!")
    print("   📧 Login: admin@erp.com | Senha: Admin@123")
