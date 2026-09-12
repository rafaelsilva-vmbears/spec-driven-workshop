# Workshop: Agentic Software Engineering na Prática
## Construindo APIs com o Framework de Skills de Matt Pocock

> **Objetivo**: Ao final deste workshop, o time de engenharia dominará o fluxo de desenvolvimento assistido por IA de ponta a ponta:
>
> **Requisito → Grilling (`/grill-with-docs`) → Spec (`/to-spec`) → Tracer Bullets (`/to-tickets`) → TDD & Code Review (`/implement`)**

---

## 🧠 Filosofia: Engenharia Real vs. Vibe Coding

O avanço dos agentes de codificação (como Antigravity, Claude Code e Cursor) trouxe uma armadilha frequente: o **Vibe Coding** — onde o desenvolvedor joga prompts genéricos e aceita código sem contrato, gerando dívida técnica e arquiteturas incoerentes (*Big Ball of Mud*).

Por outro lado, abordagens baseadas em geradores monolíticos de especificações costumam retirar o controle do desenvolvedor e gerar documentos burocráticos e estáticos.

As **Skills for Real Engineers** (desenvolvidas por **Matt Pocock**) trazem uma terceira via: **disciplinas clássicas de engenharia aplicadas como habilidades modulares para o agente**:

```text
+-----------------------------------------------------------------------------------------+
|                                    O CICLO PRINCIPAL                                    |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [Requisitos / User Stories]                                                            |
|             │                                                                           |
|             ▼                                                                           |
|    /grill-with-docs ────────► Entrevista ativa: elimina ambiguidades                    |
|             │                Gera CONTEXT.md (Glossário Ubíquo)                         |
|             │                Gera docs/adr/ (Architecture Decision Records)             |
|             ▼                                                                           |
|         /to-spec   ─────────► Sintetiza a conversa em especificação formal              |
|             │                Mapeia Costuras de Teste (Test Seams) públicas             |
|             │                Gera .scratch/<feature>/spec.md                            |
|             ▼                                                                           |
|       /to-tickets  ─────────► Fatias verticais (Tracer Bullets) ponta a ponta           |
|             │                Declara grafo de dependências (Blocked by: NN)             |
|             │                Gera tickets em .scratch/<feature>/issues/                 |
|             ▼                                                                           |
|        /implement  ─────────► Implementa ticket a ticket respeitando o Frontier         |
|             │                                                                           |
|             ├──► /tdd         (Ciclo Red -> Green -> Refactor nas costuras acordadas)   |
|             ├──► /codebase-design (Arquitetura de Deep Modules / Módulos Profundos)     |
|             └──► /code-review (Revisão em 2 eixos: Padrões de Código + Aderência à Spec)|
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 📂 O Issue Tracker Local Markdown (`.scratch/`)

Neste workshop, utilizamos o **Issue Tracker Local Markdown**. Os tickets de trabalho não ficam em ferramentas externas com necessidade de tokens, e sim diretamente na pasta `.scratch/` do projeto:

```text
.scratch/
└── task-management/
    ├── spec.md                          <-- Especificação técnica formal
    └── issues/                          <-- Fatias verticais com dependências
        ├── 01-error-response.md         <-- Blocked by: None
        ├── 02-api-key-guard.md          <-- Blocked by: None
        ├── 03-task-domain-model.md      <-- Blocked by: 01
        ├── 04-task-repository-drizzle.md<-- Blocked by: 03
        └── 05-post-tasks-endpoint.md    <-- Blocked by: 02, 04
