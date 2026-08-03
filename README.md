# ERP Empresarial

Sistema de gestão empresarial full-stack com **8 módulos integrados** — CRM, vendas, estoque, financeiro, projetos, RH, dashboard e busca global — construído sobre uma API REST em FastAPI e uma interface em Next.js.

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)

> **Status:** em desenvolvimento. Backend com 52 endpoints funcionais e as 8 telas do frontend navegáveis.

---

## Módulos

| Módulo | O que faz | Endpoints |
|---|---|---|
| **CRM** | Clientes e funil de leads com status | 9 |
| **Projetos** | Projetos, tarefas, prioridades e prazos | 9 |
| **Estoque** | Produtos, categorias e movimentações de entrada/saída | 8 |
| **Financeiro** | Contas a pagar e a receber com controle de status | 8 |
| **Vendas** | Pedidos de venda e itens | 5 |
| **RH** | Funcionários e cargos | 5 |
| **Dashboard** | Indicadores consolidados dos demais módulos | 4 |
| **Autenticação** | Login JWT com papéis de usuário | 3 |
| **Busca global** | Busca unificada entre módulos | 1 |

## Stack

**Backend** — FastAPI · SQLAlchemy 2.0 · Pydantic v2 · Alembic · JWT (python-jose) · bcrypt · SQLite
**Frontend** — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts · Framer Motion · lucide-react

Decisões que valem nota:

- **SQLite como padrão** — zero infraestrutura para rodar. A camada é SQLAlchemy, então migrar para PostgreSQL é trocar a `DATABASE_URL`.
- **Seed automático no startup** — o banco nasce populado via `lifespan`, o que torna o projeto executável em um comando, sem passo manual de carga.
- **API versionada** (`/api/v1`) e documentação OpenAPI gerada automaticamente.
- **Trilha de auditoria** — modelo `AuditLog` para rastrear alterações.

---

## Rodando localmente

Pré-requisitos: **Python 3.11+** e **Node 20+**.

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API em `http://localhost:8000` · documentação interativa em `http://localhost:8000/api/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface em `http://localhost:3000`

### Acesso inicial

O seed cria um superusuário na primeira execução:

```
e-mail: admin@erp.com
senha:  Admin@123
```

> ⚠️ **Antes de qualquer deploy**, crie um `.env` em `backend/` sobrescrevendo os padrões de desenvolvimento — em especial `SECRET_KEY`, `FIRST_SUPERUSER_EMAIL` e `FIRST_SUPERUSER_PASSWORD`. Os valores em `app/core/config.py` existem só para o ambiente local.

```env
SECRET_KEY=<gere com: python -c "import secrets; print(secrets.token_urlsafe(32))">
DATABASE_URL=sqlite:///./erp.db
FIRST_SUPERUSER_EMAIL=voce@exemplo.com
FIRST_SUPERUSER_PASSWORD=<senha forte>
CORS_ORIGINS=["http://localhost:3000"]
```

---

## Estrutura

```
backend/
├── main.py                 # aplicação FastAPI, CORS, routers, lifespan
├── app/
│   ├── core/               # configuração (Pydantic Settings) e segurança (JWT, hash)
│   ├── database/           # engine, sessão e seed inicial
│   ├── models/             # modelos SQLAlchemy por domínio
│   ├── schemas/            # schemas Pydantic de entrada e saída
│   └── api/routes/         # um router por módulo
└── requirements.txt

frontend/
├── app/
│   ├── (auth)/login/       # rota pública
│   └── (dashboard)/        # rotas autenticadas, uma por módulo
├── components/
│   ├── layout/             # header e sidebar
│   └── shared/             # tema, busca global, alternador de visualização
└── lib/api.ts              # cliente HTTP da API
```

---

## Roadmap

- [ ] Testes automatizados (pytest no backend, Vitest no frontend)
- [ ] Migrações versionadas com Alembic (dependência já instalada)
- [ ] Exportação de relatórios em PDF e Excel (reportlab e openpyxl já instalados)
- [ ] Rate limiting nos endpoints de autenticação (slowapi já instalado)
- [ ] Docker Compose para subir tudo em um comando
- [ ] Deploy com PostgreSQL

---

<details>
<summary><strong>🇺🇸 English</strong></summary>

<br>

**ERP Empresarial** is a full-stack enterprise resource planning system with **8 integrated modules** — CRM, sales, inventory, finance, projects, HR, dashboard and global search — built on a FastAPI REST API and a Next.js interface.

**Status:** work in progress. 52 working backend endpoints and all 8 frontend screens navigable.

**Backend:** FastAPI · SQLAlchemy 2.0 · Pydantic v2 · Alembic · JWT · bcrypt · SQLite
**Frontend:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts · Framer Motion

Notable decisions: SQLite by default so the project runs with zero infrastructure (swapping to PostgreSQL is a `DATABASE_URL` change, since everything goes through SQLAlchemy); automatic database seeding on startup via `lifespan`, making the app runnable in a single command; versioned API under `/api/v1` with auto-generated OpenAPI docs; and an `AuditLog` model for change tracking.

**Running it** — backend: create a virtualenv, `pip install -r requirements.txt`, then `uvicorn main:app --reload` (API at `:8000`, docs at `/api/docs`). Frontend: `npm install && npm run dev` (at `:3000`). The seed creates `admin@erp.com` / `Admin@123` on first run — override `SECRET_KEY` and the superuser credentials through a `.env` file before deploying anywhere.

</details>
