# Spec: Task Management API (MVP)

**Status:** ready-for-agent  
**Triage Role:** ready-for-agent  
**Related ADRs:** [ADR-0001](../../docs/adr/0001-clean-architecture-and-dip.md), [ADR-0002](../../docs/adr/0002-soft-delete-strategy.md)  
**Domain Context:** [CONTEXT.md](../../CONTEXT.md)

---

## Problem Statement

Desenvolvedores e sistemas integradores precisam de um mecanismo confiável, padronizado e seguro para gerenciar tarefas e acompanhar atividades. Sem uma especificação clara e contratos formais, APIs de gestão de tarefas costumam sofrer com dados corrompidos (títulos vazios, estados inconsistentes), exclusões acidentais irreversíveis por falta de auditoria, formatos discrepantes de tratamento de erro e ausência de mecanismos básicos de segurança.

## Solution

Construir uma API RESTful corporativa em NestJS 11, Fastify/Express, Drizzle ORM e PostgreSQL que implemente o ciclo completo de gerenciamento de tarefas:
- Criação e validação rigorosa de dados no modelo de domínio.
- Consulta unitária e listagem paginada 0-based excluindo itens inativos.
- Atualização parcial semântica (PATCH) com suporte a *no-op* e limpeza explícita de campos opcionais.
- Exclusão lógica (*soft delete*) com interrupção de efeitos colaterais.
- Segurança *Secure by Default* com autenticação via `x-api-key`.
- Contrato padronizado de erro `ErrorResponse` em todas as falhas.

---

## User Stories

1. As an API consumer, I want to create a task with a title, optional description, and optional status, so that I can track work items (US-001).
2. As an API consumer, I want the task title to be mandatory and strictly between 3 and 100 characters, so that every task has a meaningful summary (US-001).
3. As an API consumer, I want the task description to support up to 2000 characters, so that detailed instructions or notes can be stored (US-001).
4. As an API consumer, I want the task status to default to `PENDING` when omitted during creation, so that new tasks start in a predictable state (US-001).
5. As an API consumer, I want invalid status values to be rejected with HTTP 400 Bad Request, so that invalid states never enter the database (US-001).
6. As an API consumer, I want successful task creation to return HTTP 201 Created containing the generated UUID, timestamps, and current attributes, so that I can track the created resource (US-001).
7. As an API consumer, I want to retrieve a task by its unique UUID (GET `/tasks/:id`), so that I can inspect its complete current state (US-003).
8. As an API consumer, I want retrieving a non-existent or soft-deleted task to return HTTP 404 Not Found (`TASK_NOT_FOUND`), so that inactive tasks remain inaccessible (US-003).
9. As an API consumer, I want malformed UUID path parameters to be rejected immediately at the HTTP boundary with HTTP 400 Bad Request, so that invalid requests fail fast (US-003).
10. As an API consumer, I want to list tasks with zero-based pagination (`page`, `pageSize`), so that I can fetch tasks in predictable chunks without overloading the server (US-002).
11. As an API consumer, I want the paginated list to include the total count of active tasks along with the current page and page size, so that client applications can render pagination controls (US-002).
12. As an API consumer, I want the paginated list to strictly ignore soft-deleted tasks, so that obsolete items do not pollute listings (US-002).
13. As an API consumer, I want `pageSize` to default to 10 and be capped at a maximum of 100 items, so that database queries remain performant (US-002).
14. As an API consumer, I want to partially update a task (PATCH `/tasks/:id`) providing any combination of title, description, or status, so that I only send what changed (US-004).
15. As an API consumer, I want sending `null` for description in a PATCH request to clear the description, so that optional text can be explicitly removed (US-004).
16. As an API consumer, I want omitted fields in a PATCH request to retain their existing values, so that partial updates do not overwrite unrelated data (US-004).
17. As an API consumer, I want sending a PATCH request with no changes to perform a no-op and return the existing task without triggering unnecessary database updates, so that writes are optimized (US-004).
18. As an API consumer, I want `updatedAt` to be updated whenever task attributes change, so that audit trails reflect recent modifications (US-004).
19. As an API consumer, I want updating a non-existent or soft-deleted task to return HTTP 404 Not Found, so that modifications on dead records are prevented (US-004).
20. As an API consumer, I want to soft delete a task (DELETE `/tasks/:id`), so that its `deletedAt` timestamp is populated while preserving historical records (US-005).
21. As an API consumer, I want deleting an active task to return HTTP 204 No Content, so that REST semantics are honored (US-005).
22. As an API consumer, I want attempting to delete an already-deleted or non-existent task to return HTTP 404 Not Found, so that side effects are halted before touching persistence (US-005).
23. As an API consumer, I want all endpoints to require a valid `x-api-key` header matching the environment configuration, so that unauthorized requests are blocked (US-006).
24. As an API consumer, I want missing or invalid API keys to return HTTP 401 Unauthorized with code `UNAUTHORIZED`, so that authentication failures are uniform (US-006).
25. As an API consumer, I want public utility endpoints (such as health check `/actuator/health`) to bypass authentication using a `@Public()` decorator, so that infrastructure probes work seamlessly (US-006).
26. As an API consumer, I want all error responses across the API to adhere strictly to the `{ code, message, details? }` contract, so that client error handling is consistent (US-007).

