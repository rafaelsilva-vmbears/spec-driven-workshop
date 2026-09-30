# Workshop — Trilho A: Spec-Driven Development com Agentic Skills (Matt Pocock)

> 📍 Este é o **Trilho A** do workshop. Veja o [índice](./README.md), o [guia de setup](./SETUP.md) e o [Trilho B com OpenSpec](./openspec.md).

> **Construindo uma API REST robusta em NestJS 11 com o fluxo canônico de Engenharia: Grilling, Specs, Tracer Bullets, TDD nas Costuras Públicas e Code Review em Dois Eixos.**

---

## 🎯 Objetivo do Workshop

Capacitar o time de engenharia a aplicar **Spec-Driven Development (SDD)** no dia a dia com foco em **engenharia real** — sem "vibe coding" e sem aprisionamento em frameworks monolíticos ou engessados.

Ao final deste workshop, os desenvolvedores serão capazes de:
1. Alinhar e estressar requisitos com a IA via **sabatina técnica profunda** (`/grill-with-docs`), atualizando o **Glossário Ubíquo** em `CONTEXT.md` e registrando **ADRs** para decisões irreversíveis.
2. Gerar especificações canônicas e não ambíguas utilizando a skill `/to-spec`, definindo as **costuras públicas (*seams*)** antes do código.
3. Fatiar entregas em **Tracer Bullets (fatias verticais)** com dependências explícitas através de `/to-tickets`.
4. Implementar cada fatia utilizando **Test-Driven Development (TDD)** nas **costuras públicas (*seams*)**, blindando o código contra acoplamentos internos frágeis.
5. Executar **Code Review automatizado em dois eixos paralelos** (conformidade com padrões + fidelidade à especificação).

---

## 🧠 O Que é Spec-Driven Development (SDD)?

### 1. Conceito e Filosofia

**Spec-Driven Development (Desenvolvimento Orientado por Especificação)** é uma metodologia de engenharia de software onde a **especificação técnica, funcional e comportamental atua como a Fonte Única da Verdade (SSOT)** *antes* que o código de produção seja implementado.

No modelo tradicional (*Code-First*), o código é escrito diretamente e a documentação é tratada como uma obrigação posterior (ou negligenciada), tornando-se obsoleta quase de imediato e gerando o clássico problema de *split-brain* entre a visão de produto, a arquitetura planejada e o sistema real em produção.

No **SDD**, o paradigma se inverte:

```text
  TRADICIONAL (Code-First):
  Requisito Vago ──► Código ──► Testes Ajustados ao Código ──► Documentação Obsoleta ❌

  SPEC-DRIVEN DEVELOPMENT (Spec-First):
  User Story ──► Especificação Formal ──► Código Fiel à Spec ──► Testes Validando a Spec ✅
                       ▲                                                    │
                       └───────────── Verificação Contínua ─────────────────┘
```

### 2. Objetivos Centrais do SDD

- **Contrato Imutável e Transparente**: Alinha Produto, Arquitetura, Engenharia e QA sob uma linguagem técnica inequívoca antes de investir tempo em codificação.
- **Rastreabilidade Total Ponta a Ponta**: Cada linha de código, endpoint e teste possui rastreabilidade direta para a especificação formal e os critérios de aceitação da User Story.
- **Eliminação de Ambiguidade e Retrabalho**: Suposições e lacunas de negócio são resolvidas na fase de modelagem e design, evitando refatorações estruturais caras após o código estar pronto.
- **Desenvolvimento Paralelo Desacoplado**: Engenheiros de front-end e QA podem criar contratos de integração, mocks e suítes de testes imediatamente a partir da spec, sem esperar pela conclusão do back-end.

### 3. Por que SDD é Fundamental na Era dos Agentes de IA?

Modelos de linguagem (LLMs) são excepcionais em gerar código, mas quando atuam no modelo *Code-First* sem limites claros, sofrem com **alucinações, desvios de arquitetura, suposições silenciosas e "vibe coding"**.

Com **Spec-Driven Development**, a dinâmica se transforma:
- A especificação formal atua como o **guardrail inegociável** para a IA.
- O agente não precisa "adivinhar" regras de negócio ou contratos HTTP.
- O time de engenharia mantém **controle total da arquitetura**, enquanto a IA acelera a implementação e a cobertura de testes com precisão cirúrgica.

---

