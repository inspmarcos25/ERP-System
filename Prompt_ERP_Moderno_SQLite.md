# Prompt Completo --- ERP Empresarial Moderno (SQLite)

## Objetivo

Desenvolva um sistema ERP (Enterprise Resource Planning) completo,
moderno, modular, escalável e preparado para uso em produção. O sistema
deverá centralizar todas as operações administrativas, financeiras,
comerciais, operacionais e gerenciais em uma única plataforma.

A arquitetura deverá seguir Clean Architecture, SOLID, DDD, Repository
Pattern, Service Layer e Dependency Injection, permitindo evolução
contínua e fácil manutenção.

O ERP deverá ser construído inicialmente utilizando **SQLite**, mas toda
a camada de persistência deverá ser implementada com **SQLAlchemy ORM**,
permitindo migração futura para PostgreSQL ou MySQL sem alterações na
regra de negócio.

## Stack Tecnológica

### Frontend

-   React
-   Next.js
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Query
-   Zustand
-   React Hook Form
-   Zod
-   Framer Motion
-   ApexCharts
-   TanStack Table

### Backend

-   Python
-   FastAPI
-   SQLAlchemy
-   Alembic
-   Pydantic
-   Celery
-   Redis

### Banco de Dados

-   SQLite
-   UUID como chave primária
-   Foreign Keys
-   Índices
-   Constraints
-   Soft Delete
-   CreatedAt / UpdatedAt / DeletedAt
-   Auditoria
-   Alembic para migrações
-   Seeds automáticas
-   Backup automático

## Estrutura do Projeto

``` text
/app
/api
/auth
/config
/core
/database
/models
/schemas
/repositories
/services
/use_cases
/controllers
/routes
/middlewares
/utils
/helpers
/uploads
/static
/templates
/tests
/docs
/scripts
/logs
/backups
```

## Arquitetura

-   Clean Architecture
-   SOLID
-   Domain Driven Design
-   Repository Pattern
-   Service Layer
-   Dependency Injection
-   Factory Pattern
-   Strategy Pattern
-   Observer Pattern quando aplicável
-   Separação entre Interface, Negócio, Persistência e Infraestrutura

## Autenticação e Segurança

-   JWT
-   Refresh Token
-   MFA
-   OAuth (Google, Microsoft, GitHub)
-   BCrypt
-   AES-256
-   Rate Limiting
-   Proteção contra SQL Injection, XSS e CSRF
-   LGPD
-   OWASP Top 10
-   Controle de sessão
-   Logs de autenticação
-   Auditoria completa

## Controle de Acesso

RBAC com permissões por: - Tela - Botão - Campo - Operação (Visualizar,
Criar, Editar, Excluir, Aprovar, Exportar, Importar)

Perfis: - Administrador - Diretor - Gerente - Financeiro - Comprador -
Vendedor - RH - Operador - Cliente - Fornecedor

## Dashboard

Personalizável com: - KPIs - Widgets movíveis e redimensionáveis - Fluxo
de caixa - Receita - Despesas - Lucro - Vendas - Estoque - Compras -
Contas vencidas - Ordens de Serviço - Projetos - Agenda - Alertas -
Notificações

## Módulos

### Financeiro

Contas a pagar/receber, fluxo de caixa, DRE, balanço, orçamento, PIX,
boletos, conciliação bancária, inadimplência, centros de custo.

### Contabilidade

Plano de contas, livro razão, diário, balancetes, ativos, depreciação,
SPED.

### Fiscal

NF-e, NFS-e, NFC-e, CT-e, MDF-e, impostos, certificados digitais.

### Compras

Solicitações, cotações, aprovações, pedidos, fornecedores, contratos.

### Estoque

Produtos, categorias, lotes, validade, inventário, QR Code, código de
barras, RFID, curva ABC, rastreabilidade.

### CRM

Clientes, leads, funil, propostas, agenda, histórico, campanhas.

### Vendas

Orçamentos, pedidos, faturamento, contratos, assinaturas, recorrência,
comissões.

### Produção

MRP, BOM, ordens de produção, planejamento, custos.

### RH

Funcionários, cargos, folha, férias, benefícios, ponto, treinamentos.

### Ativos

Equipamentos, patrimônio, depreciação, histórico, QR Code.

### CMMS

Ordens de serviço, manutenção preventiva/corretiva/preditiva,
checklists, inspeções, MTBF, MTTR.

### Projetos

Kanban, Gantt, cronogramas, custos, horas, entregas.

### Qualidade

Auditorias, não conformidades, ações corretivas, ISO.

### GED

OCR, upload, pesquisa, versionamento, assinatura digital.

### Workflow

Fluxos configuráveis de aprovação.

### Logística

Transportadoras, fretes, expedição, rastreamento.

### Portal do Cliente

Pedidos, boletos, notas, contratos, chamados.

### Portal do Fornecedor

Cotações, pedidos, documentos, pagamentos.

## Inteligência Artificial

Criar um assistente integrado capaz de: - Consultar o banco em linguagem
natural - Gerar SQL automaticamente - Produzir dashboards - Explicar
indicadores - Gerar relatórios - Detectar fraudes e anomalias - Fazer
previsões financeiras - Criar tarefas, documentos, contratos e e-mails -
Ler PDFs com OCR - Analisar imagens - Sugerir melhorias operacionais

## Pesquisa Global

Atalho **Ctrl+K** pesquisando clientes, produtos, pedidos, equipamentos,
documentos, contratos, relatórios e menus.

## Interface

-   Tema claro e escuro
-   Sidebar recolhível
-   Layout responsivo
-   Breadcrumb
-   Toasts
-   Skeleton loading
-   Paginação
-   Filtros avançados
-   Drag and Drop
-   Upload por arrastar
-   Componentes reutilizáveis
-   Acessibilidade WCAG 2.2

## API

-   REST
-   OpenAPI/Swagger
-   Webhooks
-   Integrações com bancos, Open Finance, Stripe, Mercado Pago,
    PagSeguro, Shopify, WooCommerce e Mercado Livre.

## Logs e Auditoria

Registrar: - Login/Logout - Usuário - IP - Navegador - Dispositivo -
Alterações - Importações - Exportações - Erros - Tempo de resposta

## Relatórios

Todos os módulos devem possuir: - Pesquisa - Filtros - Exportação
PDF/Excel/CSV - Impressão - Agendamento por e-mail

## Mobile

Aplicativo Android e iOS com: - Dashboard - Aprovações - Financeiro -
CRM - Ordens de Serviço - Scanner QR Code - Offline - Sincronização
automática

## Regras de Desenvolvimento

-   Código de produção
-   Sem duplicação
-   Componentes reutilizáveis
-   Tipagem completa
-   Tratamento de exceções
-   Testes unitários e integração
-   Documentação automática
-   Paginação em listas
-   Validação e sanitização de entradas
-   Transações quando necessário
-   Banco normalizado
-   Arquitetura preparada para migração do SQLite para PostgreSQL/MySQL

## Resultado Esperado

Entregar um ERP SaaS modular, multiempresa, multifilial, multilíngue,
seguro, escalável e preparado para crescimento, com interface moderna,
APIs documentadas, alta qualidade de código e recursos avançados de
automação e Inteligência Artificial.