---

## Implementation Decisions

### Architectural Layering & Clean Architecture
- **Domain Layer (`src/domain/`)**:
  - Entity `Task`: Rich domain model protecting its invariants in the constructor and business methods (`update`, `delete`). Framework-free and purely TypeScript.
  - Value Types / Enums: `TaskStatus` (`PENDING`, `IN_PROGRESS`, `DONE`).
  - Repository Port: `export abstract class TaskRepository` defined in `src/domain/ports/repository/task.repository.ts`.
- **Adapters Layer (`src/adapters/`)**:
  - Database: `TaskRepositoryImpl` implementing `TaskRepository` using Drizzle ORM queries over PostgreSQL.
  - API / Presentation: Controllers with class-validator DTOs, NestJS pipes (`ParseUUIDPipe`), and filters.
  - Security: `ApiKeyGuard` implementing `CanActivate` registered as `APP_GUARD` in `AppModule`.

### State Transitions & Business Logic
- Status transitions between `PENDING`, `IN_PROGRESS` and `DONE` are freely allowed in the MVP.
- Soft Delete is enforced at the domain level: `task.delete()` sets `deletedAt = new Date()`. If already deleted, it throws a `TaskNotFoundException` immediately.
- Update semantics: `undefined` leaves value unchanged; `null` clears `description`.

### Database Schema (Drizzle ORM)
- Table `tasks`:
  - `id`: UUID (Primary Key, default random).
  - `title`: `varchar(100)` NOT NULL.
  - `description`: `varchar(2000)` NULL.
  - `status`: `varchar(20)` NOT NULL (values: `PENDING`, `IN_PROGRESS`, `DONE`).
  - `created_at`: `timestamp with time zone` NOT NULL (default now).
  - `updated_at`: `timestamp with time zone` NOT NULL (default now).
  - `deleted_at`: `timestamp with time zone` NULL.

---

## Testing Decisions

### O que torna um teste valioso (Princípios)
- Testar sempre nas **costuras públicas (seams)** observando comportamento externo, e **nunca** testar métodos privados ou detalhes de implementação interna.
- Testes devem ser imunes a refatorações estruturais contanto que o comportamento observável permaneça idêntico.
- Evitar testes tautológicos: valores esperados devem vir de constantes conhecidas ou regras da especificação.

### Costuras de Teste Acordadas (Test Seams)
1. **Costura de Domínio (`src/domain/model/task.model.spec.ts`)**:
   - Validação de título obrigatório, limites de 3 a 100 caracteres.
   - Limite de 2000 caracteres na descrição.
   - Status padrão `PENDING` e rejeição de status inválidos.
   - Comportamento de mutação em `update()` e `delete()`.
   - 100% de cobertura de branches nas invariantes.
2. **Costura de Casos de Uso (`src/domain/usecase/*.spec.ts`)**:
   - Criação, leitura, listagem, atualização e exclusão testados contra o mock da classe abstrata `TaskRepository`.
   - Verificação de propagação de erros (*fail-fast*) e garantia de que falhas de validação abortam o fluxo antes de invocar persistência.
3. **Costura de Borda HTTP (`src/adapters/api/**/*.spec.ts` e `tests/e2e/`)**:
   - Validação do `ApiKeyGuard` (sem chave, chave inválida, chave válida, rota com `@Public()`).
   - Validação do `AllExceptionsFilter` e formatação padronizada de `ErrorResponse`.
   - Validação de DTOs, parsing de UUID v4 e status codes (201, 200, 204, 400, 401, 404, 500).

---

## Out of Scope

- Autenticação avançada via JWT, OAuth2 ou controle de permissões baseado em papéis (RBAC).
- Múltiplos usuários ou segregação de tarefas por proprietário/tenant (todas as tarefas pertencem ao espaço de trabalho da API no MVP).
- Atributos adicionais como prioridade, categorias, etiquetas (*tags*) ou data de vencimento (*due date*).
- Máquina de estados complexa com proibição de regressão de status.
- Remoção física definitiva (*hard delete*) via endpoint da API.
- Webhooks ou notificações assíncronas de alteração de estado.

---

## Further Notes

- Esta especificação consolida integralmente as User Stories US-001 a US-007 descritas em `docs/user-stories.md`.
- As decisões técnicas e arquiteturais obedecem estritamente às diretrizes de [AGENTS.md](../../AGENTS.md), [CONTEXT.md](../../CONTEXT.md), [ADR-0001](../../docs/adr/0001-clean-architecture-and-dip.md) e [ADR-0002](../../docs/adr/0002-soft-delete-strategy.md).
