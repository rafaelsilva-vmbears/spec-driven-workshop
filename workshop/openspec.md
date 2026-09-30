# Workshop — Trilho B: Spec-Driven Development com OpenSpec & Clean Architecture

> 📍 Este é o **Trilho B** do workshop. Veja o [índice](./README.md), o [guia de setup](./SETUP.md) e o [Trilho A com as skills do Matt Pocock](./mattpocock-skills.md).
>
> **Grafia dos comandos:** este guia escreve `/opsx-<ação>`, que é a forma do **Antigravity**. No **Claude Code** o comando é `/opsx:<ação>` (ex.: `/opsx:propose`); no **Zed** é `/openspec-<ação>` e no **Codex** `$openspec-<ação>`.

> **Construindo uma API REST robusta em NestJS 11 com o fluxo canônico de Engenharia do OpenSpec: Explore, Propose (Design + Specs + Tasks), Apply com TDD nas Costuras Públicas, Sync e Archive.**

---

## 🎯 Objetivo do Workshop

Capacitar o time de engenharia a aplicar **Spec-Driven Development (SDD)** no dia a dia com foco em **engenharia real** — sem "vibe coding", com controle rigoroso de arquitetura e utilizando o **OpenSpec** como motor de especificação formal e rastreabilidade para agentes de IA.

