## Why

Permitir que clientes autenticados atualizem parcialmente dados de uma tarefa existente (como alteração de título, limpeza ou edição de descrição e transição de status entre `PENDING`, `IN_PROGRESS` e `DONE`), garantindo a preservação dos campos não enviados, validação rigorosa de invariantes no modelo rico de domínio e atualização atômica de `updatedAt`.

## What Changes

- Adição do método de negócio `update(props: UpdateTaskProps): boolean` na entidade rica `Task` (`src/domain/model/task.model.ts`), revalidando invariantes, tratando a semântica de `undefined` (manter valor) vs `null` (limpar descrição) e renovando `updatedAt`.
- Atualização do DTO `UpdateTaskDto` (`src/adapters/api/dto/update-task.dto.ts`) para suportar explicitamente `description?: string | null` com decorators compatíveis.
- Implementação do caso de uso `UpdateTaskUseCase` em `src/domain/usecase/update-task.usecase.ts`, que localiza a tarefa pelo ID via `TaskRepository.findById`, lança `TaskNotFoundException` para ID inexistente ou registro removido (soft delete), aplica `task.update()` com otimização no-op (não grava no banco se nada mudou) e persiste via `TaskRepository.update`.
- Atualização do endpoint `PATCH /tasks/:id` no `TasksController` com validação de UUID via `new ParseUUIDPipe({ version: '4' })`, injeção de `UpdateTaskUseCase` e mapeamento de saída para `TaskResponseDto`.
- Registro e exportação de `UpdateTaskUseCase` no `TasksModule`.
- Suítes completas de testes unitários para a entidade `Task`, use case `UpdateTaskUseCase` e controller `TasksController`.

## Capabilities

### Modified Capabilities

- `task-api`: Refinamento do requisito "Atualização parcial de tarefa" (PATCH `/tasks/{id}`), detalhando validação estrita de UUID, preservação de campos omitidos, suporte a limpeza de descrição com `null`, resposta com dados atualizados e retorno de HTTP 404 (`TASK_NOT_FOUND`) para tarefas inexistentes ou deletadas.

## Impact

- **Domínio**: Extensão de `Task` com o método `update()` e interface `UpdateTaskProps`; criação de `UpdateTaskUseCase` reexportado no barrel de use cases.
- **DTOs da API**: Ajuste em `UpdateTaskDto` para acomodar `description?: string | null`.
- **Controller & Módulo**: Atualização do endpoint `PATCH /tasks/:id` em `TasksController` e injeção/exportação no `TasksModule`.
- **Testes**: Testes unitários para invariantes de atualização em `task.model.spec.ts`, criação de `update-task.usecase.spec.ts` e novos casos em `tasks.controller.spec.ts`.
