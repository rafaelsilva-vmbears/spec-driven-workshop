## 1. Modelo Rico de Domínio

- [x] 1.1 Implementar o método `delete(): void` na entidade `Task` (`src/domain/model/task.model.ts`), marcando `_deletedAt` e `_updatedAt` com `new Date()` e lançando `TaskValidationException` se a tarefa já estiver excluída (`_deletedAt !== null`). Verificar compilação com `pnpm.cmd run build`.
- [x] 1.2 Atualizar os testes unitários de `Task` em `src/domain/model/task.model.spec.ts` cobrindo a transição de estado ao executar `delete()` e a rejeição de deleção quando a tarefa já está excluída. Executar e validar com `pnpm.cmd test`.

## 2. Caso de Uso DeleteTaskUseCase

- [x] 2.1 Implementar `DeleteTaskUseCase` em `src/domain/usecase/delete-task.usecase.ts` injetando `TaskRepository`, buscando a tarefa por ID, disparando `TaskNotFoundException` quando não encontrada ou excluída (interrompendo o fluxo sem acionar comandos no repositório), executando `task.delete()` e persistindo via `taskRepository.delete(id)`. Reexportar em `src/domain/usecase/index.ts` e verificar compilação com `pnpm.cmd run build`.
- [x] 2.2 Criar testes unitários para `DeleteTaskUseCase` em `src/domain/usecase/delete-task.usecase.spec.ts` validando exclusão com sucesso chamando o repositório, lançamento de `TaskNotFoundException` e garantia de que `taskRepository.delete` não é chamado para tarefa inexistente ou já excluída. Executar e validar com `pnpm.cmd test`.

## 3. Integração na API e Validação Global

- [x] 3.1 Atualizar o endpoint `DELETE /tasks/:id` no `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`), injetando `DeleteTaskUseCase`, aplicando `@Param('id', new ParseUUIDPipe({ version: '4' }))` e retornando `void` com status HTTP 204 No Content.
- [x] 3.2 Registrar e exportar `DeleteTaskUseCase` no `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`). Verificar compilação com `pnpm.cmd run build`.
- [x] 3.3 Atualizar os testes unitários do controller em `src/adapters/api/controllers/tasks.controller.spec.ts` cobrindo o método `delete` com sucesso (204) e propagação de `TaskNotFoundException` (404). Executar e validar com `pnpm.cmd test`.
- [x] 3.4 Executar validação de conformidade e integridade completa com `pnpm.cmd run lint` e `pnpm.cmd test` garantindo zero erros de linter e aprovação de toda a suíte de testes.
