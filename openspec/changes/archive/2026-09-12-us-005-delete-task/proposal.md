## Why

Permitir que usuários autenticados removam tarefas obsoletas ou concluídas, mantendo a lista de tarefas organizada. A exclusão adota o padrão de negócio de soft delete (`deletedAt`), preservando integridade referencial e possibilitando auditoria futura, enquanto assegura que tarefas deletadas deixem de ser retornadas em consultas ativas e listagens.

## What Changes

- Implementar o método `delete(): void` na entidade rica `Task` (`src/domain/model/task.model.ts`), marcando o timestamp `_deletedAt` e garantindo que uma tarefa já deletada não possa ser removida novamente (defesa de invariante).
- Criar o caso de uso `DeleteTaskUseCase` (`src/domain/usecase/delete-task.usecase.ts`), validando existência via `TaskRepository.findById(id)`, disparando `TaskNotFoundException` quando inexistente ou já excluída (interrompendo efeitos colaterais sem tocar o repositório), executando `task.delete()` e persistindo a exclusão via `taskRepository.delete(id)`.
- Atualizar o endpoint `DELETE /tasks/:id` no `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`), adicionando validação de UUID v4 via `new ParseUUIDPipe({ version: '4' })`, invocando o use case e retornando HTTP 204 No Content.
- Registrar e exportar `DeleteTaskUseCase` no `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`).
- Expandir e atualizar suítes de testes unitários para o modelo de domínio, use case e controller.

## Capabilities

### New Capabilities
<!-- Nenhuma nova capacidade -->

### Modified Capabilities
- `task-api`: Refinamento do requisito `Remoção de tarefa via soft delete` estabelecendo a validação de UUID v4 na borda (HTTP 400 com `VALIDATION_ERROR`), retorno HTTP 204 No Content sem corpo em caso de sucesso, retorno HTTP 404 com `ErrorResponse` (`TASK_NOT_FOUND`) para ID inexistente ou já excluído, e garantia de ausência de efeitos colaterais adicionais.

## Impact

- **Domínio**: Atualização de `Task` (`src/domain/model/task.model.ts`) e criação de `DeleteTaskUseCase` (`src/domain/usecase/delete-task.usecase.ts`).
- **API/Adapters**: `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`) e `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`).
- **Contratos/Specs**: Especificação `openspec/specs/task-api/spec.md`.
- **Testes**: `task.model.spec.ts`, `delete-task.usecase.spec.ts`, `tasks.controller.spec.ts`.