## ⚡ A Cadeia Canônica das Agentic Skills (Matt Pocock)

Diferente de frameworks monolíticos ou engessados que tentam assumir o processo inteiro por meio de CLIs complexas, as **Skills for Real Engineers** (Matt Pocock) formam uma cadeia modular, enxuta e comprovada na prática:

```text
+-----------------------------------------------------------------------------------------+
|                               A CADEIA CANÔNICA DO WORKSHOP                             |
+-----------------------------------------------------------------------------------------+

  1. SABATINA & MODELAGEM      2. ESPECIFICAÇÃO       3. DECOMPOSIÇÃO
     /grill-with-docs      ──►     /to-spec       ──►    /to-tickets
     (Estressa USs, gera           (Sintetiza sem         (Fatia em Tracer
      ADRs e CONTEXT.md)            entrevista + Seams)    Bullets com blockers)
                                                                │
                                                                ▼
                               4. REVISÃO DOIS EIXOS  5. IMPLEMENTAÇÃO & TDD
                                   /code-review   ◄──    /implement + /tdd
                                   (Standards + Spec      (Red-Green-Refactor
                                    em subagentes)         nas costuras públicas)
```

---

## 🔑 Pilares de Engenharia Ensinados no Workshop

### 1. Sabatina Técnica (*Grilling*) antes da Spec
- O `/to-spec` possui uma regra estrita: **ele não entrevista o usuário**, apenas sintetiza o que já foi alinhado.
- Por isso, a sabatina (`/grill-with-docs`) é o coração do alinhamento: a IA atua como uma Staff Engineer desafiando o desenvolvedor sobre *edge cases*, códigos de erro, semântica de *no-op* e decisões de arquitetura em rodadas sucessivas, alimentando o `CONTEXT.md` e criando ADRs inline.

### 2. Costuras Públicas (*Seams*) vs. Acoplamento a Detalhes Internos
- Testes não devem validar queries SQL privadas, tabelas internas ou métodos auxiliares protegidos.
- Uma **costura pública (*seam*)** é a fronteira observável onde o comportamento pode ser exercitado e verificado (ex.: o contrato HTTP do endpoint ou o método de uma porta abstrata). Testes nas costuras sobrevivem a refatorações estruturais sem quebrar.

### 3. Fatiamento Vertical (*Tracer Bullets*) vs. Fatiamento Horizontal
- **Abordagem Horizontal (Frágil):** Criar todas as tabelas, depois todos os repositórios, depois todos os controllers. Gera risco de integração tardia e feedbacks lentos.
- **Abordagem Vertical (*Tracer Bullet*):** Cada ticket constrói uma fatia fina e completa de ponta a ponta (DTO ➔ Controller ➔ UseCase ➔ Domínio ➔ Banco ➔ Teste E2E da fatia). Cada incremento é demonstrável e verificável de imediato.

### 4. Módulos Profundos (*Deep Modules*)
- Baseado em *A Philosophy of Software Design* (John Ousterhout): módulos devem ter **interfaces estreitas e simples** que escondem uma **implementação rica e poderosa**. No NestJS, controllers e use cases mantêm contratos enxutos, enquanto invariantes complexas ficam encapsuladas nas entidades de domínio.

### 5. Higiene de Contexto e Limites de Fase (*Phase Boundaries*)
- Em sessões com agentes de IA, saber o que fazer com a janela de contexto entre fases é crítico:
  - **Entre Grilling, Spec e Tickets:** Manter o contexto (`Continue`) para que o `/to-spec` e `/to-tickets` usem os fatos recém-decididos sem truncamento.
  - **Entre Tickets:** Executar cada ticket em uma janela fresca ou com subagentes (`/implement` por fatia).
  - **Dúvidas no Fluxo:** Invocar `/ask-matt` como o roteador inteligente que orienta qual skill usar.

---

## 🛠️ Pré-requisitos & Ferramental

- **Node.js**: 22+
- **Gerenciador de Pacotes**: pnpm 11+
- **Banco de Dados**: Docker & Docker Compose (PostgreSQL)
- **Editor / Agente**: Claude Code, Zed, Antigravity IDE ou Codex
- **Skills de Engenharia**: já estão em `.agents/skills/` no template; a instalação no seu editor é feita por você na Etapa 0 (ver [SETUP.md](./SETUP.md))

---

## 🗺️ Mapa de Etapas do Workshop

