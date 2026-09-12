## Why

Atualmente, o endpoint `GET /tasks/:id` possui apenas um esqueleto que lança erro de método não implementado. Para atender à US-003 e permitir que usuários autenticados consultem os dados completos de uma tarefa existente a partir de seu identificador único (UUID) — confirmando seu status atual e respeitando a política de soft delete — é necessário implementar o fluxo de consulta unitária por ID.

## What Changes

- Criação da exceção de domínio `TaskNotFoundException` em `src/domain/exception/task-not-found.exception.ts` configurada com `errorCode: 'TASK_NOT_FOUND'` e `statusCode: 404`.
- Implementação do caso de uso `GetTaskByIdUseCase` em `src/domain/usecase/get-task-by-id.usecase.ts` injetando `TaskRepository` e disparando `TaskNotFoundException` caso a tarefa não seja localizada.
- Atualização do endpoint `GET /tasks/:id` no `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`) com `new ParseUUIDPipe({ version: '4' })` para validação rápida na borda e mapeamento da resposta para `TaskResponseDto`.
- Registro do provider `GetTaskByIdUseCase` no `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`).
- Criação de testes unitários para `GetTaskByIdUseCase` e atualização dos testes do `TasksController` cobrindo sucesso e cenários de erro (tarefa inexistente e UUID inválido).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `task-api`: Refinamento dos cenários de consulta de tarefa por ID (`GET /tasks/{id}`), formalizando o retorno de HTTP 200 para tarefas ativas, HTTP 404 (`TASK_NOT_FOUND`) para tarefas inexistentes ou com soft delete e HTTP 400 (`VALIDATION_ERROR`) para identificador inválido.

## Impact

- **API**: Endpoint `GET /tasks/:id` torna-se funcional e operacional para clientes autenticados.
- **Domínio**: Introdução da exceção `TaskNotFoundException`, que será reutilizada nas operações de atualização (US-004) e remoção (US-005).
- **Tratamento de Erros**: Resposta HTTP 404 formatada de acordo com o contrato global `ErrorResponse`.
