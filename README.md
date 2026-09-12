# Agentic Software Engineering — Workshop

> Workshop prático para times de engenharia aprenderem a construir APIs robustas com IA através de **disciplinas de engenharia de software real**, combatendo o *vibe coding*:
>
> **Requisito → Grilling & Domínio (`/grill-with-docs`) → Spec (`/to-spec`) → Tracer Bullets (`/to-tickets`) → TDD & Code Review (`/implement`)**

---

## O que é este repositório?

Este repositório é a base do workshop de desenvolvimento assistido por agentes de IA baseado no framework **"Skills For Real Engineers"** (por Matt Pocock).

Diferente de abordagens baseadas em suposições ou geradores monolíticos rígidos, este workshop ensina como aplicar princípios clássicos de engenharia (*Extreme Programming*, *Pragmatic Programmer*, *Domain-Driven Design* e *A Philosophy of Software Design*):

1. **Alinhamento Rigoroso**: Evitar ambiguidades através de entrevistas ativas (*grilling*).
2. **Linguagem Ubíqua & Decisões Arquiteturais**: Manter um glossário vivo em `CONTEXT.md` e registros duráveis em `docs/adr/`.
3. **Issue Tracker Local e Autônomo**: Rastreabilidade de tarefas em markdown local dentro de `.scratch/`, sem dependência de credenciais externas.
4. **Fatias Verticais (*Tracer Bullets*)**: Dividir requisitos em fatias ponta a ponta com grafo explícito de dependências (`Blocked by: NN`).
5. **Implementação Disciplinada**: TDD guiado por costuras públicas (*seams*), arquitetura de módulos profundos (*deep modules*) e revisão em dois eixos (*code review* de padrões e aderência à spec) antes de commitar.

---

## Estrutura do Repositório

```text
spec-driven-workshop/
├── README.md                       ← Visão geral e introdução
├── AGENTS.md                       ← Constituição operacional dos Coding Agents
├── CONTEXT.md                      ← Glossário ubíquo e modelo de domínio
├── .scratch/                       ← Issue Tracker Local Markdown (specs e tickets)
│   └── task-management/
│       ├── spec.md                 ← Especificação sintetizada (/to-spec)
│       └── issues/                 ← Fatias verticais com dependências (/to-tickets)
├── .agents/
│   └── skills/                     ← Skills de engenharia e produtividade
│       ├── grill-with-docs/        ← Entrevista ativa, glossário e ADRs
│       ├── to-spec/                ← Síntese de especificação técnica
│       ├── to-tickets/             ← Fatiamento em tracer bullets
│       ├── implement/              ← Orquestração de implementação
│       ├── tdd/                    ← Ciclo Red-Green-Refactor nas costuras
│       ├── code-review/            ← Revisão em dois eixos (Padrões + Spec)
│       └── diagnosing-bugs/        ← Diagnóstico disciplinado de defeitos
├── docs/
│   ├── user-stories.md             ← Requisitos de negócio (7 User Stories)
│   ├── adr/                        ← Architecture Decision Records
│   ├── agents/                     ← Configuração do Issue Tracker e Domínio
│   └── workshop/                   ← Guia passo a passo do workshop
└── src/                            ← Código-fonte da API (NestJS + Drizzle)
```

---

## Pré-requisitos

- Node.js 22+
- pnpm 10+
- Docker (para PostgreSQL)
- Editor compatível com agentes de IA (Antigravity IDE, Cursor, VS Code com Claude Code, etc.)

---

## O que será construído

Uma **API REST de gerenciamento de tarefas** completa:

| Feature | Endpoint | US |
|---|---|---|
| Padronização de Erros | Global | US-007 |
| Autenticação via API Key | Global (`x-api-key`) | US-006 |
| Criar tarefa | `POST /tasks` | US-001 |
| Consultar tarefa | `GET /tasks/{id}` | US-003 |
| Listar tarefas (paginado) | `GET /tasks` | US-002 |
| Atualizar tarefa | `PATCH /tasks/{id}` | US-004 |
| Remover tarefa (soft delete) | `DELETE /tasks/{id}` | US-005 |

---

## Como começar o workshop

Siga o roteiro passo a passo em **[`docs/workshop/README.md`](docs/workshop/README.md)**. O tutorial guia o time através das seguintes etapas fundamentais:

```bash
# 1. Alinhamento e modelagem de domínio
/grill-with-docs

# 2. Síntese da especificação técnica
/to-spec

# 3. Fatiamento em tickets com dependências
/to-tickets

# 4. Implementação com TDD e Code Review
/implement
```
