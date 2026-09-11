## Why

No modelo Spec-Driven Development (SDD), a especificação atua como a Fonte Única da Verdade (SSOT) antes do início da implementação do código de produção. Para guiar o desenvolvimento das User Stories do MVP de Task Management (US-001 a US-007), é necessário estabelecer formalmente os contratos de API, schemas de entrada e saída, esquema de segurança transversal (`ApiKeyAuth`) e a padronização de respostas de erro (`ErrorResponse`).

## What Changes

- Definição dos schemas de domínio e transferência: `Task`, `CreateTaskInput`, `UpdateTaskInput`, `TaskStatus`, `PaginatedTasksResponse` e `ErrorResponse`.
- Definição do esquema de segurança global `ApiKeyAuth` via header `x-api-key` (US-006).
- Especificação dos endpoints REST de gerenciamento de tarefas com rastreabilidade direta para as User Stories:
  - `POST /tasks` (rastreabilidade: US-001)
  - `GET /tasks` (rastreabilidade: US-002)
  - `GET /tasks/{id}` (rastreabilidade: US-003)
  - `PATCH /tasks/{id}` (rastreabilidade: US-004)
  - `DELETE /tasks/{id}` (rastreabilidade: US-005)
- Definição formal das respostas de sucesso (200, 201, 204) e dos códigos de erro esperados (400, 401, 404, 500) utilizando `ErrorResponse` (US-007).

## Capabilities

### New Capabilities

- `task-api`: Especificação formal dos contratos de API REST para gerenciamento de tarefas, cobrindo endpoints CRUD, autenticação via API Key e padronização global de erros.

### Modified Capabilities

Nenhuma. Trata-se da primeira capacidade de negócio introduzida no projeto.

## Impact

- **Documentação e Contratos**: Criação da especificação OpenSpec em `specs/task-api/spec.md` e alinhamento do contrato servido via Swagger em `/api/docs`.
- **Rastreabilidade**: Estabelece a ancoragem para as User Stories US-001 a US-007.
- **Implementação futura**: Serve como guia de contrato para DTOs, controllers, services e suítes de testes unitários e E2E.