| Etapa | Título | Skill / Ferramenta | O Que Demonstra |
| :---: | ------ | :----------------- | --------------- |
| **0** | [Setup & Governança Inicial](#etapa-0--setup-e-governança-inicial) | `/setup-matt-pocock-skills` | Configuração do tracker local em `.scratch/` e convenções do repositório. |
| **1** | [Bootstrap & Deep Modules](#etapa-1--bootstrap-e-deep-modules) | `/codebase-design` | Análise da base NestJS 11 sob a ótica de módulos profundos e interfaces estreitas. |
| **2** | [Sabatina Técnica & Domínio](#etapa-2--sabatina-técnica-e-modelagem-de-domínio) | `/grill-with-docs` | Sabatina das USs do PO: estressa edge cases, afia `CONTEXT.md` e gera ADRs. |
| **3** | [Especificação Formal com Seams](#etapa-3--especificação-formal-com-seams) | `/to-spec` | Geração da Spec canônica com User Stories extensas, decisões e costuras de teste. |
| **4** | [Decomposição em Tracer Bullets](#etapa-4--decomposição-em-grafo-de-tracer-bullets) | `/to-tickets` | Criação do grafo de dependências e arquivos de tickets com `Blocked by:`. |
| **5** | [Enabler 1: Respostas de Erro (US-007)](#etapa-5--enabler-1-padronização-de-erros-us-007) | `/implement` + `/tdd` | `DomainException` e `GlobalExceptionFilter` com testes na costura HTTP. |
| **6** | [Enabler 2: API Key Guard (US-006)](#etapa-6--enabler-2-api-key-guard-us-006) | `/implement` + `/tdd` | Princípio Secure by Default (`APP_GUARD`) e decorator `@Public()`. |
| **7** | [Tracer Bullet 1: Criar Tarefa (US-001)](#etapa-7--tracer-bullet-1-criação-de-tarefa-us-001) | `/implement` + `/tdd` | Entidade rica de domínio, DIP via classes abstratas, Drizzle ORM e teste de fatia. |
| **8** | [Tracer Bullet 2: Consultar Tarefa (US-003)](#etapa-8--tracer-bullet-2-consulta-por-id-us-003) | `/implement` + `/tdd` | Leitura unitária, validação de UUID e filtro defensivo de soft delete. |
| **9** | [Tracer Bullet 3: Listar com Paginação (US-002)](#etapa-9--tracer-bullet-3-listagem-paginada-us-002) | `/implement` + `/tdd` | Paginação 0-based, contagem atômica e defaults defensivos. |
| **10** | [Tracer Bullet 4: Atualização Parcial (US-004)](#etapa-10--tracer-bullet-4-atualização-parcial-us-004) | `/implement` + `/tdd` | PATCH semântico, revalidação de invariantes e otimização no-op. |
| **11** | [Tracer Bullet 5: Remoção Lógica (US-005)](#etapa-11--tracer-bullet-5-remoção-lógica-us-005) | `/implement` + `/tdd` | Soft delete como regra de domínio e resposta HTTP 204 No Content. |
| **12** | [Validação no Seam Superior e Code Review](#etapa-12--validação-no-seam-superior-e-code-review) | `/code-review` + Playwright | Bateria de testes de jornada black-box, quality gates e revisão em dois eixos. |

---

## Etapa 0 — Setup e Governança Inicial

**Objetivo:** Partir do template limpo, instalar as skills no seu editor e configurar a estratégia de rastreamento de tarefas.

Siga a **[Etapa 0 comum (SETUP.md)](./SETUP.md)**, seções 1, 2 e 3: clone o template, crie a branch de exercício, valide os quality gates e garanta que cada editor enxergue as skills que o template já traz em `.agents/skills/`: Antigravity, Zed e Codex leem a pasta direto; o Claude Code precisa dos symlinks em `.claude/skills/` descritos lá. **Não** reinstale as skills com `npx skills add`, pois isso sobrescreve a trava de commit do template.

Executamos o setup interativo via agente:
```text
Usuário: /setup-matt-pocock-skills
```

O agente analisa o repositório e estabelece:
1. **Issue Tracker:** Local Markdown (armazena tickets em `.scratch/<feature>/issues/`, perfeito para workshops e execução offline sem depender do GitHub).
2. **Triage Labels:** Canonical defaults (`needs-triage`, `ready-for-agent`, `ready-for-human`, `wontfix`).
3. **Domain Docs:** Configuração em Single-Context (`CONTEXT.md` na raiz e `docs/adr/` para decisões).

O resultado gera `docs/agents/issue-tracker.md` e `docs/agents/domain.md` e acrescenta ao `AGENTS.md` a seção que as demais skills consultam:
```markdown
## Agent skills

### Issue tracker
Local markdown files under `.scratch/<feature-slug>/issues/`. See `docs/agents/issue-tracker.md`.

### Domain docs
Single-context (`CONTEXT.md` at root and `docs/adr/`). See `docs/agents/domain.md`.
```

---

## Etapa 1 — Bootstrap e Deep Modules

**Objetivo:** Compreender a estrutura base da Clean Architecture com foco em **módulos profundos**.

Invocamos a skill de design:
```text
Usuário: Analise nossa arquitetura em src/ com a disciplina da skill codebase-design.
```

### O Que é um Deep Module no NestJS?
```text
                 INTERFACE ESTREITA (Fácil de usar, difícil de errar)
                                │
               TaskController.create(dto: CreateTaskDto)
                                │
                                ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 IMPLEMENTAÇÃO PROFUNDA                      │
  │                                                             │
  │  • Validação rigorosa de invariantes (Task.create)         │
  │  • Geração de UUID v4 determinístico                        │
  │  • Timestamping em UTC                                      │
  │  • Desacoplamento via Port Abstrato (TaskRepository)        │
  │  • Mapeamento de persistência com Drizzle ORM               │
  │  • Propagação controlada de falhas para o filtro global     │
  └─────────────────────────────────────────────────────────────┘
```

Validamos a compilação e a suíte inicial de testes:
```bash
pnpm check       # Biome: linter e formatação
pnpm build       # Compilação estrita do TypeScript
pnpm test        # Testes unitários com Vitest
```

---

## Etapa 2 — Sabatina Técnica e Modelagem de Domínio

**Objetivo:** Pegar as User Stories entregues pelo PO (`workshop/user-stories/README.md`) e submetê-las a uma **sabatina técnica profunda** com a IA para resolver lacunas arquiteturais e registrar decisões duráveis.

Invocamos:
```text
Usuário: /grill-with-docs Avalie as User Stories em workshop/user-stories/README.md para o MVP de Gestão de Tarefas e me sabatine sobre as decisões técnicas pendentes.
```

### Como a IA Opera no Grilling
A IA assume o papel de Staff Engineer e trabalha a **árvore de decisões em rodadas (*rounds*)**, apresentando perguntas numeradas com sua **recomendação justificada**:

```text
❓ Q1 - Tratamento de Soft Delete em Atualizações:
O PO define soft delete na US-005. Se um cliente disparar PATCH /tasks/{id} em uma tarefa já deletada logicamente, qual o comportamento esperado?
👉 Recomendação: Retornar 404 Not Found com código TASK_NOT_FOUND, pois para a API pública tarefas deletadas são inexistentes.

❓ Q2 - Idempotência e Semântica de PATCH No-op:
Na US-004, se o payload do PATCH não contiver alterações ou reenviar os mesmos dados, devemos atualizar o banco?
👉 Recomendação: Tratar como no-op. O use case detecta igualdade e retorna 200 OK sem disparar UPDATE no banco de dados e sem alterar updatedAt.

❓ Q3 - Inversão de Dependência no NestJS:
No NestJS é comum usar tokens strings (@Inject('TASK_REPO')). Como modelar os ports no domínio?
👉 Recomendação: Usar classes abstratas TypeScript como ports. Elas atuam como tipo estático e token nativo de injeção, sem tokens mágicos.
```

À medida que o desenvolvedor responde e confirma:
- O **`CONTEXT.md`** é criado e refinado inline com termos precisos (*Task, Soft Delete, Idempotência, Seam*).
- O **ADR `docs/adr/0001-clean-architecture-dip.md`** é registrado para formalizar a Inversão de Dependência via classes abstratas.

---

## Etapa 3 — Especificação Formal com Seams

**Objetivo:** Sintetizar todo o alinhamento da conversa em uma especificação canônica formal sem re-entrevistar o usuário.

Na **mesma janela de contexto** (sem dar `/clear`), invocamos:
```text
Usuário: /to-spec Sintetize a especificação técnica formal para a API de Gestão de Tarefas.
```

### O Que o `/to-spec` Faz
1. **Acordo Prévio das Costuras (*Seams*):** Antes de escrever a prosa, o agente propõe as costuras públicas onde o sistema será testado:
   - *Seam de Negócio:* Use Cases testados com mocks das portas abstratas.
   - *Seam de Integração HTTP:* Supertest em memória contra os controllers.
   - *Seam Superior:* Playwright contra a API real sobre HTTP.
2. **User Stories Extensas:** Descreve exaustivamente o comportamento esperado no formato `As an <actor>, I want <feature>, so that <benefit>`.
3. **Decisões sem Acoplamento Frágil:** Registra contratos, validações e regras sem citar nomes voláteis de arquivos.

O `/to-spec` publica o documento diretamente no issue tracker oficial do repositório em `.scratch/tasks/spec.md`.

---

## Etapa 4 — Decomposição em Grafo de Tracer Bullets

**Objetivo:** Transformar a especificação em fatias verticais estreitas com dependências explícitas.

Na mesma sessão, invocamos:
```text
Usuário: /to-tickets
# (ou explicitando o caminho: /to-tickets .scratch/tasks/spec.md)
```

### Regras do Fatiamento Vertical
- Cada ticket corta todas as camadas necessárias para entregar um comportamento observável.
- Cada ticket declara explicitamente seu campo `Blocked by:`.
- O time trabalha consumindo a **fronteira** de tickets cujos bloqueadores já estão resolvidos.

```text
       [01: US-007 Error Response]
                   │
                   ▼
       [02: US-006 API Key Guard]
                   │
                   ▼
       [03: US-001 Criar Tarefa] ◄── Fronteira para as próximas
         │         │         │
         ▼         ▼         ▼
     [04: US-003] [05: US-002] [06: US-004]
     (Consultar)  (Listar)     (Atualizar)
         │
         ▼
     [07: US-005] (Remover)
```

Os tickets são gerados em `.scratch/tasks/issues/01-error-response-standardization.md`, `02-api-key-auth-guard.md`, e assim por diante, um arquivo por fatia.

---

## Etapa 5 — Enabler 1: Padronização de Erros (US-007)

**Ticket:** `.scratch/tasks/issues/01-error-response-standardization.md`  
**Objetivo:** Garantir que toda falha da API retorne `{ code, message, details? }` de forma previsível.

Invocamos a implementação guiada por TDD:
```text
Usuário: /implement .scratch/tasks/issues/01-error-response-standardization.md usando /tdd na costura do filtro global.
```

### Ciclo TDD
1. **Red:** Escrever o teste unitário do `GlobalExceptionFilter` em `src/adapters/api/filters/global-exception.filter.spec.ts` afirmando que o lançamento de uma `DomainException` resulta em JSON formatado com o código semântico correspondente.
2. **Green:** Implementar `DomainException` em `src/domain/exception/` e o `GlobalExceptionFilter` interceptando exceções de domínio e HTTP.
3. **Refactor:** Registrar globalmente no `AppModule` via `APP_FILTER`:
```typescript
{
  provide: APP_FILTER,
  useClass: GlobalExceptionFilter,
}
```

---

## Etapa 6 — Enabler 2: API Key Guard (US-006)

**Ticket:** `.scratch/tasks/issues/02-api-key-auth-guard.md`  
**Objetivo:** Proteger universalmente todos os endpoints contra acessos não autorizados.

### Padrão: Secure by Default
Registramos o `ApiKeyGuard` no `AppModule` como `APP_GUARD`. Rotas públicas usam o decorator `@Public()`.

### Ciclo TDD
1. **Red:** Teste unitário em `api-key.guard.spec.ts` validando:
   - Requisição sem cabeçalho `x-api-key` ➔ lança `UnauthorizedException`.
   - Cabeçalho com valor incorreto ➔ lança `UnauthorizedException`.
   - Rota decorada com `@Public()` ➔ permite acesso sem cabeçalho.
   - Cabeçalho válido ➔ autoriza a requisição.
2. **Green:** Implementar `ApiKeyGuard` injetando `Reflector` e `ConfigService`.
3. **Verificação:** Rodar `pnpm test` e registrar o ticket como concluído.

---

## Etapa 7 — Tracer Bullet 1: Criação de Tarefa (US-001)

**Ticket:** `.scratch/tasks/issues/03-create-task.md`  
**Objetivo:** Implementar a primeira fatia vertical completa de negócio, estabelecendo os padrões fundamentais do domínio.

### 1. Entidade Rica de Domínio (*Rich Domain Model*)
Iniciamos com TDD puro no modelo: `src/domain/model/task.model.spec.ts`.
- Validação no construtor ou método de fábrica: título obrigatório de 3 a 100 caracteres, descrição opcional de até 2000.
- Estado inicial obrigatório: `TaskStatus.PENDING`.
- Zero dependências de NestJS ou decorators de validação na camada de domínio.

### 2. Inversão de Dependência com Classes Abstratas
Criamos o contrato em `src/domain/ports/repository/task.repository.ts`:
```typescript
export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>
  abstract findById(id: string): Promise<Task | null>
  abstract findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>
  abstract update(task: Task): Promise<Task>
  abstract delete(id: string): Promise<void>
}
```

### 3. Use Case & Propagação de Erros
Criamos `CreateTaskUseCase`. Testamos via TDD:
- Dados válidos ➔ persiste via repositório e retorna a entidade.
- Falha no repositório ➔ erro é propagado integralmente sem engolir exceções.

### 4. Persistência Drizzle ORM
Criamos a tabela fortemente tipada em `src/adapters/database/schemas/task.schema.ts` e implementamos `TaskRepositoryImpl`.

### 5. Controller & Validação na Borda
Implementamos `TaskController` com `POST /tasks`, validando o payload com `CreateTaskDto` e respondendo HTTP 201 Created.

---

## Etapa 8 — Tracer Bullet 2: Consulta por ID (US-003)

**Ticket:** `.scratch/tasks/issues/04-get-task-by-id.md`  
**Objetivo:** Implementar consulta por UUID garantindo respeito ao soft delete.

### Destaques de Engenharia
1. **Validação Rápida na Borda:** Usar `new ParseUUIDPipe({ version: '4' })` no controller para rejeitar IDs malformatados antes de alcançar o use case ou o banco de dados.
2. **Soft Delete Query no Drizzle:**
   ```typescript
   and(eq(tasks.id, id), isNull(tasks.deletedAt))
   ```
3. **Exceção Semântica de Negócio:** Caso a tarefa não exista ou esteja excluída logicamente, o caso de uso dispara `TaskNotFoundException` que o filtro global converte em HTTP 404 (`code: "TASK_NOT_FOUND"`).

---

## Etapa 9 — Tracer Bullet 3: Listagem Paginada (US-002)

**Ticket:** `.scratch/tasks/issues/05-list-tasks-paginated.md`  
**Objetivo:** Listar tarefas ativas com paginação defensiva 0-based e contagem atômica.

### Destaques de Engenharia
1. **DTO de Consulta com Defaults Defensivos:**
   - `page = 0`, `pageSize = 10`, `@Max(100)`.
2. **Contagem Atômica:** Executar consulta de agregação `count()` em paralelo à busca de itens com `limit` e `offset`, garantindo metadados consistentes de totalização.
3. **DTO de Resposta Paginada:**
   ```typescript
   export class PaginatedTasksResponseDto {
     items: TaskResponseDto[]
     total: number
     page: number
     pageSize: number
   }
   ```

---

## Etapa 10 — Tracer Bullet 4: Atualização Parcial (US-004)

**Ticket:** `.scratch/tasks/issues/06-update-task-partial.md`  
**Objetivo:** Implementar PATCH semântico com revalidação de invariantes no domínio.

### Destaques de Engenharia
1. **Semântica `null` vs `undefined`:**
   - `undefined` (omitido no JSON): mantém o valor existente.
   - `null`: limpa o campo (ex: descrição opcional).
2. **Método `task.update()` na Entidade:** A própria entidade recebe as alterações, valida se a transição de status é permitida e atualiza `updatedAt`.
3. **Otimização No-op:** Se nenhuma alteração for detectada, o use case retorna a tarefa imediatamente sem disparar queries desnecessárias de `UPDATE` no PostgreSQL.

---

## Etapa 11 — Tracer Bullet 5: Remoção Lógica (US-005)

**Ticket:** `.scratch/tasks/issues/07-delete-task-soft-delete.md`  
**Objetivo:** Implementar soft delete garantindo integridade referencial e resposta HTTP 204 No Content.

### Destaques de Engenharia
1. **Regra de Negócio de Soft Delete:**
   - Método `task.delete()` marca `deletedAt = new Date()`.
   - Se a tarefa já foi excluída, dispara `TaskNotFoundException`.
2. **Interrupção de Efeitos Colaterais:** O repositório jamais é invocado se a entidade falhar em sua validação prévia de existência ou estado.
3. **Resposta 204:** Rota `DELETE /tasks/:id` decorada com `@HttpCode(HttpStatus.NO_CONTENT)`.

---

## Etapa 12 — Validação no Seam Superior e Code Review

**Objetivo:** Executar testes de jornada ponta a ponta na costura pública máxima e realizar revisão automatizada em dois eixos com subagentes.

### 1. Testes de Jornada com Playwright (`tests/playwright/tasks-api.pw.ts`)

O template não traz o Playwright. Instale e configure seguindo a [seção 6 do SETUP.md](./SETUP.md#6-preparar-o-playwright-antes-da-etapa-12) antes de pedir ao agente para escrever a jornada.

O Playwright testa a API como um cliente real caixa-preta via chamadas HTTP contra a aplicação em container:
- Cria tarefa (`POST /tasks` ➔ 201).
- Consulta tarefa (`GET /tasks/:id` ➔ 200).
- Atualiza status (`PATCH /tasks/:id` ➔ 200).
- Verifica na listagem (`GET /tasks` ➔ 200).
- Remove tarefa (`DELETE /tasks/:id` ➔ 204).
- Confirma soft delete (`GET /tasks/:id` ➔ 404).
- Testa segurança global sem chave (`GET /tasks` sem header ➔ 401).

### 2. Code Review Automatizado em Dois Eixos
Invocamos a skill `/code-review` do Matt Pocock:

```text
Usuário: /code-review HEAD~8...HEAD
```

A skill dispara **dois subagentes paralelos**:
1. **Eixo Standards (Padrões de Código & Code Smells):**
   - Analisa o diff contra `docs/CODING_STANDARDS.md` e as regras do repositório (`.agents/rules/`).
   - Avalia a lista canônica de **Code Smells do Martin Fowler** (*Primitive Obsession*, *Feature Envy*, *Data Clumps*, *Shotgun Surgery*, *Speculative Generality*).
2. **Eixo Spec Fidelity (Aderência à Especificação):**
   - Compara o diff linha a linha contra a spec que você gerou em `.scratch/tasks/spec.md`.
   - Aponta requisitos esquecidos, regras mal interpretadas ou código supérfluo (*scope creep*).

### 3. Bateria Completa de Quality Gates
```bash
pnpm check              # Biome: zero erros de lint e formatação
pnpm build              # TypeScript: compilação estrita sem any
pnpm test               # Vitest: 100% dos testes unitários passando
pnpm test:cov           # Cobertura de código (>95% em domain e use cases)
pnpm test:pw            # Playwright: jornada completa sobre HTTP real
```

---

## 🧭 Quando Estiver em Dúvida: Use `/ask-matt`

O conjunto de skills conta com um roteador autônomo inteligente chamado `/ask-matt`. Se em qualquer momento do fluxo você ou os participantes não tiverem certeza de qual skill ou comando chamar:

```text
Usuário: /ask-matt Acabei de receber uma alteração de requisito do PO no meio do desenvolvimento. Qual skill devo usar?
```

O agente analisa a situação e indica exatamente a skill recomendada (ex.: se deve rodar `/grill-with-docs`, bifurcar para `/wayfinder` ou se é um ajuste direto via `/tdd`).

---

## 🏆 Conclusão do Workshop

Ao término do workshop, a equipe compreende a essência do **Spec-Driven Development real**:
- **Especificações não são burocracia:** são a definição precisa do problema e das costuras de teste antes de investir horas de codificação.
- **Grilling elimina retrabalho:** sabatinar suposições no início custa minutos; corrigir suposições erradas em produção custa semanas.
- **Tracer Bullets garantem velocidade e previsibilidade:** fatias verticais estreitas eliminam o "inferno de integração" comum em arquiteturas em camadas.
- **TDD nas costuras públicas liberta o código:** refatorar a infraestrutura torna-se trivial quando os testes não tocam detalhes internos.
- **Subagentes de IA são amplificadores de rigor:** a IA atua como parceira de design, geradora de specs e revisora impiedosa de padrões de engenharia.