Ao final deste workshop, os desenvolvedores serão capazes de:
1. Explorar e alinhar requisitos complexos com a IA através do **OpenSpec Explore Mode** (`/opsx-explore`), investigando o código, resolvendo dúvidas e identificando regras antes de qualquer linha de implementação.
2. Formalizar mudanças completas através do **OpenSpec Propose** (`/opsx-propose`), gerando simultaneamente:
   - `proposal.md` (Contexto, motivação, escopo e non-goals).
   - `design.md` (Decisões arquiteturais, acordos de costuras públicas/*seams* e trade-offs).
   - `specs/<capability>/spec.md` (Especificação formal com requisitos e cenários).
   - `tasks.md` (Fatiamento em tarefas ordenadas, atômicas e verificáveis).
3. Implementar **uma fatia vertical por vez** através do **OpenSpec Apply** (`/opsx-apply`) utilizando **Test-Driven Development (TDD)** nas **costuras públicas (*seams*)**, blindando a Clean Architecture contra acoplamentos internos frágeis e mantendo a janela de contexto limpa e cirúrgica.
4. Sincronizar especificações duráveis (`/opsx-sync`) e arquivar mudanças concluídas (`/opsx-archive`), mantendo o repositório como a Fonte Única da Verdade (SSOT).
5. Executar testes de jornada E2E com **Playwright** e realizar **Code Review automatizado** em dois eixos (conformidade com padrões + fidelidade à especificação).

---

## 🧠 O Que é Spec-Driven Development (SDD) com OpenSpec?

### 1. Conceito e Filosofia

**Spec-Driven Development (Desenvolvimento Orientado por Especificação)** é uma metodologia de engenharia de software onde a **especificação técnica, funcional e comportamental atua como a Fonte Única da Verdade (SSOT)** *antes* que o código de produção seja implementado.

No modelo tradicional (*Code-First*), o código é escrito diretamente e a documentação é tratada como uma obrigação posterior, gerando *split-brain* entre a visão de produto, a arquitetura planejada e o sistema real em produção:

```text
  TRADICIONAL (Code-First):
  Requisito Vago ──► Código ──► Testes Ajustados ao Código ──► Documentação Obsoleta ❌

  SPEC-DRIVEN DEVELOPMENT COM OPENSPEC (Spec-First):
  User Story ──► OpenSpec (Proposal + Design + Specs) ──► Código TDD ──► Verificação Contínua ✅
                       ▲                                                     │
                       └───────────── Rastreabilidade e Sync ────────────────┘
```

### 2. O Papel do OpenSpec

O **OpenSpec** é um padrão aberto e ferramenta CLI projetada para estruturar o ciclo de vida de desenvolvimento guiado por especificações com agentes de IA:

- **Especificações Duráveis (`openspec/specs/`):** O inventário vivo das capacidades que o sistema possui. Não representam tarefas passageiras, mas o comportamento durável documentado em requisitos e cenários auditáveis.
- **Mudanças em Voo (`openspec/changes/<change-name>/`):** O espaço de trabalho atômico para uma nova demanda. Cada *change* contém sua própria proposta, design técnico, delta de especificações e lista de tarefas.
- **Guardrail Inegociável para Agentes de IA:** O agente não adivinha contratos HTTP, schemas de banco ou regras de negócio; ele implementa rigorosamente o que o `design.md` e a `spec.md` definem.

---

## ⚡ O Ciclo de Vida Canônico do OpenSpec

O fluxo de trabalho durante o desenvolvimento de qualquer feature segue as fases fundamentais do OpenSpec:

```text
+-----------------------------------------------------------------------------------------+
|                              O CICLO DE VIDA DO OPENSPEC                                |
+-----------------------------------------------------------------------------------------+

  1. EXPLORAR & ALINHAR          2. PROPOR MUDANÇA              3. IMPLEMENTAR TAREFAS
     /opsx-explore          ──►     /opsx-propose          ──►     /opsx-apply
     (Investiga o código,           (Gera proposal.md,             (Executa UMA tarefa
      discute trade-offs e           design.md, specs/              do tasks.md por vez,
      elimina ambiguidades)          e tasks.md fatiado)            com TDD nas costuras)
                                                                          │
                                                                          ▼
                                 5. SINCRONIZAR & ARQUIVAR      4. VALIDAR & REVISAR
                                    /opsx-sync & /opsx-archive ◄── openspec validate
                                    (Promove delta a spec viva     + Playwright E2E
                                     e arquiva a change)           + /code-review
```

---

## 🔑 Pilares de Engenharia Praticados no Workshop

### 1. Separação Estrita entre Planejar e Implementar
- No **Explore Mode** (`/opsx-explore`), o agente investiga o código e debate ideias, mas **nunca escreve código de produção**.
- No **Propose Mode** (`/opsx-propose`), o agente formaliza a arquitetura, as especificações e a decomposição em tarefas, mas **também não escreve código de produção**.
- A escrita de código de produção ocorre exclusivamente no **Apply Mode** (`/opsx-apply`), consumindo uma tarefa por vez.

### 2. Costuras Públicas (*Seams*) vs. Acoplamento a Detalhes Internos
- Testes não devem validar queries SQL privadas, métodos auxiliares ou tabelas intermediárias.
- Uma **costura pública (*seam*)** é a fronteira observável onde o comportamento pode ser exercitado e verificado:
  - *Seam de Negócio:* Casos de uso exercitados com mocks das portas abstratas (`TaskRepository`).
  - *Seam de Integração HTTP:* Testes de controllers com validação de pipes e DTOs via Supertest.
  - *Seam Superior:* Playwright disparando requisições HTTP reais contra a aplicação compilada em container.

### 3. Fatiamento Vertical (*Tracer Bullets*) no `tasks.md`
- O `tasks.md` do OpenSpec é fatiado verticalmente: cada tarefa constrói uma fatia fina e completa de ponta a ponta (DTO ➔ Controller ➔ UseCase ➔ Domínio ➔ Banco ➔ Teste da fatia).
- Evita-se o fatiamento horizontal (criar todas as tabelas, depois todos os repositórios, depois todos os controllers), reduzindo riscos de integração tardia.

### 4. Higiene de Contexto (*Smart Zone*)
- Em sessões com agentes de IA, cada tarefa do `tasks.md` deve ser executada de forma focada e atômica.
- Implementar uma tarefa por vez com `/opsx-apply` evita poluição de contexto, alucinações de código e mistura de responsabilidades entre User Stories distintas.

---

## 🛠️ Pré-requisitos & Ferramental

- **Node.js**: 22+
- **Gerenciador de Pacotes**: pnpm 11+
- **Banco de Dados**: Docker & Docker Compose (PostgreSQL)
- **OpenSpec CLI**: Instalada globalmente (`npm install -g @fission-ai/openspec@latest`)
- **Editor / Agente**: Claude Code, Zed, Codex ou Antigravity — a instalação é feita por você na Etapa 0 (ver [SETUP.md](./SETUP.md))

---

## 🗺️ Mapa de Etapas do Workshop

| Etapa | Título | Skill / Comando | O Que Demonstra |
| :---: | ------ | :-------------- | --------------- |
| **0** | [Setup & Inicialização do OpenSpec](#etapa-0--setup-e-inicialização-do-openspec) | `openspec init` + `config.yaml` | Setup do zero: CLI, root do projeto, contexto do template e política de commits. |
| **1** | [Bootstrap & Análise Arquitetural](#etapa-1--bootstrap-e-análise-arquitetural) | `/opsx-explore` | Exploração da Clean Architecture, deep modules e portas abstratas. |
| **2** | [Exploração e Alinhamento das User Stories](#etapa-2--exploração-e-alinhamento-das-user-stories) | `/opsx-explore` | Estresse dos requisitos de `workshop/user-stories/README.md`, eliminação de ambiguidades. |
| **3** | [Proposta da Change dos Enablers Transversais](#etapa-3--proposta-da-change-dos-enablers-transversais) | `/opsx-propose` | Especificação e decomposição das US-007 e US-006 no `tasks.md`. Zero código escrito aqui. |
| **4** | [Enabler 1: Padronização de Respostas de Erro (US-007)](#etapa-4--enabler-1-padronização-de-respostas-de-erro-us-007) | `/opsx-apply` | Execução isolada da Tarefa 1 com TDD: `DomainException` e `GlobalExceptionFilter`. |
| **5** | [Enabler 2: Autenticação via API Key Guard (US-006)](#etapa-5--enabler-2-autenticação-via-api-key-guard-us-006) | `/opsx-apply` | Execução isolada da Tarefa 2 com TDD: `ApiKeyGuard` e decorator `@Public()`. |
| **6** | [Proposta da Change de Gestão de Tarefas](#etapa-6--proposta-da-change-de-gestão-de-tarefas) | `/opsx-propose` | Design arquitetural, delta spec e fatiamento em 5 tarefas no `tasks.md`. Zero código escrito aqui. |
| **7** | [Tracer Bullet 1: Criação de Tarefa (US-001)](#etapa-7--tracer-bullet-1-criação-de-tarefa-us-001) | `/opsx-apply` | Execução da Tarefa 1: entidade rica `Task.create`, DIP, Drizzle e `POST /tasks`. |
| **8** | [Tracer Bullet 2: Consulta por ID (US-003)](#etapa-8--tracer-bullet-2-consulta-por-id-us-003) | `/opsx-apply` | Execução da Tarefa 2: `ParseUUIDPipe`, soft delete e `GET /tasks/:id`. |
| **9** | [Tracer Bullet 3: Listagem Paginada (US-002)](#etapa-9--tracer-bullet-3-listagem-paginada-us-002) | `/opsx-apply` | Execução da Tarefa 3: paginação 0-based, contagem atômica e `GET /tasks`. |
| **10** | [Tracer Bullet 4: Atualização Parcial (US-004)](#etapa-10--tracer-bullet-4-atualização-parcial-us-004) | `/opsx-apply` | Execução da Tarefa 4: PATCH semântico, No-op e `PATCH /tasks/:id`. |
| **11** | [Tracer Bullet 5: Remoção Lógica (US-005)](#etapa-11--tracer-bullet-5-remoção-lógica-us-005) | `/opsx-apply` | Execução da Tarefa 5: soft delete (`deletedAt`), HTTP 204 e `DELETE /tasks/:id`. |
| **12** | [Validação de Jornada E2E e Code Review](#etapa-12--validação-de-jornada-e2e-e-code-review) | Playwright + `/code-review` | Bateria de jornada black-box via HTTP real e revisão em dois eixos. |
| **13** | [Sincronização e Arquivamento OpenSpec](#etapa-13--sincronização-e-arquivamento-openspec) | `/opsx-sync` & `/opsx-archive` | Promoção de delta specs a specs duráveis e arquivamento das changes. |

---

## Etapa 0 — Setup e Inicialização do OpenSpec

**Objetivo:** Partir do template limpo e deixar o OpenSpec pronto no seu editor, sem nenhuma configuração prévia.

Siga a **[Etapa 0 comum (SETUP.md)](./SETUP.md)**, seções 1, 2 e 4. Em resumo:

1. Clone o template, crie a branch de exercício e valide `pnpm check && pnpm build && pnpm test`.
2. Instale a CLI e inicialize o OpenSpec para o seu editor:
   ```bash
   npm install -g @fission-ai/openspec@latest
   openspec init --tools claude,antigravity --no-animation .   # um id por editor que você vai usar
   openspec list --json                              # "root" não pode ser null
   ```
3. Cole no `openspec/config.yaml` o bloco de contexto, regras e **política de commits** descrito no [SETUP.md](./SETUP.md#4-trilho-b--inicializar-o-openspec). Sem ele, o `/opsx:apply` não conhece as regras do template nem a proibição de comitar sem autorização.

O `openspec init` cria `openspec/config.yaml`, `openspec/specs/`, `openspec/changes/` e as skills/comandos `openspec-*` para cada editor listado em `--tools`. As skills do template em `.agents/skills/` permanecem intactas, e você pode alternar entre os editores configurados ao longo das etapas.

---

## Etapa 1 — Bootstrap e Análise Arquitetural

**Objetivo:** Compreender a topologia da Clean Architecture no repositório sob a ótica de módulos profundos antes de criar código.

Invocamos a skill de exploração:
```text
Usuário: /opsx-explore Analise a estrutura de src/ e os padrões de Clean Architecture definidos no AGENTS.md.
```

### O Que é um Deep Module no NestJS?
```text
                 INTERFACE ESTREITA (Fácil de usar, difícil de errar)
                                │
                TaskController.create(dto: CreateTaskDto)
                                │
                                ▼
  ┌─────────────────────────────────────────────────────────────┐
  |                 IMPLEMENTAÇÃO PROFUNDA                      |
  |                                                             |
  |  • Validação rigorosa de invariantes (Task.create)         |
  |  • Geração de UUID v4 determinístico                        |
  |  • Timestamping em UTC                                      |
  |  • Desacoplamento via Port Abstrato (TaskRepository)        |
  |  • Mapeamento de persistência com Drizzle ORM               |
  |  • Propagação controlada de falhas para o filtro global     |
  └─────────────────────────────────────────────────────────────┘
```

Validamos a compilação inicial e os linters:
```bash
pnpm check       # Biome: validação e formatação
pnpm build       # Compilação estrita TypeScript
pnpm test        # Testes unitários com Vitest
```

---

## Etapa 2 — Exploração e Alinhamento das User Stories

**Objetivo:** Analisar criticamente as User Stories em `workshop/user-stories/README.md` para eliminar ambiguidades antes de gerar a especificação formal.

Invocamos:
```text
Usuário: /opsx-explore Analise as User Stories em workshop/user-stories/ para o MVP de Gestão de Tarefas e aponte decisões de arquitetura e regras de negócio pendentes.
```

### Decisões Cruciais Alinhadas:
1. **Padronização de Erros (US-007):** Todas as falhas retornam `{ code, message, details? }` através de um `GlobalExceptionFilter` interceptando exceções de negócio (`DomainException`) e de validação.
2. **Autenticação (US-006):** Padrão *Secure by Default* com `ApiKeyGuard` no cabeçalho `x-api-key`, liberando rotas públicas via decorator `@Public()`.
3. **Exclusão de Tarefas (US-005):** Categoricamente **Soft Delete** (`deletedAt = new Date()`), retornando HTTP 204 No Content.
4. **Semântica No-Op no PATCH (US-004):** Se o payload não trouxer alterações efetivas, a API responde 200 OK sem disparar queries no PostgreSQL nem alterar `updatedAt`.

---

## Etapa 3 — Proposta da Change dos Enablers Transversais

**Objetivo:** Especificar a infraestrutura transversal de erros e autenticação (US-007 e US-006) e gerar a lista de tarefas no `tasks.md`.

> 💡 **Nota Importante:** Nesta etapa **NENHUM CÓDIGO É IMPLEMENTADO**. O `/opsx-propose` apenas elabora o contrato, o design e planeja as tarefas atômicas.

Executamos o comando de proposta:
```text
Usuário: /opsx-propose Especificar padronização global de erros (US-007) e autenticação universal via API Key (US-006)
```

O comando gera em `openspec/changes/standardize-errors-and-auth/`:
- `proposal.md`: Contexto, justificativa e regras transversais.
- `design.md`: Arquitetura do `GlobalExceptionFilter`, hierarquia de `DomainException` e `ApiKeyGuard`.
- `specs/api-standards/spec.md`: Delta de especificação formal dos requisitos de segurança e erros.
- `tasks.md`: Contendo duas tarefas atômicas bem delimitadas:
  - `- [ ] Task 1: Implementar padronização de erros (US-007)`
  - `- [ ] Task 2: Implementar autenticação via API Key Guard (US-006)`

Validamos a consistência da proposta:
```bash
openspec validate --change "standardize-errors-and-auth"
```

---

## Etapa 4 — Enabler 1: Padronização de Respostas de Erro (US-007)

**Objetivo:** Implementar **exclusivamente a Task 1** planejada na etapa anterior, utilizando TDD no seam de tratamento de exceções.

Invocamos a implementação da tarefa:
```text
Usuário: /opsx-apply Execute a Task 1 (Padronização de Erros - US-007) da change standardize-errors-and-auth usando TDD.
```

### Ciclo TDD nas Costuras:
1. **Red:** Escrever o teste unitário de `GlobalExceptionFilter` em `src/adapters/api/filters/global-exception.filter.spec.ts` verificando que o disparo de uma `DomainException` resulta no formato JSON `{ code, message, details? }` com o status HTTP correspondente.
2. **Green:**
   - Criar `DomainException` pura em `src/domain/exception/domain-exception.ts`.
   - Implementar `GlobalExceptionFilter` em `src/adapters/api/filters/global-exception.filter.ts`.
   - Tratar `BadRequestException` do `ValidationPipe` mapeando para `code: "VALIDATION_ERROR"`.
3. **Refactor:** Registrar globalmente no `AppModule` como `APP_FILTER`.
4. **Verificação:** Rodar `pnpm test` e marcar a Task 1 como concluída no `tasks.md`.

---

## Etapa 5 — Enabler 2: Autenticação via API Key Guard (US-006)

**Objetivo:** Implementar **exclusivamente a Task 2** da change de enablers, garantindo o princípio *Secure by Default*.

Invocamos a implementação da tarefa:
```text
Usuário: /opsx-apply Execute a Task 2 (API Key Guard - US-006) da change standardize-errors-and-auth usando TDD.
```

### Ciclo TDD nas Costuras:
1. **Red:** Escrever teste unitário de `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.spec.ts` verificando:
   - Requisição sem cabeçalho `x-api-key` ➔ lança `UnauthorizedException` (401).
   - Cabeçalho com valor divergente de `API_KEY` ➔ lança `UnauthorizedException` (401).
   - Rota decorada com `@Public()` ➔ autoriza acesso mesmo sem o cabeçalho.
   - Cabeçalho válido ➔ autoriza acesso.
2. **Green:**
   - Criar decorator `@Public()` em `src/adapters/api/decorators/public.decorator.ts`.
   - Implementar `ApiKeyGuard` injetando `Reflector` e `ConfigService`.
3. **Refactor:** Registrar globalmente no `AppModule` como `APP_GUARD`.
4. **Verificação:** Rodar `pnpm test` e marcar a Task 2 como concluída no `tasks.md`.

---

## Etapa 6 — Proposta da Change de Gestão de Tarefas

**Objetivo:** Formalizar a arquitetura e a especificação funcional do CRUD de Tarefas (US-001 a US-005) e decompô-la em tarefas sequenciais (*Tracer Bullets*).

> 🛑 **Atenção Pedagógica:** Esta etapa **NÃO escreve código de produção**. Aqui o OpenSpec atua como a ferramenta de arquitetura e decomposição, gerando o `tasks.md` fatiado em 5 tarefas. As Etapas 7 a 11 implementarão cada tarefa individualmente!

Invocamos:
```text
Usuário: /opsx-propose Especificar a arquitetura e os contratos funcionais do CRUD de Tarefas conforme US-001 a US-005
```

O OpenSpec scaffolda `openspec/changes/task-management-crud/` com:
- `proposal.md`: Contexto do domínio e escopo de tarefas.
- `design.md`: Modelo da entidade rica `Task`, Drizzle schema e port abstrato `TaskRepository`.
- `specs/task-management/spec.md`: Especificação com requisitos (`SHALL`) e cenários BDD para cada US.
- `tasks.md`: Fatiamento em 5 tarefas atômicas sequenciais:
  - `- [ ] Task 1: US-001 Criar Tarefa`
  - `- [ ] Task 2: US-003 Consultar Tarefa por ID`
  - `- [ ] Task 3: US-002 Listar Tarefas Paginadas`
  - `- [ ] Task 4: US-004 Atualizar Tarefa Parcialmente`
  - `- [ ] Task 5: US-005 Remover Tarefa (Soft Delete)`

---

## Etapa 7 — Tracer Bullet 1: Criação de Tarefa (US-001)

**Objetivo:** Implementar **exclusivamente a Task 1** da change de tarefas.

Invocamos:
```text
Usuário: /opsx-apply Execute a Task 1 (Criação de Tarefa - US-001) da change task-management-crud usando TDD.
```

### 1. Entidade Rica de Domínio (`Task`)
Desenvolvida com TDD puro em `src/domain/model/task.model.spec.ts`:
- Validação no construtor ou método de fábrica: título de 3 a 100 caracteres.
- Status inicial obrigatório: `TaskStatus.PENDING`.
- Zero dependências de NestJS ou decorators na camada de domínio.

### 2. Inversão de Dependência com Classes Abstratas
Contrato em `src/domain/ports/repository/task.repository.ts`:
```typescript
export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>
  abstract findById(id: string): Promise<Task | null>
  abstract findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>
  abstract update(task: Task): Promise<Task>
  abstract delete(id: string): Promise<void>
}
```

### 3. Persistência Drizzle ORM
- Tabela tipada em `src/adapters/database/schemas/task.schema.ts`.
- Repositório concreto `TaskRepositoryImpl` implementando a porta abstrata.
- Controller `TaskController` com `POST /tasks`, validando com `CreateTaskDto` e respondendo HTTP 201 Created.

---

## Etapa 8 — Tracer Bullet 2: Consulta por ID (US-003)

**Objetivo:** Implementar **exclusivamente a Task 2** da change de tarefas.

Invocamos:
```text
Usuário: /opsx-apply Execute a Task 2 (Consulta por ID - US-003) da change task-management-crud usando TDD.
```

### Destaques de Engenharia:
1. **Validação na Borda:** `new ParseUUIDPipe({ version: '4' })` rejeita IDs malformatados antes de alcançar o use case.
2. **Query Drizzle Defensiva:**
   ```typescript
   and(eq(tasks.id, id), isNull(tasks.deletedAt))
   ```
3. **Exceção de Negócio:** Se a tarefa não existir ou estiver excluída logicamente, o use case lança `TaskNotFoundException`, mapeada para HTTP 404 (`code: "TASK_NOT_FOUND"`).

---

## Etapa 9 — Tracer Bullet 3: Listagem Paginada (US-002)

**Objetivo:** Implementar **exclusivamente a Task 3** da change de tarefas.

Invocamos:
```text
Usuário: /opsx-apply Execute a Task 3 (Listagem Paginada - US-002) da change task-management-crud usando TDD.
```

### Destaques de Engenharia:
1. **Query Params Defensivos:** `page = 0`, `pageSize = 10`, `@Max(100)`.
2. **Contagem Atômica Paralela:**
   ```typescript
   const [items, [{ total }]] = await Promise.all([
     this.db.select().from(tasks).where(isNull(tasks.deletedAt)).limit(pageSize).offset(page * pageSize),
     this.db.select({ total: count() }).from(tasks).where(isNull(tasks.deletedAt)),
   ])
   ```
3. **Resposta Padronizada:** Retorno de `{ items, total, page, pageSize }`.

---

## Etapa 10 — Tracer Bullet 4: Atualização Parcial (US-004)

**Objetivo:** Implementar **exclusivamente a Task 4** da change de tarefas.

Invocamos:
```text
Usuário: /opsx-apply Execute a Task 4 (Atualização Parcial - US-004) da change task-management-crud usando TDD.
```

### Destaques de Engenharia:
1. **Semântica `null` vs `undefined`:**
   - `undefined`: mantém o valor existente do campo.
   - `null`: limpa o valor da descrição opcional.
2. **Otimização No-op:** Se nenhuma alteração for detectada em relação ao estado atual, o use case retorna a entidade imediatamente sem disparar queries de `UPDATE` no banco de dados.
3. **Mutação Segura na Entidade:** Método `task.update()` aplica as alterações e atualiza `updatedAt`.

---

## Etapa 11 — Tracer Bullet 5: Remoção Lógica (US-005)

**Objetivo:** Implementar **exclusivamente a Task 5** da change de tarefas, concluindo o ciclo de vida.

Invocamos:
```text
Usuário: /opsx-apply Execute a Task 5 (Remoção Lógica - US-005) da change task-management-crud usando TDD.
```

### Destaques de Engenharia:
1. **Soft Delete Real:** O use case atualiza `deletedAt = new Date()`.
2. **Validação de Existência:** Se a tarefa já estiver excluída ou não existir, lança `TaskNotFoundException` (HTTP 404).
3. **Contrato HTTP:** Rota `DELETE /tasks/:id` decorada com `@HttpCode(HttpStatus.NO_CONTENT)` respondendo 204 sem corpo.

---

## Etapa 12 — Validação de Jornada E2E e Code Review

**Objetivo:** Validar a API de ponta a ponta na costura pública máxima e auditar o código sob dois eixos.

### 1. Testes de Jornada com Playwright (`tests/playwright/tasks-api.pw.ts`)

O template não traz o Playwright. Instale e configure seguindo a [seção 6 do SETUP.md](./SETUP.md#6-preparar-o-playwright-antes-da-etapa-12) antes de pedir ao agente para escrever a jornada.

O Playwright atua como um cliente HTTP externo caixa-preta:
- Cria tarefa (`POST /tasks` ➔ 201).
- Consulta tarefa por id (`GET /tasks/:id` ➔ 200).
- Atualiza status para `IN_PROGRESS` (`PATCH /tasks/:id` ➔ 200).
- Verifica presença na listagem paginada (`GET /tasks` ➔ 200).
- Remove tarefa logicamente (`DELETE /tasks/:id` ➔ 204).
- Confirma que a consulta subsequente retorna 404 (`TASK_NOT_FOUND`).
- Confirma que requisição sem cabeçalho `x-api-key` retorna 401 (`UNAUTHORIZED`).

### 2. Quality Gates & Code Review
```bash
pnpm check              # Biome: linter e formatação estrita
pnpm build              # TypeScript: compilação estrita sem any
pnpm test               # Vitest: 100% dos testes unitários passando
pnpm test:pw            # Playwright: jornada completa sobre HTTP real
```

Invocamos o Code Review automatizado em dois eixos:
```text
Usuário: /code-review HEAD~5...HEAD
```
- **Eixo Standards:** Conformidade com `docs/CODING_STANDARDS.md`, ausência de *code smells* e aderência à Clean Architecture.
- **Eixo Spec Fidelity:** Rastreabilidade entre a implementação e os requisitos definidos na spec do OpenSpec.

---

## Etapa 13 — Sincronização e Arquivamento OpenSpec

**Objetivo:** Promover os deltas de especificação a capacidades duráveis e arquivar as mudanças concluídas.

1. **Validação final da mudança:**
   ```bash
   openspec validate --change "task-management-crud"
   ```
2. **Sincronização dos deltas de spec (`/opsx-sync`):**
   Atualiza as especificações principais em `openspec/specs/` com os novos requisitos comprovadamente entregues:
   ```text
   Usuário: /opsx-sync task-management-crud
   ```
3. **Arquivamento da mudança (`/opsx-archive`):**
   Move a mudança de `openspec/changes/` para o histórico auditável:
   ```text
   Usuário: /opsx-archive task-management-crud
   ```
4. **Verificação do inventário de capacidades:**
   ```bash
   openspec list --specs
   ```
   Agora o repositório reflete duravelmente as capacidades `api-standards` e `task-management` como especificações ativas.

---

## 🧭 Cheat Sheet: Comandos do OpenSpec

| Ação | Slash Command (Antigravity / Claude Code / Zed) | CLI Command | Finalidade |
|---|---|---|---|
| **Explorar** | `/opsx-explore` · `/opsx:explore` · `/openspec-explore` | — | Pensar, investigar arquitetura e alinhar regras sem codificar. |
| **Propor** | `/opsx-propose "<ideia>"` · `/opsx:propose` · `/openspec-propose` | `openspec new change "<slug>"` | Gerar `proposal.md`, `design.md`, `specs/` e `tasks.md`. Não implementa código. |
| **Implementar** | `/opsx-apply` · `/opsx:apply` · `/openspec-apply-change` | `openspec instructions <artifact>` | Implementar **uma tarefa por vez** do `tasks.md` guiado por TDD. |
| **Status** | — | `openspec status --change "<slug>"` | Inspecionar estado dos artefatos e tarefas da mudança. |
| **Validar** | — | `openspec validate --change "<slug>"` | Verificar consistência e schema dos artefatos. |
| **Sincronizar** | `/opsx-sync` · `/opsx:sync` · `/openspec-sync-specs` | `openspec sync` | Promover delta specs para o inventário durável de specs. |
| **Arquivar** | `/opsx-archive` · `/opsx:archive` · `/openspec-archive-change` | `openspec archive "<slug>"` | Arquivar a mudança após conclusão integral. |
| **Listar Specs** | — | `openspec list --specs` | Listar capacidades duráveis já implementadas no sistema. |

---

## 🏆 Conclusão do Workshop

Ao término do workshop, a equipe compreende a essência do **Spec-Driven Development com OpenSpec**:
- **Especificações não são burocracia:** são contratos formais que alinham negócio e código, servindo de guardrail estrito para a IA.
- **Explore antes de Propor:** alinhar ideias no modo explore custa minutos; corrigir suposições erradas após a codificação custa dias.
- **Proposta não é Código:** `/opsx-propose` apenas desenha a solução e decompõe em tarefas; o código é gerado com foco cirúrgico no `/opsx-apply`.
- **Tracer Bullets garantem previsibilidade:** tarefas verticais estreitas eliminam o "inferno de integração" e mantêm o modelo de IA focado e preciso.
- **TDD nas costuras públicas liberta o código:** refatorações de infraestrutura tornam-se triviais quando os testes validam apenas fronteiras observáveis.
- **Specs Duráveis eliminam o split-brain:** o repositório mantém documentação sempre atualizada e sincronizada com o código que está rodando em produção.