```

### O Conceito de Frontier e Higiene de Contexto
- **Frontier**: O agente sempre trabalha no conjunto de tickets cujos bloqueadores já estão resolvidos (`Status: resolved`).
- **Context Hygiene**: Uma vez que os tickets foram gerados pelo `/to-tickets`, cada ticket é auto-contido. O desenvolvedor pode rodar `/clear` na janela do chat e implementar o próximo ticket com 100% de memória de contexto livre, evitando perda de raciocínio.

---

## 🛠️ A Stack do Projeto

| Componente | Tecnologia | Papel na Arquitetura |
|---|---|---|
| Runtime & Pacotes | Node.js 22+ & pnpm 10+ | Ambiente base com tipagem estrita |
| Framework & HTTP | NestJS 11 + Express/Fastify | Camada de apresentação e injeção de dependência |
| Linter & Formatter | ESLint + Prettier (`pnpm check`) | Linting e validação de formatação |
| ORM & Banco | Drizzle ORM + PostgreSQL 15 | Schemas tipados e migrations atômicas |
| Testes | Vitest + Supertest | Testes unitários e de integração de alta velocidade |
| Observabilidade | Pino + nestjs-pino | Logs estruturados em formato JSON |

---

## 🚀 Roteiro Passo a Passo do Workshop

### Módulo 0 — Ambientação e Estrutura Inicial

1. **Inspecione a base do projeto**:
   - `AGENTS.md`: Diretrizes para agentes de IA operando no repositório.
   - `docs/agents/issue-tracker.md`: Convenção do tracker local em `.scratch/`.
   - `docs/agents/domain.md`: Regras de consumo de domínio e ADRs.
   - `docs/user-stories.md`: As 7 User Stories do MVP de Gestão de Tarefas.
2. **Valide a base do repositório**:
   ```bash
   pnpm install
   pnpm check     # Valida Biome
   pnpm build     # Valida compilação TypeScript
   ```

---

### Módulo 1 — Grilling Session & Modelagem de Domínio (`/grill-with-docs`)

**Objetivo**: Eliminar ambiguidades nos requisitos antes de escrever qualquer código e consolidar a linguagem ubíqua.

1. Inicie a sessão de entrevista chamando a skill:
   ```text
   /grill-with-docs
   ```
2. Forneça o contexto inicial ao agente:
   > *"Queremos implementar o MVP de Gestão de Tarefas descrito em `docs/user-stories.md`. Quero que você me entreviste sobre as regras de negócio, limites e arquitetura."*
3. **Responda às perguntas desafiadoras do agente**:
   - Status válidos para as tarefas (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
   - Comportamento de exclusão: **Soft Delete** (marcando `deletedAt`) em vez de deleção física.
   - Regras de atualização parcial (semântica de `null` vs `undefined`).
   - Autenticação global via header `x-api-key`.
4. Ao final da entrevista, o agente:
   - Atualiza `CONTEXT.md` com os novos termos e invariantes acordadas.
   - Gera um ADR em `docs/adr/` documentando as decisões estruturais tomadas.

---

### Módulo 2 — Síntese da Especificação Técnica com Seams (`/to-spec`)

**Objetivo**: Transformar a conversa de alinhamento em uma especificação formal com definição clara das costuras de teste (*seams*).

1. Execute no chat:
   ```text
   /to-spec
   ```
2. O agente não fará uma nova entrevista; ele sintetiza o entendimento acumulado:
   - **Declaração do Problema & Solução**: Visão do usuário.
   - **Costuras de Teste (Test Seams)**: Identifica os limites públicos da arquitetura onde os testes serão ancorados (ex: contrato do `TaskRepository`, DTOs de entrada/saída no controller e modelo de domínio).
   - **Decisões de Implementação**: Módulos e interfaces a criar.
   - **Fora de Escopo**: O que não faz parte desta entrega.
3. O agente salva a especificação em:
   ```text
   .scratch/task-management/spec.md
   ```

---

### Módulo 3 — Fatiamento em Tracer Bullets (`/to-tickets`)

**Objetivo**: Dividir a especificação em fatias verticais (*tracer bullets*) com dependências explícitas.

1. Execute no chat:
   ```text
   /to-tickets
   ```
2. O agente propõe a quebra do trabalho em tickets verticais:
   ```text
   Ticket 01: Padronização de Respostas de Erro (ErrorResponse)
   Blocked by: None

   Ticket 02: Autenticação Global por API Key (ApiKeyGuard)
   Blocked by: None

   Ticket 03: Modelo Rico de Domínio Task com Invariantes
   Blocked by: 01

   Ticket 04: Esquema Drizzle e Repositório Concreto de Tarefas
   Blocked by: 03

   Ticket 05: Endpoint POST /tasks (Criar Tarefa)
   Blocked by: 02, 04

   Ticket 06: Endpoint GET /tasks/:id (Consultar Tarefa por ID com Soft Delete)
   Blocked by: 05

   Ticket 07: Endpoint GET /tasks (Listagem Paginada 0-based)
   Blocked by: 05

   Ticket 08: Endpoint PATCH /tasks/:id (Atualização Parcial Semântica)
   Blocked by: 06

   Ticket 09: Endpoint DELETE /tasks/:id (Exclusão Lógica e Interrupção)
   Blocked by: 06
   ```
3. O agente publica os arquivos em `.scratch/task-management/issues/<NN>-<slug>.md`.

---

### Módulo 4 — Implementação com TDD e Seams (`/implement`)

**Objetivo**: Construir as funcionalidades seguindo o ciclo Red-Green-Refactor nas costuras públicas.

1. Escolha um ticket desbloqueado no Frontier (ex: `01-error-response.md` ou `03-task-domain-model.md`).
2. Execute o comando:
   ```text
   /implement .scratch/task-management/issues/03-task-domain-model.md
   ```
3. O agente opera guiado pela skill `/tdd`:
   - **Red**: Cria o arquivo de teste `src/domain/model/task.model.spec.ts` cobrindo as invariantes públicas (título obrigatório, status inicial `PENDING`, soft delete). O teste falha porque o código ainda não existe.
   - **Green**: Escreve o código mínimo em `src/domain/model/task.model.ts` para fazer os testes passarem.
   - **Refactor**: Limpa o código mantendo os testes verdes.
   - **Deep Modules**: Assegura que a classe de domínio expõe uma API concisa e oculta sua complexidade interna (`/codebase-design`).

---

### Módulo 5 — Revisão de Código em Dois Eixos (`/code-review`)

Ao concluir a implementação do ticket, o `/implement` aciona o `/code-review`:

```text
EIXO 1: STANDARDS REVIEW (Padrões de Código)
  * Respeito à Clean Architecture (zero decorators de framework no domínio)
  * Conformidade com regras de linter do Biome
  * Ausência de code smells e métodos acoplados

EIXO 2: SPEC REVIEW (Aderência ao Requisito)
  * Todos os critérios de aceitação do ticket foram atendidos?
  * Os status codes e contratos HTTP respeitam a spec?
```

Com a aprovação da revisão:
- O agente marca o ticket como `Status: resolved`.
- O trabalho é commitado de forma atômica no git.

---

### Módulo 6 — Higiene de Contexto (Context Hygiene)

Entre a execução de um ticket e outro, aplique a técnica ensinada no workshop:

1. Dê `/clear` na janela do chat para descarregar o histórico recente.
2. Invoque o próximo ticket do Frontier:
   ```text
   /implement .scratch/task-management/issues/04-task-repository-drizzle.md
   ```
Como o ticket já contém o `What to build`, o `Blocked by` e os critérios de aceitação, o agente inicia a sessão novo em folha, operando na sua **Smart Zone** máxima de raciocínio.

---

### Módulo 7 — Diagnóstico Disciplinado de Bugs (`/diagnosing-bugs`)

**Objetivo**: Aprender a resolver defeitos complexos sem adivinhação.

Quando surgir um comportamento inesperado (ou uma regressão em testes):
```text
/diagnosing-bugs
```
O agente segue o ciclo rígido:
1. **Feedback Loop Estrito**: Escreve um comando ou teste unitário único que reproduz o defeito em vermelho.
2. **Minimização**: Reduz o cenário à menor carga útil possível.
3. **Formulação de Hipótese**: Levanta a causa raiz baseando-se em código real.
4. **Fix & Teste de Regressão**: Corrige a falha e transforma o teste em teste de regressão durável.

---

### Módulo 8 — Auditoria Arquitetural Contínua (`/improve-codebase-architecture`)

A qualquer momento do desenvolvimento, execute:
```text
/improve-codebase-architecture
```
O agente realiza uma varredura estática no repositório procurando **módulos rasos** (*shallow modules* — classes ou funções que adicionam camadas de indireção sem agregar abstração real) e gera recomendações para aprofundar as interfaces do sistema.

---

## 🎯 Conclusão

Com este workshop, o time substitui o desenvolvimento baseado em palpites (*vibe coding*) por uma **metodologia disciplinada, auditável e altamente produtiva**, aproveitando o poder dos agentes de IA sem abrir mão do rigor técnico da boa engenharia de software.
